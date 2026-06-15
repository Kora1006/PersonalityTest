# 病毒增长飞轮 — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-15 | v1   | 初始设计 |

## 项目架构

- 架构类型: Monorepo（npm workspaces + Turborepo）
- 涉及层: 小程序前端 / tRPC API / Drizzle DB / 微信开放平台

## 数据模型

```typescript
// packages/db/src/schema/quiz-results.ts 修改
export const quizResults = mysqlTable('quiz_results', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).references(() => users.id),
  scores: json('scores').$type<{ D: number; I: number; S: number; C: number }>(),
  dominantType: varchar('dominant_type', { length: 1 }),
  mode: varchar('mode', { length: 10 }).default('full'),  // 'full' | 'quick'
  isUnlocked: boolean('is_unlocked').default(false),      // 报告是否已解锁
  createdAt: timestamp('created_at').defaultNow(),
})

// packages/db/src/schema/invitations.ts 新增
export const invitations = mysqlTable('invitations', {
  id: varchar('id', { length: 36 }).primaryKey(),
  inviterId: varchar('inviter_id', { length: 36 }).references(() => users.id),
  inviterResultId: varchar('inviter_result_id', { length: 36 }).references(() => quizResults.id),
  inviteeId: varchar('invitee_id', { length: 36 }).references(() => users.id).default(null),
  inviteeResultId: varchar('invitee_result_id', { length: 36 }).references(() => quizResults.id).default(null),
  status: varchar('status', { length: 20 }).default('pending'),  // 'pending' | 'completed'
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
})
```

## 功能模块设计

### 模块 1: 结果分享卡（Canvas 离屏绘制）

**技术方案：**

使用微信小程序 `OffscreenCanvas`（基础库 >= 2.17.0）在内存中绘制图片，再通过 `wx.saveImageToPhotosAlbum` 保存。

```typescript
// apps/miniprogram/src/components/share-card/index.tsx

async function generateShareCard(result: QuizResult) {
  const canvas = wx.createOffscreenCanvas({ type: '2d', width: 750, height: 1334 })
  const ctx = canvas.getContext('2d')

  // 1. 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, 1334)
  gradient.addColorStop(0, '#1a1a2e')
  gradient.addColorStop(1, '#16213e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 750, 1334)

  // 2. 绘制类型标签（大字）
  ctx.font = 'bold 120px sans-serif'
  ctx.fillStyle = getTypeColor(result.dominantType)
  ctx.fillText(result.dominantType, 60, 200)

  // 3. 绘制雷达图（复用 radar-canvas 绘制逻辑）
  drawRadarOnCanvas(ctx, result.scores, { x: 375, y: 600, radius: 200 })

  // 4. 金句文案
  ctx.font = '32px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(getTypeQuote(result.dominantType), 60, 950)

  // 5. 小程序码（提前从服务端获取 buffer）
  const qrcodeImg = await loadImage(qrcodeUrl)
  ctx.drawImage(qrcodeImg, 560, 1150, 140, 140)

  // 6. 品牌水印
  ctx.font = '24px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.fillText('DISC 职业性格测评', 60, 1280)

  // 导出图片
  return canvas.toDataURL('image/png')
}
```

**金句文案配置（每种类型 3 条随机）：**

```typescript
const typeQuotes = {
  D: ['你是把混乱变成系统的人', '在你面前没有问题，只有待解决的挑战', '领导力是你天生的语言'],
  I: ['走进房间，气氛就变了', '你的热情是团队最好的燃料', '影响力是你最强的超能力'],
  S: ['稳定，是最高级的力量', '你是团队真正的锚点', '持续比爆发更有价值'],
  C: ['细节里住着魔鬼，你比魔鬼更熟悉那里', '数据不会说谎，你也不会', '精确，是你给世界最好的礼物'],
}
```

### 模块 2: 好友对比

**邀请参数传递：**

```typescript
// 生成带 inviterId + resultId 的场景值小程序码
// 服务端：POST /api/invitations/create
// 返回：小程序码 buffer（wxacode.get）

// 好友扫码进入时，解析 scene 参数
Taro.getLaunchOptionsSync().scene  // 场景值
// 页面 options.q 中携带 inviterId=xxx&resultId=xxx
```

**双人雷达图叠加：**

```typescript
// 在同一 Canvas 上绘制两个雷达图
// 我的结果：蓝色半透明填充
// 好友结果：橙色半透明填充
// 叠加区域自动混合

function drawComparisonRadar(ctx, myScores, friendScores) {
  drawRadar(ctx, myScores, { fillColor: 'rgba(59, 130, 246, 0.4)', strokeColor: '#3b82f6' })
  drawRadar(ctx, friendScores, { fillColor: 'rgba(249, 115, 22, 0.4)', strokeColor: '#f97316' })
}
```

**对比文案规则（服务端生成）：**

```typescript
// packages/api/src/routers/comparison.ts
function generateComparisonInsight(typeA: string, typeB: string): string {
  const insights: Record<string, string> = {
    'D+S': '你们天然互补：D型负责推进，S型保持稳定，协作默契',
    'D+C': '高效组合：决策力 × 精确度，能做出既快又准的判断',
    'I+S': '温暖组合：氛围营造 × 耐心倾听，团队凝聚力最强',
    // ... 其他组合
  }
  const key = [typeA, typeB].sort().join('+')
  return insights[key] ?? '你们的风格各有特色，互相学习是最大的收获'
}
```

### 模块 3: 邀请解锁机制

**核心流程：**

```
用户 A 点击「邀请解锁」
  → 服务端创建 invitation 记录（inviterId=A, inviterResultId=xxx, status=pending）
  → 返回专属邀请链接（携带 invitationId 参数）
  → A 分享给好友 B、C

好友 B 点击链接 → 完成测评
  → 服务端：更新 invitation.inviteeId=B, status=completed
  → 统计该 resultId 的 completed invitations count
  → count >= 2 → 更新 quiz_results.is_unlocked = true
  → 调用微信订阅消息 API 通知用户 A

用户 A 前端轮询（每 3s）或收到通知 → 刷新解锁状态 → 显示下载按钮
```

**tRPC 接口：**

```typescript
// packages/api/src/routers/invitation.ts
createInvitation: protectedProcedure
  .input(z.object({ resultId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // 创建 invitation 记录，返回邀请链接参数
  }),

getUnlockStatus: protectedProcedure
  .input(z.object({ resultId: z.string() }))
  .query(async ({ input, ctx }) => {
    // 返回 { isUnlocked: boolean, inviteCount: number, needed: 2 }
  }),

completeInvitation: publicProcedure
  .input(z.object({ invitationId: z.string(), inviteeResultId: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // 被邀请人完成测评后调用，更新邀请状态，检查是否达到解锁条件
  }),
```

**微信订阅消息：**

```typescript
// 触发时机：用户完成测评后，主动引导订阅「邀请进度通知」模板
// 发送时机：服务端检测到第 2 个好友完成测评时
await wechatApi.sendSubscribeMessage({
  touser: inviter.wechatOpenid,
  template_id: INVITE_COMPLETE_TEMPLATE_ID,
  data: {
    thing1: { value: '你的深度报告已解锁！' },
    time2: { value: new Date().toLocaleString() },
  },
})
```

### 模块 4: 快速版 12 题

**题目配置：**

```typescript
// packages/api/src/data/questions.ts
export const quickQuestions = fullQuestions.filter(q =>
  QUICK_QUESTION_IDS.includes(q.id)
)

// 选题策略：每个 DISC 维度各选 3 道，覆盖 3 个不同场景维度
const QUICK_QUESTION_IDS = [1, 5, 9, 2, 6, 10, 3, 7, 11, 4, 8, 12]
// 具体题号由产品内容团队确认
```

**路由区分：**

```typescript
// apps/miniprogram/src/pages/quiz/index.tsx
const mode = Taro.getCurrentInstance().router?.params?.mode ?? 'full'
const questions = mode === 'quick' ? quickQuestions : fullQuestions
```

**结果页标注：**

- 快速版结果页顶部显示「快速版 · 12题结果」标签
- 底部固定展示升级引导条：「完成完整版 24 题，获得更精准的职业性格报告 →」

## 接口契约

```typescript
// 新增接口汇总
router.invitation = {
  createInvitation: mutation,      // 创建邀请，返回邀请参数
  getUnlockStatus: query,          // 查询解锁状态（轮询用）
  completeInvitation: mutation,    // 被邀请人完成测评后触发
}

router.comparison = {
  getComparison: query,            // 传入两个 resultId，返回对比数据和文案
}

router.quiz = {
  // 现有接口新增 mode 参数
  submitQuiz: mutation,            // input 新增 mode: 'full' | 'quick'
}

router.share = {
  getMiniQrcode: query,            // 获取小程序码 buffer（服务端调用微信 API）
}
```

## 安全考虑

- `completeInvitation` 接口需校验：被邀请人确实完成了测评（resultId 存在且 userId 匹配）
- 同一用户被邀请 N 次，只计 1 次（按 inviteeId 去重）
- 邀请人不能邀请自己（inviterId !== inviteeId）
- 解锁状态由服务端决定，前端不可通过参数篡改

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 分享卡生成 | OffscreenCanvas 前端绘制 | 无服务端截图成本，响应快 | 服务端 Puppeteer 截图（费资源）|
| 解锁状态同步 | 前端 3s 轮询 | 实现简单，小程序长连接成本高 | WebSocket（成本高，杀鸡用牛刀）|
| 邀请计数 | 服务端数据库去重统计 | 防伪造，数据可靠 | 前端本地计数（不安全）|
| 订阅消息 | 微信官方订阅消息 | 唯一合规的主动推送方式 | 服务通知（已下线）|
