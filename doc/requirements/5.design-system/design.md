# design-system — 技术设计

## 设计版本

| 日期       | 版本 | 说明                         |
| ---------- | ---- | ---------------------------- |
| 2026-06-14 | v1   | 从 Stitch 原型提取设计 Token |

## 项目架构

- 架构类型: Turborepo Monorepo
- 涉及层: `packages/ui`（主题配置）、`apps/web`（字体引入）

---

## 功能模块设计

### 模块 1: TailwindCSS v4 主题 Token

**文件**: `packages/ui/src/styles/globals.css`

TailwindCSS v4 使用 `@theme` 指令定义 Token（不再是 `tailwind.config.js`）：

```css
@import "tailwindcss";

@theme {
  /* ─── 颜色 Token（Insight Kinetic 完整色板）─── */

  /* Surface 系列 */
  --color-surface:                   #f9f9ff;
  --color-surface-dim:               #d3daea;
  --color-surface-bright:            #f9f9ff;
  --color-surface-container-lowest:  #ffffff;
  --color-surface-container-low:     #f0f3ff;
  --color-surface-container:         #e7eefe;
  --color-surface-container-high:    #e2e8f8;
  --color-surface-container-highest: #dce2f3;
  --color-surface-variant:           #dce2f3;

  /* On-surface */
  --color-on-surface:         #151c27;
  --color-on-surface-variant: #424754;
  --color-outline:            #727785;
  --color-outline-variant:    #c2c6d6;

  /* Primary */
  --color-primary:            #0058be;
  --color-on-primary:         #ffffff;
  --color-primary-container:  #2170e4;
  --color-on-primary-container: #fefcff;
  --color-primary-fixed:      #d8e2ff;
  --color-primary-fixed-dim:  #adc6ff;
  --color-on-primary-fixed:   #001a42;
  --color-inverse-primary:    #adc6ff;
  --color-surface-tint:       #005ac2;

  /* Secondary（绿色系） */
  --color-secondary:           #006c49;
  --color-on-secondary:        #ffffff;
  --color-secondary-container: #6cf8bb;
  --color-on-secondary-container: #00714d;
  --color-secondary-fixed:     #6ffbbe;
  --color-secondary-fixed-dim: #4edea3;

  /* Tertiary（琥珀/金色系） */
  --color-tertiary:            #765700;
  --color-on-tertiary:         #ffffff;
  --color-tertiary-container:  #956e00;
  --color-tertiary-fixed:      #ffdf9f;
  --color-tertiary-fixed-dim:  #f9bd22;

  /* Error */
  --color-error:               #ba1a1a;
  --color-on-error:            #ffffff;
  --color-error-container:     #ffdad6;
  --color-on-error-container:  #93000a;

  /* Background */
  --color-background:          #f9f9ff;
  --color-on-background:       #151c27;

  /* Inverse */
  --color-inverse-surface:     #2a313d;
  --color-inverse-on-surface:  #ebf1ff;

  /* ─── DISC 专属色彩 ─── */
  --color-disc-d: #ef4444;   /* 支配型 Dominance - 红 */
  --color-disc-i: #f59e0b;   /* 影响型 Influence  - 琥珀 */
  --color-disc-s: #10b981;   /* 稳健型 Steadiness - 绿 */
  --color-disc-c: #3b82f6;   /* 谨慎型 Compliance - 蓝 */

  /* ─── 字体 ─── */
  --font-sans: 'Manrope', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  /* ─── 间距 Token ─── */
  --spacing-xs:               4px;
  --spacing-sm:               8px;
  --spacing-md:               16px;
  --spacing-lg:               24px;
  --spacing-xl:               32px;
  --spacing-container-margin: 20px;
  --spacing-gutter:           16px;

  /* ─── 圆角 Token ─── */
  --radius-sm:  4px;
  --radius-md:  12px;
  --radius-lg:  16px;
  --radius-xl:  24px;
  --radius-full: 9999px;
}

/* ─── DISC 渐变 class ─── */
.disc-gradient-d { background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); }
.disc-gradient-i { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.disc-gradient-s { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
.disc-gradient-c { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); }

/* ─── SVG 雷达图动画 ─── */
.disc-radar-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: disc-radar-draw 2s ease-out forwards;
}
@keyframes disc-radar-draw {
  to { stroke-dashoffset: 0; }
}

/* ─── 毛玻璃卡片 ─── */
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(243, 244, 246, 1);
}

/* ─── Material Symbols 默认参数 ─── */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* ─── 全局背景和文字色 ─── */
html, body {
  background-color: var(--color-background);
  color: var(--color-on-surface);
  font-family: var(--font-sans);
}
```

### 模块 2: 字体引入

**文件**: `apps/web/index.html`（Vite 的 HTML 入口）

```html
<head>
  <!-- Manrope + JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&family=JetBrains+Mono:wght@600&display=swap" rel="stylesheet">
  <!-- Material Symbols Outlined -->
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
</head>
```

> `fumadocs` 应用也需要类似引入（在其 `index.html` 或 root layout）。

### 模块 3: 排版比例参考

来自 DESIGN.md，开发时参考，不需要注册为 Tailwind Token（使用内置 text-* 类即可）：

| Token 名     | 字体      | 大小  | 粗细 | 行高 | 字间距      | 用途     |
|-------------|-----------|-------|------|------|------------|---------|
| display      | Manrope   | 32px  | 800  | 40px | -0.02em    | 首页大标题 |
| headline-lg  | Manrope   | 24px  | 700  | 32px | -          | 页面标题   |
| headline-md  | Manrope   | 20px  | 600  | 28px | -          | 区块标题   |
| body-lg      | Manrope   | 18px  | 400  | 28px | -          | 正文（长段落） |
| body-md      | Manrope   | 16px  | 400  | 24px | -          | 正文（短段落） |
| label-caps   | JetBrains Mono | 12px | 600 | 16px | 0.05em | 数据标签（全大写） |

对应 Tailwind class 使用方式：
```tsx
// display → text-3xl font-extrabold tracking-tight
// headline-lg → text-2xl font-bold
// label-caps → text-xs font-mono font-semibold tracking-widest uppercase
```

### 模块 4: 高频组件视觉规范

#### 标准卡片
```css
background: white;
border-radius: 16px; /* --radius-lg */
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
padding: 16px; /* --spacing-md */
```

对应 Tailwind：`bg-white rounded-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.05)] p-md`

#### 进度条（条状）
```css
/* Track */
background: #F3F4F6; height: 8px; border-radius: 9999px;
/* Bar（状态进度条）*/
height: 8px;
/* Bar（得分可视化）*/
height: 16px;
```

#### 主按钮
```css
background: #3B82F6; /* disc-c */
color: white;
width: 100%; /* mobile */
border-radius: 16px;
padding: 14px 16px;
font-family: Manrope; font-weight: 600; font-size: 16px;
box-shadow: 0 8px 16px rgba(59, 130, 246, 0.2);
```

## 接口契约

纯样式配置，无 API 接口。

## 数据模型

无数据库变更。

## 安全考虑

无安全风险。确保 Google Fonts CDN 在目标部署环境可访问（如中国大陆需要考虑字体 CDN 替代方案）。

> 中国大陆访问 Google Fonts 可能受限，如有需要可改用 `fontsource` npm 包本地托管字体。

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| Token 注册方式 | `@theme` 指令（Tailwind v4 原生） | 项目已用 TailwindCSS v4，这是 v4 的标准方式 | `tailwind.config.js extend`（v3 方式，不适用于 v4） |
| 字体托管 | Google Fonts CDN | 开发阶段简单，display=swap 减少阻塞 | fontsource 本地包（生产阶段如需离线可切换） |
| DISC 色彩范围 | 仅注册 4 个 DISC 专属色 | 与 Insight Kinetic 调色盘分开，语义清晰 | 全部混入 Tailwind 色彩（命名混乱） |
