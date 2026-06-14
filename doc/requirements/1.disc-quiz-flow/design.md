# disc-quiz-flow — 技术设计

## 设计版本

| 日期       | 版本 | 说明                             |
| ---------- | ---- | -------------------------------- |
| 2026-06-14 | v1   | 初始设计                         |
| 2026-06-14 | v2   | 对照 Stitch 原型补充视觉规格 |

## 项目架构

- 架构类型: Turborepo Monorepo
- 涉及层: 前端（apps/web）、静态数据（hardcoded）、localStorage

## 路由设计

基于 `@react-router/fs-routes`，在 `apps/web/src/routes/` 下：

```
routes/
├── _index.tsx        → /          (首页 Home)
├── quiz.tsx          → /quiz      (答题页 Quiz)
└── result.tsx        → /result    (结果页 Result)
```

## 全局状态设计

Quiz 流程跨页面共享状态，使用 React Context 注入 `apps/web/src/root.tsx`：

```ts
type QuizStore = {
  answers: Record<number, 'D' | 'I' | 'S' | 'C'>;  // questionIndex → choice
  currentQuestion: number;
  isCompleted: boolean;
  scores: { D: number; I: number; S: number; C: number };
  dominantType: 'D' | 'I' | 'S' | 'C' | null;
  reset: () => void;
  answer: (index: number, choice: 'D' | 'I' | 'S' | 'C') => void;
  submit: () => void;
};
```

> 选择 Context 而非 URL state，因为 quiz 过程中刷新视为放弃，不需要持久化进行中的状态。

## 功能模块设计

### 模块 1: 题目数据

**文件**: `apps/web/src/data/quiz-questions.ts`

```ts
type Question = {
  id: number;
  category: string;           // e.g. 'DECISION MAKING'
  scenario: string;           // 情境问题
  options: {
    text: string;
    type: 'D' | 'I' | 'S' | 'C';
  }[];
};

export const QUIZ_QUESTIONS: Question[] = [ /* 24 道题 */ ];
```

每道题的选项顺序在显示时随机打乱（但 type 映射保持不变），避免用户记住选项位置规律。

### 模块 2: 首页 (Home Screen)

**文件**: `apps/web/src/routes/_index.tsx`

**组件拆分:**
```
HomePage
├── HeroSection          # 主视觉 + 两个 CTA 按钮
├── DiscBentoGrid        # 4 个 DISC 类型磁贴（CSS Grid，桌面 2×2 / 移动 1列）
├── BenefitsSection      # 三方面价值 + 插图
├── StatsSection         # 数据指标（3 个大字）
└── FloatingActionButton # 右下角 FAB + Tooltip
```

**FAB 定位**: `fixed bottom-6 right-6 z-50`，在答题页通过 route 条件隐藏。

### 模块 3: 答题页 (Quiz Screen)

**文件**: `apps/web/src/routes/quiz.tsx`

**交互逻辑:**
1. 进入页面时检查 QuizStore，若 `isCompleted` 则重定向 `/result`
2. 进度条宽度 = `(currentQuestion / 24) * 100%`，CSS `transition-width duration-300`
3. 点击选项 → 调用 `store.answer(currentQuestion, choice)`
4. "下一题"按钮：`disabled={!answers[currentQuestion]}`
5. 最后一题（index 23）按钮文本改为"提交结果"，点击调用 `store.submit()`
6. `submit()` 内：计算 scores → 判断 dominantType → 写入 localStorage → navigate('/result')

**DISC 计分算法:**
```ts
const scores = { D: 0, I: 0, S: 0, C: 0 };
for (const choice of Object.values(answers)) scores[choice]++;
const percentages = {
  D: Math.round((scores.D / 24) * 100),
  I: Math.round((scores.I / 24) * 100),
  S: Math.round((scores.S / 24) * 100),
  C: Math.round((scores.C / 24) * 100),
};
// 主导类型：最高分，并列按 D > I > S > C 优先
const dominant = (['D', 'I', 'S', 'C'] as const).reduce((a, b) =>
  percentages[a] >= percentages[b] ? a : b
);
```

**底部 Tab Bar 隐藏**: 答题页 `<body>` 或 Root Layout 通过 `useMatches` 检测当前路由，答题时设置 CSS class 隐藏底部导航。

### 模块 4: SVG 雷达图组件

**文件**: `apps/web/src/components/radar-chart.tsx`

**实现方案（纯 SVG，无第三方库）:**

```
SVG viewBox="0 0 300 300", center=(150,150), maxRadius=110

轴向角度:
  D: -90°（正上方）
  I: 0°（右）
  S: 90°（下）
  C: 180°（左）

多边形路径计算:
  point(type) = center + radius * score[type] * (cos(angle), sin(angle))

动画:
  stroke-dasharray + stroke-dashoffset 从总长度→0，duration 1s ease-out
  fill opacity 从 0→0.3，duration 0.8s
```

**动效触发**: 使用 `useEffect` + `requestAnimationFrame` 或 CSS `@keyframes`，组件挂载后 100ms delay 开始。

### 模块 5: localStorage 历史写入

**文件**: `apps/web/src/lib/history.ts`

```ts
const HISTORY_KEY = 'disc_history';

type HistoryRecord = {
  id: string;           // crypto.randomUUID()
  date: string;         // 'YYYY-MM-DD'
  dominantType: 'D' | 'I' | 'S' | 'C';
  scores: { D: number; I: number; S: number; C: number };
  note: string;         // 默认为空
};

export const appendHistory = (record: Omit<HistoryRecord, 'id' | 'date'>) => {
  const existing = getHistory();
  const newRecord: HistoryRecord = {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    ...record,
  };
  localStorage.setItem(HISTORY_KEY, JSON.stringify([newRecord, ...existing]));
  return newRecord;
};
```

## 接口契约

本 feature 无后端 API 调用，全部为本地状态 + localStorage。

## 数据模型

无数据库变更。

## 字体与图标引入

在 `apps/web/src/root.tsx` 或 `index.html` 中引入：

```html
<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet">
```

TailwindCSS v4 中注册自定义字体：
```css
/* packages/ui/src/styles/globals.css */
@theme {
  --font-sans: 'Manrope', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## DISC 颜色系统

```ts
export const DISC_COLORS = {
  D: { hex: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
  I: { hex: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
  S: { hex: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  C: { hex: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
} as const;
```

对应 CSS class（加入全局样式）：
```css
.disc-gradient-d { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
.disc-gradient-i { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.disc-gradient-s { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.disc-gradient-c { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }
```

---

## [v2] 原型视觉规格补充

> 来源：Stitch 原型 `/Users/yuanjunyao/Downloads/stitch_disc`，设计系统 "Insight Kinetic"

### v2.1 导航架构调整 `[CHANGED]`

原规格中的 FAB（悬浮按钮）**替换为底部 Tab Bar**，这是原型中的实际导航方案：

```
底部 Tab Bar（移动端固定在底部）：
┌───────────┬───────────┬───────────┐
│  🎯 Test  │ 🕐 History│ 👤 Profile│
└───────────┴───────────┴───────────┘
```

- 桌面端：Tab Bar 可转为侧边导航或顶部导航
- **答题进行中**：Tab Bar 隐藏（原规格保留 ✓）
- 激活 Tab 显示为蓝色（`primary: #0058be`），其余灰色

### v2.2 首页维度展示调整 `[CHANGED]`

PRD 描述的"Bento 磁贴区"在原型中**实现为竖向卡片列表**（非 2×2 grid）：

```
每张维度卡片结构：
┌─────────────────────────────┐
│ [图标方块 32px] 支配型 (D)   │
│              倾向于达成目标... │
└─────────────────────────────┘
```

- 图标：32×32px 方形，带 `disc-gradient-*` 渐变背景，圆角 8px
- Material Symbols 图标：D=⚡bolt, I=👥group, S=⚖️balance, C=📋fact_check
- 卡片背景：白色，`box-shadow: 0 4px 20px rgba(0,0,0,0.05)`，圆角 16px
- 列表间距：`gap-md (16px)`

首页增加 "个人成长引擎" (PERSONAL GROWTH ENGINE) 标签，在主标题上方（JetBrains Mono caps，蓝色）。

### v2.3 答题选项标签 `[CONFIRMED]`

每个选项卡片下方有类型标签（JetBrains Mono，12px，灰色，全大写）：

```
选项卡片：
┌────────────────────────────────────┐
│ ○  掌控大局，追求即时结果，即使      │
│    会产生些许摩擦。                  │
│    DECISIVE & ASSERTIVE             │  ← label-caps 样式
└────────────────────────────────────┘
```

标签映射：D=DECISIVE & ASSERTIVE, I=PERSUASIVE & ENTHUSIASTIC, S=PATIENT & RELIABLE, C=ANALYTICAL & PRECISE

### v2.4 SVG 雷达图动画精确实现 `[CONFIRMED + 细化]`

原型 HTML 中的动画代码：
```css
.disc-radar-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash 2s ease-out forwards;
}
@keyframes dash {
  to { stroke-dashoffset: 0; }
}
```

雷达图视觉规格（来自 DESIGN.md）：
- 描边：2px，颜色 `#3B82F6`（C 型蓝）
- 填充：10% opacity 的同色填充（`fill: rgba(59, 130, 246, 0.1)`）
- 轴标签：`label-caps` 字体样式

### v2.5 Glass Card 效果

部分卡片使用半透明玻璃效果：
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(243, 244, 246, 1);
}
```

### v2.6 结果页 CTA 布局

原型结果页底部有**两个并列按钮**：
1. "查看详细解析" — 蓝色实心主按钮
2. "下载 PDF 报告" — 白色描边次按钮（点击触发 feature 4 支付流程）

> 注意：PRD 中"下载报告"入口在深度解析页，但原型在结果页也有直接入口。两处均需接入支付门控。

## 安全考虑

无后端调用，无安全风险。localStorage 数据为非敏感的测评结果。

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 全局状态 | React Context | 轻量，无需外部依赖 | Zustand（引入额外包） |
| 雷达图 | 原生 SVG | PRD 强制要求，性能最优 | Recharts / Chart.js（体积大） |
| 题目数据 | 静态 TS 文件 | 题目固定不变，无需 DB | CMS / DB 存储（过度设计） |
| 路由状态 | Context（非 URL） | quiz 中途刷新视为放弃 | URL query params |
