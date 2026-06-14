# design-system — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo
- Specs 路径: doc/requirements/5.design-system/
- **前置于所有其他 feature**（feature 1~4 的 UI 开发依赖本 feature 完成）

## 任务列表

### Token 配置

- [x] T-001: 将 Insight Kinetic 完整颜色 Token 写入 `packages/ui/src/styles/globals.css` 的 `@theme` 块（surface / primary / secondary / tertiary / error 系列 + DISC 专属色） ~20min
- [x] T-002: 在 `@theme` 中注册字体变量（`--font-sans: Manrope`、`--font-mono: JetBrains Mono`）和间距 Token（xs/sm/md/lg/xl/container-margin/gutter） ~10min
- [x] T-003: 在 `@theme` 中注册圆角 Token（sm=4px / md=12px / lg=16px / xl=24px / full=9999px） ~5min

### 全局样式 class

- [x] T-004: 添加 DISC 渐变 class（`.disc-gradient-d/i/s/c`）和 `.glass-card` 毛玻璃效果到 `globals.css` ~10min
- [x] T-005: 添加 `.disc-radar-path` SVG 描边动画 `@keyframes`（`stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: 2s ease-out`） ~5min
- [x] T-006: 设置 `html, body` 全局背景色（`--color-background`）和文字色（`--color-on-surface`），以及 Material Symbols `font-variation-settings` ~5min

### 字体引入

- [x] T-007: 在 `apps/web/index.html` 中添加 Google Fonts 预连接 + Manrope/JetBrains Mono/Material Symbols 链接，使用 `display=swap` ~10min

### 验证

- [x] T-008: 启动 `npm run dev:web`，验证：背景色为 `#f9f9ff`、Manrope 字体加载成功、`bg-primary` 在浏览器中渲染为 `#0058be` ~10min

## 依赖关系

- T-002 依赖 T-001（先有颜色再注册字体/间距）
- T-008 依赖 T-001~T-007 全部完成

## 风险点

- **TailwindCSS v4 `@theme` 语法**：Token 名称必须用 `--color-*` / `--font-*` / `--spacing-*` 前缀，Tailwind 才能自动生成对应 utility class；如有疑问参考 TailwindCSS v4 官方文档
- **Google Fonts 访问**：如本地开发网络访问 fonts.googleapis.com 受限，临时可改用 `fontsource` 包：`npm install @fontsource/manrope @fontsource/jetbrains-mono`
- **Material Symbols 体积**：完整字体较大，建议加 `opsz,wght` 参数按需加载，避免影响首屏性能
