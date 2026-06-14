# PersonalityTest — Claude 项目配置

> 最后更新：2026-06-14

## 项目概述

**PersonalityTest** 是一款 DISC 职业性格测评系统，为职场人、HR 及管理层提供高美感、流畅交互的性格评估工具。产品通过 24 道情境测试题分析用户的支配性（D）、影响性（I）、稳健性（S）、谨慎性（C）四个维度，生成雷达图可视化报告与深度性格解析。v2.0 引入用户账户体系与付费解锁 PDF 报告的商业闭环。

## 技术栈

### 语言与框架
- **主语言**: TypeScript 6+
- **前端**: React 19 + React Router v7 + Vite
- **后端**: Hono v4 + Node.js
- **API 层**: tRPC v11（端到端类型安全）
- **数据库 ORM**: Drizzle ORM（MySQL）
- **认证**: Better Auth v1.6
- **UI 组件**: shadcn/ui（通过 `packages/ui` 共享）
- **样式**: TailwindCSS v4

### 开发工具
- **包管理器**: npm 11（npm workspaces）
- **Monorepo**: Turborepo v2
- **代码格式化/Lint**: Biome（通过 Ultracite 预设）
- **Git Hooks**: Husky（pre-commit 自动运行 `ultracite fix`）
- **服务端构建**: tsdown
- **类型检查**: TypeScript tsc（`check-types` task）

### 环境变量
**Server** (`apps/server/.env`):
- `DATABASE_URL` — MySQL 连接串（本地 Docker 实例）
- `BETTER_AUTH_SECRET` — 至少 32 字符
- `BETTER_AUTH_URL` — 服务端 URL
- `CORS_ORIGIN` — 前端源 URL
- `NODE_ENV`

**Web** (`apps/web/.env`):
- `VITE_SERVER_URL` — 后端 API URL

> MySQL 运行在本地 Docker 中，开发前确保容器已启动。

## 目录结构

```
PersonalityTest/
├── apps/
│   ├── web/          # 前端应用 (React + React Router v7 + Vite)
│   │   └── src/
│   │       ├── components/  # 应用级组件（header, sign-in/up forms...）
│   │       ├── lib/         # auth-client.ts（Better Auth 客户端）
│   │       ├── routes/      # 基于文件系统的路由（@react-router/fs-routes）
│   │       └── utils/       # trpc.ts（tRPC 客户端配置）
│   ├── server/       # 后端 API (Hono + tRPC + Better Auth)
│   │   └── src/index.ts     # Hono 入口，挂载 tRPC + auth 路由
│   └── fumadocs/     # 文档站点 (Fumadocs + React Router)
├── packages/
│   ├── ui/           # 共享 shadcn/ui 组件与全局样式
│   │   └── src/styles/globals.css  # 设计 token 修改入口
│   ├── api/          # tRPC 路由器与 context（packages/api/src/routers/）
│   ├── auth/         # Better Auth 配置（packages/auth/src/index.ts）
│   ├── db/           # Drizzle schema 与迁移（packages/db/src/schema/）
│   ├── env/          # 类型安全环境变量（T3 Env + Zod）
│   └── config/       # 共享 tsconfig.base.json
├── .claude/          # Claude 配置（本文件所在目录）
├── doc/prd.md        # 产品需求文档（PRD）
├── turbo.json        # Turborepo 任务配置
├── biome.json        # Biome 根配置（Ultracite 扩展）
└── package.json      # 根 package，npm workspaces 入口
```

## 开发规范

### 代码风格
- 由 Biome（Ultracite 预设）自动执行，提交前 Husky 自动 fix
- 运行 `npm run fix` 手动格式化，`npm run check` 检查问题
- 参见下方 **Ultracite Code Standards** 章节

### 命名约定
- 变量/函数：`camelCase`
- React 组件文件：`kebab-case`（如 `sign-in-form.tsx`）
- Drizzle schema 表/字段：`camelCase`（映射到数据库 `snake_case`）
- tRPC router：`camelCase` 过程名

### 包导入规范
- 共享 UI 组件：`import { Button } from "@PersonalityTest/ui/components/button"`
- 不使用 barrel files（避免 `index.ts` 重导出一切）

### Git 规范
- 当前仅有 `master` 分支，无远程 remote
- 提交前 Husky 自动运行 `ultracite fix` 并重新 stage

## 常用命令

```bash
# 安装依赖
npm install

# 启动所有应用（开发模式）
npm run dev

# 仅启动前端（localhost:5173）
npm run dev:web

# 仅启动后端（localhost:3000）
npm run dev:server

# 类型检查（全 monorepo）
npm run check-types

# 数据库操作
npm run db:push      # 推送 schema 变更到 MySQL
npm run db:generate  # 生成 Drizzle client/types
npm run db:migrate   # 运行迁移
npm run db:studio    # 打开 Drizzle Studio UI

# 代码质量
npm run fix   # 自动格式化与修复（Ultracite/Biome）
npm run check # 仅检查（不修改文件）

# 添加共享 UI 组件
npx shadcn@latest add <component> -c packages/ui

# 构建
npm run build
```

## 重要约束

- **雷达图必须使用原生 SVG** — 禁止引入第三方图表库（性能要求）
- **支付签名必须在后端完成** — 禁止前端明文存储密钥或订单敏感信息
- **JWT Token 需支持过期与刷新** — 由 Better Auth 管理
- **响应式布局** — Mobile/Tablet/PC 全适配，答题时底部 Tab Bar 隐藏
- **共享 UI 组件统一放 `packages/ui`** — 应用特定 block 才放 `apps/web/src`
- **环境变量通过 `packages/env` 统一访问** — 不直接使用 `process.env`（类型不安全）

## 产品功能模块（PRD 摘要）

| 模块 | 状态 | 说明 |
|------|------|------|
| 首页 (Home) | v1.0 | Hero 区 + DISC 维度介绍 + FAB |
| 答题 (Quiz) | v1.0 | 24 题，进度条，单选卡片 |
| 结果 (Result) | v1.0 | 雷达图 + 百分比条 + 深度解析入口 |
| 深度解析 (Detail) | v1.0 | 优势/沟通风格/成长矩阵 |
| 历史记录 (History) | v1.0 | localStorage + 搜索过滤 + 删除 |
| 用户认证 (Auth) | **当前版本** | 邮箱/密码 + 微信扫码/H5 授权 |
| 支付下载 (Payment) | **当前版本** | 微信支付/支付宝 + PDF 报告解锁 |

详细需求见 [doc/prd.md](../doc/prd.md)

## 工作流文档

- [需求管理](requirements/) — 使用 `/yjy:prd` 命令创建和管理需求
- [开发工作流](docs/) — 使用 `/yjy:ai` 命令查看完整开发流程

---

# Ultracite Code Standards

This project uses **Ultracite**, a zero-config preset that enforces strict code quality standards through automated formatting and linting.

## Quick Reference

- **Format code**: `npm exec -- ultracite fix`
- **Check for issues**: `npm exec -- ultracite check`
- **Diagnose setup**: `npm exec -- ultracite doctor`

Biome (the underlying engine) provides robust linting and formatting. Most issues are automatically fixable.

---

## Core Principles

Write code that is **accessible, performant, type-safe, and maintainable**. Focus on clarity and explicit intent over brevity.

### Type Safety & Explicitness

- Use explicit types for function parameters and return values when they enhance clarity
- Prefer `unknown` over `any` when the type is genuinely unknown
- Use const assertions (`as const`) for immutable values and literal types
- Leverage TypeScript's type narrowing instead of type assertions
- Use meaningful variable names instead of magic numbers - extract constants with descriptive names

### Modern JavaScript/TypeScript

- Use arrow functions for callbacks and short functions
- Prefer `for...of` loops over `.forEach()` and indexed `for` loops
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safer property access
- Prefer template literals over string concatenation
- Use destructuring for object and array assignments
- Use `const` by default, `let` only when reassignment is needed, never `var`

### Async & Promises

- Always `await` promises in async functions - don't forget to use the return value
- Use `async/await` syntax instead of promise chains for better readability
- Handle errors appropriately in async code with try-catch blocks
- Don't use async functions as Promise executors

### React & JSX

- Use function components over class components
- Call hooks at the top level only, never conditionally
- Specify all dependencies in hook dependency arrays correctly
- Use the `key` prop for elements in iterables (prefer unique IDs over array indices)
- Nest children between opening and closing tags instead of passing as props
- Don't define components inside other components
- Use semantic HTML and ARIA attributes for accessibility:
  - Provide meaningful alt text for images
  - Use proper heading hierarchy
  - Add labels for form inputs
  - Include keyboard event handlers alongside mouse events
  - Use semantic elements (`<button>`, `<nav>`, etc.) instead of divs with roles

### Error Handling & Debugging

- Remove `console.log`, `debugger`, and `alert` statements from production code
- Throw `Error` objects with descriptive messages, not strings or other values
- Use `try-catch` blocks meaningfully - don't catch errors just to rethrow them
- Prefer early returns over nested conditionals for error cases

### Code Organization

- Keep functions focused and under reasonable cognitive complexity limits
- Extract complex conditions into well-named boolean variables
- Use early returns to reduce nesting
- Prefer simple conditionals over nested ternary operators
- Group related code together and separate concerns

### Security

- Add `rel="noopener"` when using `target="_blank"` on links
- Avoid `dangerouslySetInnerHTML` unless absolutely necessary
- Don't use `eval()` or assign directly to `document.cookie`
- Validate and sanitize user input

### Performance

- Avoid spread syntax in accumulators within loops
- Use top-level regex literals instead of creating them in loops
- Prefer specific imports over namespace imports
- Avoid barrel files (index files that re-export everything)
- Use proper image components (e.g., Next.js `<Image>`) over `<img>` tags

### Framework-Specific Guidance

**React 19+:**

- Use ref as a prop instead of `React.forwardRef`

**React Router v7:**

- 使用 `@react-router/fs-routes` 基于文件系统路由
- 路由文件放在 `apps/web/src/routes/`

---

## Testing

- Write assertions inside `it()` or `test()` blocks
- Avoid done callbacks in async tests - use async/await instead
- Don't use `.only` or `.skip` in committed code
- Keep test suites reasonably flat - avoid excessive `describe` nesting

## When Biome Can't Help

Biome's linter will catch most issues automatically. Focus your attention on:

1. **Business logic correctness** - Biome can't validate your algorithms
2. **Meaningful naming** - Use descriptive names for functions, variables, and types
3. **Architecture decisions** - Component structure, data flow, and API design
4. **Edge cases** - Handle boundary conditions and error states
5. **User experience** - Accessibility, performance, and usability considerations

---

Most formatting and common issues are automatically fixed by Biome. Run `npm exec -- ultracite fix` before committing to ensure compliance.
