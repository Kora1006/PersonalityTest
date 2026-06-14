# disc-quiz-flow — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo
- Specs 路径: doc/requirements/1.disc-quiz-flow/

## 任务列表

### 基础设施

- [x] T-001: 引入 Manrope + JetBrains Mono + Material Symbols Outlined 字体，在 TailwindCSS v4 注册字体变量 ~15min
- [x] T-002: 创建 DISC 颜色常量文件 `apps/web/src/data/disc-colors.ts`，定义 D/I/S/C 四色系统 ~15min
- [x] T-003: 创建 `apps/web/src/data/quiz-questions.ts`，录入 24 道 DISC 题目（含 category / scenario / 4 options 及 type 映射） ~1h
- [x] T-004: 创建 `apps/web/src/lib/history.ts`，实现 localStorage `disc_history` 的读 / 追加 / 覆盖操作 ~15min
- [x] T-005: 创建 QuizContext (`apps/web/src/contexts/quiz-context.tsx`)，提供 answers / currentQuestion / scores / dominantType / reset / answer / submit ~30min

### 首页 (Home)

- [x] T-006: 搭建首页路由 `_index.tsx` 基础结构，实现 HeroSection（主标题 + 两个 CTA 按钮）和全局 FAB ~45min
- [x] T-007: 实现 DISC 维度 Bento 磁贴区（4 张卡片，渐变图标，响应式 Grid） ~30min
- [x] T-008: 实现 BenefitsSection + StatsSection（价值展示 + 数据指标大字） ~30min

### 答题页 (Quiz)

- [x] T-009: 搭建 `quiz.tsx` 页面骨架：顶部导航栏（返回按钮 + 进度文字）+ 线性进度条（CSS transition 动效） ~30min
- [x] T-010: 实现题目展示区 + 四个单选卡片（点击高亮，已选状态），集成 QuizContext ~30min
- [x] T-011: 实现底部动作条（帮助按钮 + 下一题/提交结果按钮），处理禁用状态与最后一题逻辑 ~20min
- [x] T-012: 实现答题完成时的 submit 逻辑：计分 → 判断主导类型 → 写入 localStorage → navigate('/result') ~20min

### 结果页 (Result)

- [x] T-013: 搭建 `result.tsx` 页面，展示主导类型大字 + 中文名 + 一句话核心画像 ~20min
- [x] T-014: 实现 SVG 雷达图组件 `apps/web/src/components/radar-chart.tsx`（原生 SVG，stroke-dasharray 描边动画） ~1h
- [x] T-015: 实现四色维度百分比进度条（从 0% 增长动画，CSS transition）+ 心理洞察双栏分析板 ~30min

### 收尾

- [x] T-016: 实现答题页时移动端底部导航隐藏逻辑（useMatches 检测路由），添加结果页三个 CTA 按钮路由跳转 ~20min

## 依赖关系

- T-005 依赖 T-004（QuizContext 中调用 appendHistory）
- T-009~T-012 依赖 T-003、T-005
- T-013~T-015 依赖 T-005（读取 scores / dominantType）
- T-014 依赖 T-002（颜色系统）

## 风险点

- **T-003 题目录入**：24 道完整题目需手工整理 DISC 标准题库，预留 1h 时间确认内容准确性
- **T-014 SVG 动画**：stroke-dasharray 总长度需要在运行时计算（polygonElement.getTotalLength()），注意 SSR 兼容
- **T-001 字体引入**：Material Symbols 体积较大，考虑按需加载（`display=swap`）
