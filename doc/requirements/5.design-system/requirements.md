# design-system — 需求规格

## 概述

将 Stitch 原型 "Insight Kinetic" 设计系统的颜色、字体、间距、圆角 Token 配置到 Tailwind v4 中，作为所有 feature UI 开发的基础设施。

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo（npm workspaces）

## 需求版本

| 日期       | 版本 | 说明                         |
| ---------- | ---- | ---------------------------- |
| 2026-06-14 | v1   | 从 Stitch 原型提取设计 Token |

## 原型来源

设计系统文件：`/Users/yuanjunyao/Downloads/stitch_disc/insight_kinetic/DESIGN.md`

屏幕列表：
- `disc_1`, `disc_2` — 首页（英文/中文）
- `_3`, `_6` — 答题页（英文/中文）
- `_2`, `_5` — 结果页（英文/中文）
- `_4`, `_7` — 深度解析页（英文/中文）
- `_1` — 历史记录页（中文）

## 功能需求

1. [F-001] 将 Insight Kinetic 颜色 Token（surface / primary / secondary / tertiary / error 系列）注册到 `packages/ui` Tailwind 配置
2. [F-002] 注册字体变量：`--font-sans: Manrope`、`--font-mono: JetBrains Mono`
3. [F-003] 注册间距 Token：xs(4px) / sm(8px) / md(16px) / lg(24px) / xl(32px) / container-margin(20px) / gutter(16px)
4. [F-004] 注册圆角 Token：sm(4px) / md(12px) / lg(16px) / xl(24px) / full(9999px)
5. [F-005] 定义 DISC 颜色系统：D=红 / I=琥珀 / S=绿 / C=蓝，含渐变 class（`.disc-gradient-d/i/s/c`）
6. [F-006] 定义公共全局 CSS：glass-card 毛玻璃效果、disc-radar-path SVG 动画、Material Symbols 字体变量
7. [F-007] 在 `apps/web` 引入字体（Google Fonts CDN）

## 非功能需求

- **无运行时开销**: 全部为静态 CSS 变量 + Tailwind 配置
- **一致性**: 所有后续 feature 的 UI 颜色必须使用 Token，不允许硬编码 hex
- **字体加载**: 使用 `display=swap` 避免 FOIT

## 验收标准

- [ ] [AC-001] Tailwind Intellisense 中可以自动补全 `bg-primary`、`text-on-surface` 等 Token 色名
- [ ] [AC-002] 页面背景色为 `#f9f9ff`（surface），文字为 `#151c27`（on-surface）
- [ ] [AC-003] Manrope 字体在浏览器中正确加载，标题显示为几何粗体风格
- [ ] [AC-004] JetBrains Mono 在使用 `font-mono` class 时正确渲染
- [ ] [AC-005] `.disc-gradient-d` class 展示红色渐变，`.disc-gradient-c` 展示蓝色渐变
- [ ] [AC-006] `.disc-radar-path` 元素在页面加载时有描边动画

## 功能范围

**In Scope:**
- Tailwind v4 主题扩展（颜色、字体、间距、圆角）
- 全局 CSS 公共类（glass-card、disc-gradient-*、disc-radar-path）
- Google Fonts 引入

**Out of Scope:**
- 深色模式（Dark Mode）支持
- 动态主题切换
- 组件库封装（由各 feature 自行实现）

## 依赖

- `packages/ui/src/styles/globals.css` — Tailwind v4 主题定义入口
- `apps/web/index.html` 或 `root.tsx` — 字体 CDN 引入点
- TailwindCSS v4（已安装）
