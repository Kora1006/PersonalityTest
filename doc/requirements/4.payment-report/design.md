# payment-report — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始设计 |

## 项目架构

- 架构类型: Turborepo Monorepo
- 涉及层: 前端（apps/web）、后端（apps/server）、DB（packages/db）

## 功能模块设计

### 模块 1: 数据库 Schema

**文件**: `packages/db/src/schema/orders.ts`

```ts
export const orders = mysqlTable('orders', {
  id: varchar('id', { length: 36 }).primaryKey(),           // UUID
  userId: varchar('user_id', { length: 36 }).notNull(),
  assessmentId: varchar('assessment_id', { length: 36 }).notNull(),
  amount: int('amount').notNull(),                          // 单位：分
  currency: varchar('currency', { length: 3 }).default('CNY'),
  paymentMethod: varchar('payment_method', { length: 20 }), // 'wechat' | 'alipay'
  status: varchar('status', { length: 20 }).default('pending'), // pending/paid/expired/refunded
  isPaid: boolean('is_paid').default(false),
  wechatPrepayId: varchar('wechat_prepay_id', { length: 64 }),
  alipayTradeNo: varchar('alipay_trade_no', { length: 64 }),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow(),
  expiresAt: timestamp('expires_at'),                       // 创建时+5分钟
});
```

**`assessments` 表** (`is_paid` 字段已在 feature 3 schema 中定义，此处复用)。

### 模块 2: 后端支付接口

**新增环境变量** (`packages/env/src/server.ts`):
```
WECHAT_PAY_APP_ID
WECHAT_PAY_MCH_ID
WECHAT_PAY_MCH_KEY          # APIv3 密钥
WECHAT_PAY_NOTIFY_URL       # 回调地址
ALIPAY_APP_ID
ALIPAY_PRIVATE_KEY
ALIPAY_PUBLIC_KEY           # 支付宝公钥（用于验签）
ALIPAY_NOTIFY_URL
```

**tRPC 路由** (`packages/api/src/routers/payment.ts`，新建):

```ts
// 创建订单 + 生成支付二维码
createOrder: protectedProcedure
  .input(z.object({
    assessmentId: z.string().uuid(),
    paymentMethod: z.enum(['wechat', 'alipay']),
  }))
  .mutation(async ({ ctx, input }) => {
    // 1. 检查是否已付费（幂等）
    // 2. 创建 orders 记录
    // 3. 调用微信 Native 支付 / 支付宝 PC 扫码接口
    // 4. 返回 { orderId, qrCode: string (base64 or URL) }
  }),

// 查询支付状态（前端轮询）
getOrderStatus: protectedProcedure
  .input(z.object({ orderId: z.string().uuid() }))
  .query(async ({ ctx, input }) => {
    // 返回 { status: 'pending' | 'paid' | 'expired' }
  }),
```

**Webhook 端点** (在 `apps/server/src/index.ts` 直接挂 Hono 路由，绕过 tRPC，因需原始 body 验签):

```ts
// 微信支付回调
app.post('/webhooks/wechat-pay', async (c) => {
  const body = await c.req.text();
  // 1. 验证签名（使用微信 APIv3 签名算法）
  // 2. 解析通知，更新 orders.status='paid', orders.is_paid=true
  // 3. 更新 assessments.is_paid=true
  // 4. 返回 { code: 'SUCCESS', message: 'OK' }
});

// 支付宝回调
app.post('/webhooks/alipay', async (c) => {
  const body = await c.req.text();  // application/x-www-form-urlencoded
  // 1. 验证签名（支付宝 RSA2）
  // 2. 更新订单和测评记录
  // 3. 返回纯文本 'success'
});
```

**推荐库:**
- 微信支付: `wechatpay-node-v3`（支持 APIv3，TypeScript）
- 支付宝: `alipay-sdk`（官方 npm 包）

### 模块 3: 前端支付 Modal

**文件**: `apps/web/src/components/payment-modal.tsx`

```ts
type PaymentModalProps = {
  open: boolean;
  onClose: () => void;
  assessmentId: string;
  onPaymentSuccess: () => void;
};
```

**组件内部状态:**
```ts
const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>('wechat');
const [orderId, setOrderId] = useState<string | null>(null);
const [qrCode, setQrCode] = useState<string | null>(null);
const [countdown, setCountdown] = useState(300); // 5分钟 = 300秒
```

**流程:**
1. Modal 打开时自动调用 `createOrder` mutation
2. 获得 `{ orderId, qrCode }` 后渲染二维码（使用 `qrcode.react` 或直接 `<img src={qrCode}>` 若后端返回图片 URL）
3. 启动 5 分钟倒计时（`setInterval` / `useEffect` cleanup）
4. 启动轮询 hook（每 3s 调用 `getOrderStatus`）
5. 轮询到 `paid` → 调用 `onPaymentSuccess()` → Modal 淡出动画

**切换支付方式**: Tab 切换时重新调用 `createOrder`（废弃旧订单，创建新订单）。

**轮询 Hook** (`apps/web/src/hooks/use-payment-polling.ts`):
```ts
export const usePaymentPolling = (orderId: string | null, onSuccess: () => void) => {
  useEffect(() => {
    if (!orderId) return;
    const interval = setInterval(async () => {
      const { status } = await trpc.payment.getOrderStatus.query({ orderId });
      if (status === 'paid') {
        clearInterval(interval);
        onSuccess();
      }
      if (status === 'expired') clearInterval(interval);
    }, 3000);
    return () => clearInterval(interval);
  }, [orderId, onSuccess]);
};
```

### 模块 4: PDF 报告生成

**方案**: 使用 `@react-pdf/renderer` 在 Node.js 服务端渲染 PDF。

**文件**: `apps/server/src/pdf/report-template.tsx`（JSX 风格 PDF 模板）

**下载端点** (Hono 路由):
```ts
app.get('/report/download/:assessmentId', async (c) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Unauthorized' }, 401);

  const assessment = await db.query.assessments.findFirst({
    where: and(
      eq(assessments.id, assessmentId),
      eq(assessments.userId, session.user.id),
      eq(assessments.isPaid, true),
    ),
  });
  if (!assessment) return c.json({ error: 'Not found or not paid' }, 403);

  const pdfBuffer = await generateReport(assessment);
  return new Response(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="DISC-Report-${assessment.id}.pdf"`,
    },
  });
});
```

**PDF 报告内容结构:**
- 封面：用户名 + 测评日期 + 主导类型大字
- 第 1 章：性格概览（雷达图截图或 SVG 嵌入）
- 第 2 章：核心优势与行为盲点
- 第 3 章：管理建议
- 第 4 章：团队协作动态

## 接口契约

| 方法 | 路径/过程 | 鉴权 | 说明 |
| ---- | --------- | ---- | ---- |
| tRPC mutation | payment.createOrder | 需登录 | 创建订单 + 生成支付二维码 |
| tRPC query | payment.getOrderStatus | 需登录 | 查询支付状态 |
| POST | /webhooks/wechat-pay | 微信签名验证 | 微信支付回调 |
| POST | /webhooks/alipay | 支付宝签名验证 | 支付宝回调 |
| GET | /report/download/:id | 需登录 + isPaid | 下载 PDF 报告 |

## 数据模型

**新增:**
- `orders` 表（见模块 1）

**修改:**
- `assessments.is_paid` — 已在 feature 3 定义，此处由 webhook 写入

## 安全考虑

- 所有支付签名在后端完成，前端不接触密钥
- Webhook 端点跳过 tRPC 中间件，直接使用 Hono 处理原始 body 以确保签名验证准确
- PDF 下载端点二次校验登录态和 `is_paid`
- 订单幂等：`createOrder` 先查 assessmentId 对应是否已有 paid 订单

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 支付状态同步 | 前端 3s 轮询 | 无需维护 WebSocket 服务，实现简单 | WebSocket（复杂度高） |
| PDF 生成 | @react-pdf/renderer | 纯 Node.js，TypeScript 支持好，组件化模板 | Puppeteer（需要 Chromium 运行时，Docker 镜像大） |
| 微信支付库 | wechatpay-node-v3 | 支持 APIv3，有 TS 类型 | 手动实现签名算法 |
| Webhook 处理 | 直接 Hono 路由（绕过 tRPC） | tRPC 中间件会 parse body，破坏签名验证所需的原始 body | tRPC procedure（无法访问 raw body） |
