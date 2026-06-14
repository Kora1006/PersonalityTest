# disc-analysis-history — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo
- Specs 路径: doc/requirements/2.disc-analysis-history/

## 任务列表

### 深度解析页 (Detail)

- [x] T-001: 创建 `apps/web/src/data/disc-profiles.ts`，定义 D/I/S/C 四种类型的完整静态报告数据（优势 / 职场 / 沟通 / 成长矩阵） ~1h
- [x] T-002: 搭建 `detail.tsx` 路由页骨架，从 QuizContext 或 localStorage 读取激活记录（无数据时重定向 /result） ~15min
- [x] T-003: 实现 TypeOverviewHeader（代表性图标 + 类型名 + 得分强度进度条） ~20min
- [x] T-004: 实现 StrengthsCard + WorkplaceCard（核心优势列表 + 职场表现三节） ~30min
- [x] T-005: 实现 CommunicationPanel 双栏面板（Express / Receive 两栏并排，移动端堆叠） ~20min
- [x] T-006: 实现 GrowthMatrix 三卡片网格 + DownloadReportCTA 占位按钮 ~20min

### 历史记录页 (History)

- [x] T-007: 创建 `apps/web/src/data/mock-history.ts`，定义 3 条涵盖 D/I/S 类型的 mock 历史记录 ~10min
- [x] T-008: 在 `apps/web/src/lib/history.ts` 中补充 deleteRecord / initMockIfEmpty 函数 ~15min
- [x] T-009: 创建 `apps/web/src/hooks/use-history.ts` 自定义 Hook（读取/过滤/删除，首次访问注入 mock） ~30min
- [x] T-010: 搭建 `history.tsx` 路由页，实现 SearchBar（输入框 + × 清除按钮）+ HistoryList ~30min
- [x] T-011: 实现 HistoryCard 组件（日期 / 类型徽章 / 维度得分概况 / 查看详情 + 删除按钮） ~30min
- [x] T-012: 实现 EmptyState 组件（无匹配时的插图 + 提示文案） ~15min
- [x] T-013: 接入自定义 Dialog 实现删除二次确认弹窗，确认后更新 state + localStorage ~20min
- [x] T-014: 实现"查看详情"逻辑：navigate('/detail?id=xxx') 携带记录 ID ~15min

## 依赖关系

- T-001 依赖 feature 1 的 T-002（颜色系统 disc-colors.ts）
- T-002~T-006 依赖 T-001（disc-profiles.ts 内容）
- T-009~T-014 依赖 feature 1 的 T-004（history.ts 基础方法）
- T-009 依赖 T-007、T-008
- T-014 依赖 feature 1 的 T-005（QuizContext）

## 风险点

- **T-001 内容编写**：四种类型的完整报告文案需专业的 DISC 心理学内容，需提前准备文案素材
- **T-005 双栏布局**：移动端需要竖向堆叠，桌面端并排，注意 Tailwind responsive 断点处理
- **T-014 历史记录激活**：通过 URL query param `?id=xxx` 传递，detail.tsx 直接读取 localStorage
