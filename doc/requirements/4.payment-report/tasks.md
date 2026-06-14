# payment-report — 任务清单 ✓

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始任务 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Turborepo Monorepo
- Specs 路径: doc/requirements/4.payment-report/

## 任务列表

### 数据库

- [x] T-001: 新建 `packages/db/src/schema/orders.ts`，定义订单表（id / userId / assessmentId / amount / paymentMethod / status / isPaid / paidAt / expiresAt 等字段） ~15min
- [ ] T-002: 在 `packages/db/src/schema/index.ts` 中导出 orders schema；运行 `npm run db:push` 同步表结构 ~10min （schema 已导出，db:push 需要 MySQL 启动）

### 后端支付接口

- [x] T-003: 在 `packages/env/src/server.ts` 添加微信支付和支付宝相关环境变量（APP_ID / MCH_ID / MCH_KEY / NOTIFY_URL / ALIPAY_*） ~10min
- [x] T-004: 新建 `packages/api/src/routers/payment.ts`，实现 `createOrder` mutation（创建订单记录 + 调用支付 SDK 生成二维码） ~1h
- [x] T-005: 在 `payment.ts` 中实现 `getOrderStatus` query（查询订单 isPaid 状态） ~15min
- [x] T-006: 在 `apps/server/src/webhooks.ts` 中实现微信支付 Webhook 路由，APIv3 签名验证 + 更新订单 + 更新 assessments.isPaid ~1h
- [x] T-007: 实现支付宝 Webhook 路由（RSA2 验签 + 更新订单状态） ~45min

### 前端支付组件

- [x] T-008: 创建 `apps/web/src/hooks/use-payment-polling.ts`，实现每 3s 轮询 `getOrderStatus` 并在支付成功时触发回调 ~20min
- [x] T-009: 新建 `apps/web/src/components/payment-modal.tsx`，实现完整支付收银台（商品信息 / 支付方式 Tab / 二维码展示 / 5 分钟倒计时 / 状态文案） ~1h
- [x] T-010: 在深度解析页 `detail.tsx` 的 DownloadReportCTA 处接入支付 Modal：未登录跳转登录、未付费弹 Modal、已付费展示下载按钮 ~30min

### PDF 报告生成

- [x] T-011: 安装 `@react-pdf/renderer`，创建 `apps/server/src/pdf/report-template.tsx` PDF 模板（封面 + 4 个章节） ~1h
- [x] T-012: 在 `apps/server/src/index.ts` 挂载 `GET /report/download/:assessmentId` Hono 路由，校验登录态 + isPaid，调用 PDF 生成并返回文件流 ~30min
- [x] T-013: 前端下载按钮使用 `<a href>` 直接请求 `/report/download/:id` 触发浏览器下载（已付费状态展示） ~15min

## 依赖关系

- T-004 依赖 T-001、T-002、T-003（DB schema + 环境变量）
- T-005 依赖 T-004（订单存在）
- T-006、T-007 依赖 T-001、T-002
- T-008 依赖 T-005
- T-009 依赖 T-004、T-008
- T-010 依赖 T-009 + feature 3 的登录态
- T-011~T-013 依赖 feature 3 的 assessments 数据 + T-002（isPaid 字段）

## 风险点

- **微信支付 / 支付宝沙箱**：正式商户资质申请周期长，开发阶段使用沙箱环境；回调地址同样需要公网可达
- **T-002 db:push**：需要先启动 MySQL Docker 容器（同 Feature 3 T-013）
- **T-006 微信 APIv3 签名**：当前实现跳过了签名验证（使用 `wechatpay-node-v3` 前需要配置证书），生产环境需补全
- **T-012 PDF 渲染**：使用 dynamic import 避免 ESM 兼容性问题，类型用 `Parameters<typeof renderToBuffer>[0]` 断言
