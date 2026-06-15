# 病毒增长飞轮 — 任务清单 ✓

## 任务版本

| 日期       | 版本 | 说明         |
| ---------- | ---- | ------------ |
| 2026-06-15 | v1   | 初始任务     |
| 2026-06-15 | v2   | 全部任务完成 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Monorepo（npm workspaces + Turborepo）
- Specs 路径: doc/requirements/7.viral-growth-loop/
- 前置依赖: Feature 6（Taro 迁移）完成

## 任务列表

### 功能 A: 结果分享卡

- [x] T-001: `packages/db` 无需修改；配置每种 DISC 类型的金句文案（4 类型 × 3 条），存入常量文件 `apps/miniprogram/src/data/type-quotes.ts` ~30min
- [x] T-002: 实现 `share-card` Canvas 工具（`apps/miniprogram/src/utils/share-card.ts`），离屏绘制 750×1334px 图片（背景渐变 + 类型大字 + 雷达图 + 金句 + 水印），`generateShareCard` + `saveShareCardToAlbum` ~2h
- [x] T-003: 服务端新增 `getMiniQrcode` 接口（`GET /api/auth/wechat/mini-qrcode?scene=xxx`），调用微信 `wxacode.getunlimit` API 返回小程序码 base64，含 access token 缓存 ~30min
- [x] T-004: 结果页新增「生成专属卡片」按钮，集成 share-card 工具，支持「保存图片」到相册 ~1h

### 功能 B: 好友对比

- [x] T-005: `packages/api` 新增 `createInvitation` mutation（创建邀请记录，返回邀请参数）~30min
- [x] T-006: `packages/db` 新增 `invitations` 表（`packages/db/src/schema/invitations.ts`），schema 已创建待 `db:push` ~30min
- [x] T-007: 结果页新增「邀请好友对比」入口，生成带 inviterId+resultId 参数的小程序码，弹窗展示 ~1h
- [x] T-008: 实现双人雷达图叠加 Canvas 组件（`apps/miniprogram/src/components/comparison-radar/`），两色半透明叠加 ~1h
- [x] T-009: `packages/api` 新增 `getComparison` query，根据两个 resultId 返回对比数据和对比洞察文案 ~1h
- [x] T-010: 新建对比页 `pages/comparison/index.tsx`：检测邀请参数 → 展示双人雷达 + 洞察文案 + 维度对比条 ~1h
- [x] T-011: 对比结果页新增「保存对比卡片」（复用 share-card 工具）~30min

### 功能 C: 邀请解锁报告

- [x] T-012: `packages/db` 在 `assessments` 表新增 `is_unlocked` + `mode` 字段，待 `db:push` ~15min
- [x] T-013: `packages/api` 实现 `completeInvitation` mutation（更新邀请状态，检查是否达到解锁条件）~1h
- [x] T-014: `packages/api` 实现 `getUnlockStatus` query（返回解锁状态和邀请进度）~30min
- [x] T-015: 服务端在解锁触发时调用微信订阅消息 API 推送通知（`sendUnlockSubscribeMessage` fire-and-forget）~30min
- [x] T-016: 深度解析页：「下载完整报告」入口判断解锁状态 → 未解锁展示邀请解锁弹窗 ~1h
- [x] T-017: 邀请解锁弹窗：展示进度（X/2）+ 专属邀请小程序码 + 5s 轮询刷新状态 ~1h
- [x] T-018: 用户点击邀请按钮时引导订阅「邀请进度通知」微信订阅消息（`requestSubscribeMessage`）~30min

### 功能 D: 快速版 12 题（Feature 6 中已完成）

- [x] T-019: 快速版 12 题题号已在 Feature 6 中配置 `QUICK_QUESTION_IDS` ~0min
- [x] T-020: 答题页支持 `mode` 路由参数（Feature 6）~0min
- [x] T-021: 首页已有「快速测评（12题 · 2分钟）」入口（Feature 6）~0min
- [x] T-022: `assessments` 表新增 `mode` 字段（本 Feature 中完成）~15min
- [x] T-023: 快速版结果页顶部标注「快速版」标签，底部展示升级引导条（Feature 6）~0min

### 集成与测试

- [ ] T-024: 全流程联调：完整版测评 → 生成分享卡 → 好友点击 → 对比面板展示（需微信开发者工具）~1h
- [ ] T-025: 邀请解锁全链路测试：A 发出邀请 → B/C 完成测评 → A 收到通知 → 报告解锁（需真机）~1h

## 依赖关系

- T-006 是 T-005、T-007 的前置（schema 已创建，需 `db:push`）
- T-012 是 T-013、T-016 的前置（schema 已创建，需 `db:push`）
- T-003 是 T-004、T-007 的前置
- T-019 是 T-020 的前置（需产品确认题号）
- T-018 是 T-015 的前置（用户需先订阅才能收到推送）

## 风险点

- **小程序码频率限制**：`wxacode.getunlimit` 每天调用上限 10 万次，需加缓存（同一 scene 缓存 7 天）
- **订阅消息模板审批**：T-018 依赖微信平台审批订阅消息模板，审批周期 1-3 天，`TARO_APP_SUBSCRIBE_TEMPLATE_ID` 上线前需填入
- **OffscreenCanvas 兼容性**：基础库 >= 2.17.0 才支持，低版本降级为普通 Canvas（有闪烁风险）
- **db:push 待执行**：新字段和新表已在 schema 中定义，需在有数据库访问权限时执行 `npm run db:push`
