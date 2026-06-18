# wechat-share-card — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Monorepo (Turborepo)
- Specs 路径: doc/requirements/9.wechat-share-card/

## 任务列表

### 功能 1: 后端 JSSDK 签名接口

- [x] T-001: 在 `apps/server/src/wechat.ts` 新增 jsapi_ticket 缓存变量 `cachedJsapiTicket`，并实现 `getJsapiTicket()` 函数（复用现有 `getMpAccessToken` 取 ticket，缓存 2h） ~30min
- [x] T-002: 新增 `GET /api/auth/wechat/jssdk-signature?url=` 路由，完成 SHA1 签名生成并返回 `{ appId, timestamp, nonceStr, signature }`，`WECHAT_APP_ID` 未配置时返回 mock 数据 ~30min
- [x] T-003: 修复代码重复：将 `packages/api/src/routers/invitation.ts` 中本地的 `getMpAccessToken` 函数删除，改为从 `apps/server/src/wechat.ts` 导出复用 ~15min

### 功能 2: tRPC `getInvitationPreview` 接口

- [x] T-004: 在 `packages/api/src/routers/invitation.ts` 追加 `getInvitationPreview` publicProcedure，入参 `invitationId`，联查 invitations + assessments + user 表，返回 `{ inviterName, compositeType }`（服务端计算复合类型） ~30min

### 功能 3: 前端工具函数

- [x] T-005: 新建 `apps/web/src/utils/disc.ts`，实现 `getCompositeType(scores)` 和 `getShareThumbnail(compositeType)` 函数，CDN base 沿用现有常量 ~15min

### 功能 4: `use-wechat-share` Hook

- [x] T-006: 新建 `apps/web/src/hooks/use-wechat-share.ts`，实现完整流程：微信 UA 检测 → 动态加载 JSSDK → fetch 签名 → wx.config → wx.ready 设置分享数据，wx.error 静默失败 ~1h

### 功能 5: 页面集成

- [x] T-007: 在 `apps/web/src/routes/result.tsx` 中集成 `useWechatShare`，传入复合类型标题、四维分数描述和 CDN 缩略图 URL ~30min
- [x] T-008: 在 `apps/web/src/routes/detail.tsx` 中集成 `useWechatShare`，mount 时异步预创建邀请（`createInvitation`），已登录用分享 link 为 `/invite/:invitationId`，未登录 fallback 当前 URL ~1h

### 功能 6: 邀请承接页

- [x] T-009: 新建 `apps/web/src/routes/invite.$invitationId.tsx`，实现 clientLoader 调用 `getInvitationPreview`，展示邀请人复合类型预览，按钮跳 `/quiz` 并将 `invitationId` 写入 sessionStorage ~1h
- [x] T-010: 在 `apps/web/src/routes/result.tsx` 中检查 sessionStorage 的 `pendingInvitationId`，测评完成 + 云同步完成后自动调用 `completeInvitation`，并展示"查看配对分析"按钮 ~30min

## 依赖关系

- T-002 依赖 T-001（ticket 缓存先于路由实现）
- T-003 与 T-001/T-002 并行，但需在 T-002 之前合并（避免 import 路径变动）
- T-006 依赖 T-005（工具函数先行）
- T-007、T-008 依赖 T-006（hook 先完成）
- T-010 依赖 T-004、T-009（接口和承接页先就绪）

## 风险点

- **微信 UA 检测误判**: 某些第三方 APP 内置浏览器 UA 也含 `MicroMessenger`，可能触发 JSSDK 初始化但 wx 未定义。缓解：在 `wx.config` 前判断 `typeof wx !== 'undefined'`。
- **签名 URL 不匹配**: 微信签名对 URL 极为敏感，`https://` vs `http://`、有无 `www`、路径大小写都会导致签名校验失败。需确保前端传入的 URL 与公众号后台配置的安全域名一致。
- **T-003 重构风险**: `getMpAccessToken` 从 api 包移到 server 包，需确认两个包的 import 路径可通（server 可以 import api 包吗？反向依赖可能有问题）。如果存在循环依赖，保留两份实现并各自独立缓存，不做合并。
- **jsapi_ticket 每日调用上限**: 微信限制每日 10000 次，生产环境必须缓存；开发环境用 mock 绕过。
