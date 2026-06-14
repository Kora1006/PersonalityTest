# user-auth — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-14 | v1   | 初始设计 |

## 项目架构

- 架构类型: Turborepo Monorepo
- 涉及层: 前端（apps/web）、后端（apps/server）、Auth 包（packages/auth）、DB 包（packages/db）

## 功能模块设计

### 模块 1: Better Auth 配置

**文件**: `packages/auth/src/index.ts`

Better Auth v1.6 已部分搭建。需要补充：

```ts
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@PersonalityTest/db';

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'mysql' }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,  // 简化：注册后直接登录
    sendResetPassword: async ({ user, url }) => {
      // 调用邮件服务发送重置链接
    },
  },
  socialProviders: {
    // 微信 OAuth 通过自定义 provider 实现（see 模块 3）
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,        // 7 天
    updateAge: 60 * 60 * 24,            // 每天刷新
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
});
```

**新增环境变量** (`packages/env/src/server.ts`):
```
WECHAT_APP_ID
WECHAT_APP_SECRET
RESEND_API_KEY         # 或 SMTP_HOST/PORT/USER/PASS
```

### 模块 2: 邮箱登录 / 注册 / 忘记密码

**前端路由:**
```
routes/
├── login.tsx           → /login     (已有，需扩展)
├── register.tsx        → /register  (新建)
└── reset-password.tsx  → /reset-password (新建)
```

**表单验证方案**: 使用项目已有的 `@tanstack/react-form` + `zod`：

```ts
const loginSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位'),
  rememberMe: z.boolean().default(false),
});
```

**Better Auth 客户端调用** (`apps/web/src/lib/auth-client.ts`，已有，补充方法):
```ts
// 注册
await authClient.signUp.email({ email, password, name });
// 登录
await authClient.signIn.email({ email, password, rememberMe });
// 忘记密码
await authClient.requestPasswordReset({ email, redirectTo: '/reset-password' });
// 重置密码
await authClient.resetPassword({ token, newPassword });
```

### 模块 3: 微信 OAuth（PC 扫码 + H5）

**方案**: 使用 Better Auth 的自定义 Social Provider 扩展。

**后端新增路由** (`apps/server/src/index.ts`):
```
GET /auth/wechat/qr          → 生成微信授权 URL + state，返回二维码图片或 URL
GET /auth/wechat/callback    → 微信回调，用 code 换取 access_token + openid
GET /auth/wechat/poll/:state → 前端轮询扫码状态（pending/success/expired）
```

**微信 PC 扫码流程:**
```
前端 → GET /auth/wechat/qr → 返回 { qrUrl, state }
前端渲染二维码（使用 qrcode 库生成）
前端每 2s 轮询 GET /auth/wechat/poll/:state
微信扫码 → 用户授权 → 微信回调 /auth/wechat/callback?code=xxx&state=xxx
后端：code → access_token + openid/unionid → 查找/创建用户 → 设置 Cookie → 更新 poll 状态为 success
前端轮询到 success → 刷新页面完成登录
```

**微信 H5 流程:**
```
前端检测 userAgent 包含 MicroMessenger → 跳转微信授权页
https://open.weixin.qq.com/connect/oauth2/authorize?appid=xxx&redirect_uri=xxx&response_type=code&scope=snsapi_userinfo
→ 微信授权 → 回调 /auth/wechat/callback → 设置 Cookie → 重定向回 app
```

**用户表扩展**: 在 `packages/db/src/schema/auth.ts` 中给 user 表补充：
```ts
wechatOpenId: varchar('wechat_open_id', { length: 64 }).unique(),
wechatUnionId: varchar('wechat_union_id', { length: 64 }),
```

### 模块 4: 历史记录云端同步

**新建 DB Schema** (`packages/db/src/schema/assessments.ts`):

```ts
export const assessments = mysqlTable('assessments', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id),
  date: date('date').notNull(),
  dominantType: varchar('dominant_type', { length: 1 }).notNull(),
  scoreD: int('score_d').notNull(),
  scoreI: int('score_i').notNull(),
  scoreS: int('score_s').notNull(),
  scoreC: int('score_c').notNull(),
  note: text('note').default(''),
  isPaid: boolean('is_paid').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**tRPC 路由** (`packages/api/src/routers/assessments.ts`，新建):

```ts
// protectedProcedure 要求已登录
syncHistory: protectedProcedure
  .input(z.array(historyRecordSchema))
  .mutation(async ({ ctx, input }) => {
    // 幂等：按 id 查重，只插入不存在的记录
  }),

getHistory: protectedProcedure
  .query(async ({ ctx }) => {
    // 返回该用户所有 assessments，按 date 倒序
  }),
```

**同步时机** (前端 `apps/web/src/lib/sync.ts`):
```ts
// 在 auth-client 的 onSuccess 回调中触发
export const syncLocalHistoryToServer = async () => {
  const local = getHistory();
  if (!local.length) return;
  await trpc.assessments.syncHistory.mutate(local);
};
```

### 模块 5: 前端 Auth 守卫

**文件**: `apps/web/src/utils/auth-guard.ts`

通过 React Router v7 的 loader 实现服务端式守卫：
```ts
// 在需要登录的路由 loader 中
export const loader = async () => {
  const session = await authClient.getSession();
  if (!session) throw redirect('/login?redirect=' + currentPath);
  return session;
};
```

## 接口契约

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET | /auth/wechat/qr | 获取微信二维码 URL + state |
| GET | /auth/wechat/callback | 微信 OAuth 回调 |
| GET | /auth/wechat/poll/:state | 查询扫码状态 |
| tRPC | assessments.syncHistory | 同步本地历史到服务端 |
| tRPC | assessments.getHistory | 获取服务端历史记录 |

Better Auth 内置接口（`/api/auth/*`）由框架自动挂载。

## 数据模型

**新增/修改:**
- `user` 表新增 `wechat_open_id`、`wechat_union_id` 字段
- 新增 `assessments` 表（见模块 4）

## 安全考虑

- JWT Token 由 Better Auth 管理，支持过期和刷新
- 微信 state 参数用于 CSRF 防护，后端校验有效性
- 密码由 Better Auth 使用 bcrypt 哈希存储
- 重置密码链接一次性有效，15 分钟过期

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| Auth 框架 | Better Auth v1.6 | 项目已配置，内置 Drizzle 适配 | 手写 JWT（重复造轮子） |
| 微信 PC 登录状态 | 轮询（2s 间隔） | 简单可靠，无需维护 WebSocket 连接池 | WebSocket（实现复杂） |
| 邮件服务 | Resend API | 开发者友好，TypeScript SDK | Nodemailer（配置复杂） |
| 历史同步 | 登录时一次性同步 | 简单，避免实时同步的冲突问题 | 实时双向同步 |
