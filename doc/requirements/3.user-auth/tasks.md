# user-auth — 任务清单

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo
- Specs 路径: doc/requirements/3.user-auth/

## 任务列表

### 环境与配置

- [x] T-001: 在 `packages/env/src/server.ts` 中添加 `WECHAT_APP_ID`、`WECHAT_APP_SECRET`、`RESEND_API_KEY` 环境变量；补充 `apps/server/.env` 模板 ~15min
- [x] T-002: 完善 `packages/auth/src/index.ts` Better Auth 配置：开启 emailAndPassword、配置 session 过期、接入 Resend 发送重置邮件 ~30min

### 邮箱注册与登录

- [x] T-003: 扩展登录页 `login.tsx`（已有骨架），添加 Zod 校验，接入 Better Auth `signIn.email` ~20min
- [x] T-004: 新建注册页 `register.tsx`，实现邮箱 / 密码 / 确认密码表单，接入 `signUp.email` ~30min
- [x] T-005: 新建重置密码页 `reset-password.tsx`，实现"发送重置邮件"表单 + "设置新密码"表单（根据 URL token 判断） ~30min
- [x] T-006: 新建 Profile 页 `profile.tsx`，登录态展示用户信息 + 历史统计 + 退出按钮；未登录引导至 /login ~20min

### 微信 PC 扫码登录

- [x] T-007: 后端新增 Hono 路由 `GET /api/auth/wechat/qr`，生成微信授权 URL + state，返回供前端渲染二维码的数据 ~30min
- [x] T-008: 后端新增 `GET /api/auth/wechat/callback`，用 code 换取 openid/unionid，查找/创建 Better Auth 用户，设置 session Cookie，更新 poll 状态 ~45min
- [x] T-009: 后端新增 `GET /api/auth/wechat/poll/:state`，返回 `{ status: 'pending'|'success'|'expired' }` ~15min
- [x] T-010: 前端登录页新增"微信扫码登录"Tab，展示二维码，每 2s 轮询 poll 接口，成功后刷新 session ~45min

### 微信 H5 自动登录

- [x] T-011: 前端检测 `MicroMessenger` userAgent → 替换为微信 OAuth2 跳转按钮，跳转至微信授权页（snsapi_userinfo scope） ~20min

### DB Schema 扩展

- [x] T-012: 在 `packages/db/src/schema/auth.ts` 中给 user 表添加 `wechat_open_id`、`wechat_union_id` 字段；新建 `packages/db/src/schema/assessments.ts` 定义云端历史表 ~20min
- [ ] T-013: 运行 `npm run db:push` 同步 schema，验证字段正常创建 ~5min （需要先启动 MySQL Docker 容器）

### 历史记录同步

- [x] T-014: 新建 tRPC router `packages/api/src/routers/assessments.ts`，实现 `syncHistory`（幂等写入）和 `getHistory` 两个过程 ~30min
- [x] T-015: 前端登录成功回调中调用 `syncLocalHistoryToServer()`，将 localStorage 历史同步至服务端 ~20min

### 路由守卫

- [x] T-016: 在 `profile.tsx` 的 clientLoader 中添加 auth 守卫，未登录跳转 `/login?redirect=xxx` ~20min

## 依赖关系

- T-002 依赖 T-001（环境变量）
- T-003~T-006 依赖 T-002（Better Auth 配置）
- T-007~T-009 依赖 T-001（微信 env vars）
- T-010 依赖 T-007~T-009
- T-012 依赖 feature 1 的数据结构（HistoryRecord 类型）
- T-014 依赖 T-012、T-013
- T-015 依赖 T-014、T-003/T-010（登录成功事件）

## 风险点

- **微信 OAuth 开发环境**：微信开放平台回调域名必须是已备案域名，本地开发需要 ngrok 或内网穿透工具
- **T-008 首次微信登录**：需要决定是否要求绑定邮箱（PRD 提及引导绑定手机号，本版本简化为直接创建账号）
- **T-002 邮件发送**：Resend 需要验证发件域名，开发阶段可以用测试邮箱接收
- **T-013 db:push**：需要先确认 Docker MySQL 已启动且连接正常（当前 MySQL 未运行）
