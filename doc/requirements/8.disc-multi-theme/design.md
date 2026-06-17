# DISC 多主题皮肤 — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-15 | v1   | 初始设计 |

## 项目架构

- 架构类型: Monorepo（npm workspaces + Turborepo）
- 涉及层: 小程序前端（主题渲染）/ packages/api（主题文案）/ packages/db（theme 字段）

## 核心设计原则

**主题系统是纯文案层，不是算法层。** 算法（得分计算、雷达图）完全不变，只有展示文案和视觉配色随主题变化。

## 数据模型

```typescript
// packages/db/src/schema/quiz-results.ts 新增 theme 字段
export const quizResults = mysqlTable('quiz_results', {
  // ... 现有字段
  theme: varchar('theme', { length: 20 }).default('professional'),
  // 枚举值: 'professional' | 'relationship' | 'leadership'
})
```

## 功能模块设计

### 模块 1: 主题配置系统

**文件结构：**

```
packages/api/src/data/themes/
├── index.ts              # 主题注册表
├── professional.ts       # 职场版（现有内容迁移）
├── relationship.ts       # 情感版
└── leadership.ts         # 管理版
```

**主题配置类型定义：**

```typescript
// packages/api/src/data/themes/index.ts

export type DiscType = 'D' | 'I' | 'S' | 'C'
export type ThemeId = 'professional' | 'relationship' | 'leadership'

export interface TypeContent {
  name: string           // 类型展示名称（如「热情型恋人」）
  tagline: string        // 一句话总结
  strengths: string[]    // 3 条核心优势
  growthAreas: string[]  // 3 条成长建议
  detailAnalysis: {
    section1Title: string
    section1Content: string
    section2Title: string
    section2Content: string
    section3Title: string
    section3Content: string
  }
  shareQuotes: string[]  // 3 条分享卡金句（随机选 1）
}

export interface ThemeConfig {
  id: ThemeId
  name: string           // 「职场版」「情感版」「管理版」
  entryTitle: string     // 首页入口主标题
  entrySubtitle: string  // 首页入口副标题
  questionPrefix: string // 题目引导语前缀（如「在感情生活中，当...」）
  cardTheme: {
    primaryColor: string
    backgroundGradient: [string, string]
  }
  types: Record<DiscType, TypeContent>
}

export const themes: Record<ThemeId, ThemeConfig> = {
  professional: professionalTheme,
  relationship: relationshipTheme,
  leadership: leadershipTheme,
}
```

**情感版配置示例：**

```typescript
// packages/api/src/data/themes/relationship.ts
export const relationshipTheme: ThemeConfig = {
  id: 'relationship',
  name: '情感版',
  entryTitle: '你在亲密关系中是哪种人',
  entrySubtitle: '12 维度解析你的恋爱风格',
  questionPrefix: '在感情生活中，当',
  cardTheme: {
    primaryColor: '#e11d48',
    backgroundGradient: ['#1a0a10', '#2d1420'],
  },
  types: {
    D: {
      name: '主导型恋人',
      tagline: '你在关系里是那个定方向的人',
      strengths: ['目标感强，给伴侣安全感', '遇到问题主动解决，不拖延', '保护欲强，伴侣感受到被守护'],
      growthAreas: ['学会倾听，不急于给解决方案', '允许伴侣按自己的节奏', '表达情感，不只靠行动'],
      shareQuotes: ['你是感情里那个帮对方做决定的人', '爱你的人，是被你的确定性治愈的', '在你身边，不需要迷路'],
      detailAnalysis: {
        section1Title: '你的恋爱模式',
        section1Content: '你习惯主导关系节奏，清楚自己要什么，也会直接告诉对方...',
        section2Title: '和你相处的方式',
        section2Content: '给你明确的回应，不要暧昧。你需要的是能跟上你节奏的人...',
        section3Title: '你在关系中的成长点',
        section3Content: '尝试让对方主导一些小事，感受被照顾的体验...',
      },
    },
    // I, S, C 类似结构...
  },
}
```

### 模块 2: 前端主题渲染

**主题通过路由参数传递：**

```typescript
// apps/miniprogram/src/pages/index/index.tsx
// 首页主题卡片点击
function handleThemeSelect(themeId: ThemeId) {
  Taro.navigateTo({ url: `/pages/quiz/index?theme=${themeId}` })
}

// apps/miniprogram/src/pages/quiz/index.tsx
const { theme = 'professional', mode = 'full' } = Taro.getCurrentInstance().router?.params ?? {}
const themeConfig = themes[theme as ThemeId]

// 题目引导语动态拼接
const questionText = `${themeConfig.questionPrefix}${question.scenario}，你会...`
```

**结果页主题感知：**

```typescript
// apps/miniprogram/src/pages/result/index.tsx
const themeConfig = themes[result.theme]
const typeContent = themeConfig.types[result.dominantType]

// 渲染主题专属内容
<TypeTag>{typeContent.name}</TypeTag>          // 「热情型恋人」
<Tagline>{typeContent.tagline}</Tagline>
<StrengthsList items={typeContent.strengths} />
```

**分享卡主题配色：**

```typescript
// apps/miniprogram/src/components/share-card/index.tsx
function generateShareCard(result: QuizResult, themeConfig: ThemeConfig) {
  const { backgroundGradient, primaryColor } = themeConfig.cardTheme
  // 使用主题配色替换固定颜色
}
```

### 模块 3: 首页主题选择

**入口布局（3 个主题卡片）：**

```
┌─────────────────────────────────────┐
│  选择你的测评视角                     │
├──────────┬──────────┬───────────────┤
│  职场版  │  情感版  │   管理版       │
│ 解码行为 │ 恋爱风格 │ Leader 风格   │
│ 特质     │ 测评     │ 测评          │
└──────────┴──────────┴───────────────┘
```

### 模块 4: 历史记录主题标签

```typescript
// apps/miniprogram/src/pages/history/index.tsx
// 历史卡片新增主题标签
<ThemeTag theme={record.theme}>
  {themes[record.theme].name}  // 「情感版」
</ThemeTag>
```

### 模块 5: 跨主题推荐

```typescript
// apps/miniprogram/src/pages/result/index.tsx
// 结果页底部推荐其他主题
const otherThemes = Object.values(themes).filter(t => t.id !== result.theme)

<CrossThemeRecommend>
  <Text>查看你在其他场景的风格</Text>
  {otherThemes.map(theme => (
    <ThemeCard key={theme.id} theme={theme} onPress={() => startQuiz(theme.id)} />
  ))}
</CrossThemeRecommend>
```

## 接口契约

tRPC 现有接口改动最小：

```typescript
// packages/api/src/routers/quiz.ts
submitQuiz: protectedProcedure
  .input(z.object({
    answers: z.array(z.string()),
    mode: z.enum(['full', 'quick']).default('full'),
    theme: z.enum(['professional', 'relationship', 'leadership']).default('professional'),  // 新增
  }))
  .mutation(...)

// 主题文案不走接口，直接内置在前端包中（无网络请求）
```

## 安全考虑

- 主题文案全部内置（不走接口），无安全风险
- `theme` 字段存入数据库时做枚举校验，防止非法值

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 文案存放位置 | 前端本地配置（`packages/api/data/themes/`）| 无网络请求，即时渲染，便于快速迭代 | 服务端数据库（需额外接口，CMS 管理过重）|
| 主题切换方式 | URL 路由参数 `theme=xxx` | 简单可追踪，支持分享链接直达特定主题 | Context/Store（状态管理过重）|
| 题目处理 | 题目引导语前缀拼接 | 题目内容不变，仅拼接前缀，维护成本低 | 每个主题独立题目（内容成本 3x）|
