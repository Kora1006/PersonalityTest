# Taro 微信小程序迁移 — 技术设计

## 设计版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-15 | v1   | 初始设计 |

## 项目架构

- 架构类型: Monorepo（npm workspaces + Turborepo）
- 涉及层: 新增小程序应用层 / 复用 packages/api / 复用 packages/db / 适配 packages/auth

## Monorepo 目录规划

```
PersonalityTest/
├── apps/
│   ├── web/          # 保留（Web 版本并行）
│   ├── miniprogram/  # 新增：Taro 小程序应用
│   │   ├── src/
│   │   │   ├── pages/        # 页面（对应 web/routes）
│   │   │   │   ├── index/    # 首页
│   │   │   │   ├── quiz/     # 答题
│   │   │   │   ├── result/   # 结果
│   │   │   │   ├── detail/   # 深度解析
│   │   │   │   ├── history/  # 历史记录
│   │   │   │   └── auth/     # 登录
│   │   │   ├── components/   # 小程序端专属组件
│   │   │   │   └── radar-canvas/ # Canvas 雷达图
│   │   │   ├── utils/        # tRPC client + wx storage adapter
│   │   │   └── app.config.ts # 分包配置
│   │   ├── project.config.json
│   │   └── package.json
│   └── server/       # 不变，新增微信登录接口
├── packages/
│   ├── api/          # tRPC 路由复用（不变）
│   ├── auth/         # 新增微信 openid 登录策略
│   ├── db/           # 新增 wechat_openid 字段
│   └── ...
```

## 功能模块设计

### 模块 1: Taro 项目初始化与 Monorepo 集成

**关键设计：**

```bash
# 在 apps/ 下初始化 Taro 项目
npx @tarojs/cli init miniprogram --template react --typescript
```

`apps/miniprogram/package.json` 中引用 workspace 包：
```json
{
  "dependencies": {
    "@PersonalityTest/api": "workspace:*",
    "@PersonalityTest/db": "workspace:*",
    "@PersonalityTest/auth": "workspace:*"
  }
}
```

`turbo.json` 新增 `build:weapp` pipeline：
```json
{
  "tasks": {
    "build:weapp": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    }
  }
}
```

### 模块 2: Canvas 雷达图重构

**背景：** 微信小程序不支持直接使用 SVG 动画，需改用 Canvas 2D API。

**实现方案：**

```typescript
// apps/miniprogram/src/components/radar-canvas/index.tsx
import { Canvas, useReady } from '@tarojs/taro'
import Taro from '@tarojs/taro'

interface RadarProps {
  scores: { D: number; I: number; S: number; C: number }
}

// 使用 wx.createCanvasContext（兼容性好）绘制四边形雷达图
// 动画：requestAnimationFrame 模拟 stroke-dasharray 效果
// 坐标计算：与原 SVG 逻辑保持一致（极坐标 → 笛卡尔坐标转换）
```

**动画方案：** 使用 `Taro.createAnimation` 配合 Canvas 逐帧绘制，实现 0→目标值的雷达路径生长动画。

### 模块 3: 页面迁移策略

**复用规则：**

| 层级 | 复用策略 |
|------|---------|
| 业务逻辑（算法、数据处理）| 直接复用 `packages/api` 中的 tRPC 调用 |
| 组件 UI | 重写为 Taro 原生组件（`View` / `Text` / `ScrollView`），不用 shadcn/ui |
| 样式 | 使用 TailwindCSS for Taro（`tailwindcss-rem2rpx` 处理单位转换）|
| 路由 | Taro 页面路由（`Taro.navigateTo`），替换 React Router |
| 状态管理 | 复用现有 React state 逻辑，不引入 Redux |

**关键差异处理：**

```typescript
// localStorage → wx.setStorageSync
// Web: localStorage.setItem('disc_history', JSON.stringify(data))
// 小程序: Taro.setStorageSync('disc_history', data)

// DOM 操作 → Taro API
// Web: document.querySelector('.canvas').getContext('2d')
// 小程序: Taro.createCanvasContext('radar-canvas', this)
```

### 模块 4: 分包策略

```typescript
// app.config.ts
export default {
  pages: ['pages/index/index', 'pages/auth/index'],  // 主包：首页 + 登录
  subPackages: [
    {
      root: 'pages/quiz',
      pages: ['index'],  // 答题包
    },
    {
      root: 'pages/result',
      pages: ['index', 'detail'],  // 结果 + 深度解析包
    },
    {
      root: 'pages/history',
      pages: ['index'],  // 历史记录包
    },
  ],
  preloadRule: {
    'pages/index/index': {
      network: 'all',
      packages: ['pages/quiz'],  // 首页预加载答题包
    },
  },
}
```

### 模块 5: 微信登录接入

**流程：**

```
小程序端                          服务端
  │                                 │
  ├── wx.login() → code ───────────►│
  │                                 ├── 调微信 API：code2Session
  │                                 ├── 获取 openid + session_key
  │                                 ├── 生成 JWT Token
  │◄────────────── JWT Token ────────┤
  ├── 存储 Token（wx.setStorageSync）│
```

**服务端适配（`packages/auth`）：**

```typescript
// packages/auth/src/index.ts 新增微信登录 provider
import { betterAuth } from 'better-auth'

export const auth = betterAuth({
  // ... 现有配置
  socialProviders: {
    wechat: {
      appId: env.WECHAT_APP_ID,
      appSecret: env.WECHAT_APP_SECRET,
    }
  }
})
```

**数据库 schema（`packages/db`）：**

```typescript
// packages/db/src/schema/users.ts 新增字段
wechatOpenid: text('wechat_openid').unique(),
wechatUnionid: text('wechat_unionid'),
```

### 模块 6: 审核合规

**隐私政策页：** `pages/privacy/index`，内容包含数据收集说明、第三方 SDK 列表

**用户协议页：** `pages/terms/index`

**敏感词规避：**

| 禁用词 | 替换词 |
|--------|--------|
| 心理诊断 | 行为风格分析 |
| 性格评估 | 行为特质测评 |
| 心理健康 | 职场协作风格 |
| 医学测试 | 行为倾向参考 |

## 接口契约

新增服务端接口（在现有 tRPC router 基础上）：

```typescript
// packages/api/src/routers/auth.ts 新增
wechatLogin: publicProcedure
  .input(z.object({ code: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // 用 code 换取 openid，创建或更新用户，返回 JWT
  })
```

## 数据模型

```sql
-- packages/db/src/schema/users.ts 新增字段
ALTER TABLE users ADD COLUMN wechat_openid VARCHAR(64) UNIQUE;
ALTER TABLE users ADD COLUMN wechat_unionid VARCHAR(64);
```

## 安全考虑

- 微信 `session_key` 仅存服务端，不传给前端
- `openid` 仅用于服务端关联账号，不在 API 响应中明文返回
- JWT 有效期 7 天，刷新 Token 有效期 30 天（复用 Better Auth 策略）
- 所有网络请求必须走 HTTPS（微信小程序强制要求）

## 技术决策

| 决策 | 选择 | 理由 | 放弃的方案 |
| ---- | ---- | ---- | ---------- |
| 跨端框架 | Taro 4（React 语法）| 最大化复用现有 React 代码，TypeScript 支持完善 | uni-app（Vue 语法，迁移成本高）；原生小程序（无法复用任何代码）|
| 雷达图 | Canvas 2D API | 小程序不支持 SVG 动画，Canvas 性能更好 | 第三方图表库（包体积超标）|
| 样式方案 | TailwindCSS + rpx | 与现有技术栈一致，rpx 自适应屏幕 | WXSS（无法复用设计 token）|
| 状态管理 | React useState/useContext | 够用，不引入额外复杂度 | Zustand/Redux（过重）|
