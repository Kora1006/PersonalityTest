# wechat-share-card — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始设计 |

## 项目架构

- 架构类型: Monorepo (Turborepo)
- 涉及层: 后端 Hono 路由、tRPC router、前端 React Hook、前端路由页面

---

## 功能模块设计

### 模块 1: JSSDK 签名接口（后端）

**文件**: `apps/server/src/wechat.ts`（已有，追加新路由）

**接口**: `GET /api/auth/wechat/jssdk-signature?url=<encoded_url>`

**逻辑**:
1. 调用已有 `getMpAccessToken()` 获取 access_token
2. 用 access_token 请求微信 jsapi_ticket：
   ```
   GET https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=xxx&type=jsapi
   ```
3. jsapi_ticket 单独缓存（与 `cachedAccessToken` 并列，新增 `cachedJsapiTicket` 变量），有效期 2 小时
4. 生成签名字符串（字典序，全小写 key）：
   ```
   jsapi_ticket=xxx&noncestr=xxx&timestamp=xxx&url=xxx
   ```
   SHA1 哈希后返回
5. 返回 `{ appId, timestamp, nonceStr, signature }`
6. `WECHAT_APP_ID` 未配置时返回 `{ appId: "mock", timestamp: 0, nonceStr: "mock", signature: "mock" }`

**代码重复修复**: `packages/api/src/routers/invitation.ts` 中有重复的 `getMpAccessToken`，需从 `wechat.ts` 统一导出后 import，删除 invitation.ts 中的本地实现。

---

### 模块 2: `getInvitationPreview` 公开接口（tRPC）

**文件**: `packages/api/src/routers/invitation.ts`（已有 router，追加新 procedure）

**接口**: `invitationRouter.getInvitationPreview`（`publicProcedure`）

**入参**: `{ invitationId: string }`

**出参**: `{ inviterName: string, compositeType: string }` — 不暴露分数

**逻辑**:
1. 查 `invitations` 表，取 `inviterResultId`
2. 查 `assessments` 表，取 `dominantType` + 四维分数
3. 查 `user` 表，取 `name`
4. 服务端计算复合类型（同前端逻辑：取分数最高两维拼组合）
5. 邀请不存在或已过期返回 404

---

### 模块 3: 前端工具函数 `getCompositeType`

**文件**: `apps/web/src/utils/disc.ts`（新建）

```ts
// 从四维得分推算复合类型
export function getCompositeType(
  scores: Record<"D" | "I" | "S" | "C", number>
): string {
  const sorted = (["D", "I", "S", "C"] as const)
    .slice()
    .sort((a, b) => scores[b] - scores[a]);
  return `${sorted[0]}${sorted[1]}`; // e.g. "DI"
}
```

**分享缩略图 URL 工具**:
```ts
const CDN_BASE =
  "https://7072-prod-d1gj2nkrx05fb1c16-1444533815.tcb.qcloud.la/static-images";

export function getShareThumbnail(compositeType: string): string {
  return `${CDN_BASE}/share-${compositeType.toLowerCase()}.png`;
}
```

---

### 模块 4: `use-wechat-share` Hook（前端）

**文件**: `apps/web/src/hooks/use-wechat-share.ts`（新建）

**接口**:
```ts
interface WechatShareConfig {
  title: string;
  desc: string;
  imgUrl: string;
  link?: string; // 默认 location.href（去掉 hash）
}

export function useWechatShare(config: WechatShareConfig): void
```

**内部流程**:
1. `useEffect` 中检测 UA：`/MicroMessenger/i.test(navigator.userAgent)`，非微信直接 return
2. 动态插入 `<script src="//res.wx.qq.com/open/js/jweixin-1.6.0.js">`（避免 SSR 问题，onload 后继续）
3. 取签名 URL：`location.href.split('#')[0]`（去掉 hash，这是微信的硬性要求）
4. `fetch('/api/auth/wechat/jssdk-signature?url=' + encodeURIComponent(url))` 取签名
5. `wx.config({ debug: false, appId, timestamp, nonceStr, signature, jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData'] })`
6. `wx.ready(() => { wx.updateAppMessageShareData({...config}); wx.updateTimelineShareData({...}) })`
7. `wx.error(() => { /* 静默失败 */ })`

**注意**: config 变化时重新调用 `wx.updateAppMessageShareData`（通过 `useEffect` 依赖数组）

---

### 模块 5: 结果页分享集成

**文件**: `apps/web/src/routes/result.tsx`（已有，修改）

**新增逻辑**:
- 从 `scores` 计算 `compositeType = getCompositeType(scores)`
- 从 `COMPOSITE_PROFILES[compositeType]` 取 `name`（已有数据）
- 调用 `useWechatShare({...})`，仅在 `activeRecord` 存在时配置

**分享内容**:
```
title: `我的DISC类型是「${profile.name}」，测测你是哪种？`
desc:  `D: ${scores.D}% · I: ${scores.I}% · S: ${scores.S}% · C: ${scores.C}% | DISC 职业性格测评`
imgUrl: getShareThumbnail(compositeType)
link:  当前页面 URL
```

---

### 模块 6: 深度解析页分享集成

**文件**: `apps/web/src/routes/detail.tsx`（已有，修改）

**新增逻辑**:
- 计算 `compositeType`，取 `compositeProfile.name`
- 已登录且有 `historyId`：调用 `trpc.invitation.createInvitation.mutate({ resultId: historyId })` 获取 `invitationId`，分享 link 为 `${origin}/invite/${invitationId}`
- 未登录或无 `historyId`：分享 link fallback 到当前页 URL
- 邀请创建为懒触发（组件 mount 时异步预创建，避免用户点分享时延迟）

**分享内容**:
```
title: `来测测你的DISC职场性格，看看我们的配对分析`
desc:  `「${compositeProfile.name}」职场表现·沟通风格·成长机会`
imgUrl: getShareThumbnail(compositeType)
link:  /invite/${invitationId} 或当前页
```

---

### 模块 7: 邀请承接页

**文件**: `apps/web/src/routes/invite.$invitationId.tsx`（新建）

**路由**: `/invite/:invitationId`（React Router v7 文件系统路由，文件名用 `$` 表示动态段）

**页面逻辑**:
1. `clientLoader` 中调用 `trpc.invitation.getInvitationPreview.query({ invitationId })` 取邀请人信息
2. 展示邀请人复合类型色块 + 名字 + "邀请你来测测你的DISC" 文案
3. 按钮"开始测评"跳转 `/quiz`，同时将 `invitationId` 写入 `sessionStorage`
4. Quiz 完成后的 `result.tsx` 中检查 `sessionStorage` 是否有 `pendingInvitationId`，若有则调用 `completeInvitation`
5. 邀请完成后展示"查看我们的配对分析"入口，跳转对比页（已有 `comparisonRouter`）

---

## 接口契约

### 新增 REST 接口

```
GET /api/auth/wechat/jssdk-signature
Query: url=<encoded_current_page_url>
Response: { appId: string, timestamp: number, nonceStr: string, signature: string }
Auth: 不需要（公开）
```

### 新增 tRPC procedure

```ts
invitationRouter.getInvitationPreview
  input: { invitationId: string }
  output: { inviterName: string, compositeType: string }
  auth: publicProcedure
```

---

## 数据模型

无新增表。涉及已有表：
- `invitations`（读）：取 `inviterResultId`、`status`
- `assessments`（读）：取 `dominantType`、`scoreD/I/S/C`
- `user`（读）：取 `name`

---

## 安全考虑

- jsapi_ticket 仅在服务端缓存和使用，不下发给前端
- 签名 URL 由前端传入，需在服务端做基本格式校验（必须是合法 URL）
- `getInvitationPreview` 只返回类型信息，不暴露分数，避免未授权数据访问

---

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| JSSDK 加载方式 | 动态 `<script>` inject | 非微信环境零加载，无包体积影响 | npm 包引入（会污染所有环境） |
| 分享缩略图 | 12 张 CDN 静态图 | 已有资产，按复合类型分类更精准 | 4 张单类型图（粒度粗）/ 动态生成（工作量大） |
| 邀请链接预创建时机 | 组件 mount 时异步预创建 | 避免用户点分享时 API 调用延迟 | 点击分享时触发（体验差） |
| 承接页路由命名 | `invite.$invitationId.tsx` | 遵循 React Router v7 文件系统路由约定 | 查询参数方式（不利于分享链接美观） |
