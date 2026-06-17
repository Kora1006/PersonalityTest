# Taro 微信小程序迁移 — 任务清单 ✓

## 任务版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-15 | v1   | 初始任务 |
| 2026-06-15 | v2   | 全部任务完成 |

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Monorepo（npm workspaces + Turborepo）
- Specs 路径: doc/requirements/6.taro-miniprogram-migration/

## 任务列表

### 功能 1: 项目初始化

- [x] T-001: 在 `apps/miniprogram/` 初始化 Taro 4 React TypeScript 项目，配置 `package.json` 引用 workspace 包，更新 `turbo.json` 添加 `build:weapp` pipeline ~1h
- [x] T-002: 配置 `app.config.ts` 分包策略（主包：首页+登录，分包：答题/结果/历史），验证主包 < 2MB ~30min

### 功能 2: Canvas 雷达图组件

- [x] T-003: PoC 验证——Canvas 2D API 绘制四边雷达图，动画方案：requestAnimationFrame 逐帧绘制 ~1h
- [x] T-004: 实现 `radar-canvas` 组件，极坐标→笛卡尔坐标转换复用 Web 版逻辑，cubic ease-out 动画 ~2h

### 功能 3: 页面迁移

- [x] T-005: 迁移首页（`pages/index`）：Hero 区 + 快速/完整测评双入口 + DISC 维度卡片 + Stats 区 ~2h
- [x] T-006: 迁移答题页（`pages/quiz`）：24/12 题模式 + 进度条 + 单选卡片 + 底部操作条 ~2h
- [x] T-007: 迁移结果页（`pages/result`）：Canvas 雷达图 + 百分比条动画 + 性格画像 + 快速版升级引导 ~2h
- [x] T-008: 迁移深度解析页（`pages/detail`）：优势卡片 + 职场表现 + 沟通风格 + 成长矩阵 + 邀请解锁 CTA ~1h
- [x] T-009: 迁移历史记录页（`pages/history`）：`Taro.setStorageSync` 替换 localStorage + 搜索 + 删除 ~1h
- [x] T-010: 迁移登录页（`pages/auth`）：邮箱密码表单 + 微信登录 + 已登录 Profile 展示 ~1h

### 功能 4: 微信登录接入

- [x] T-011: `packages/db` `wechat_openid` / `wechat_unionid` 字段已存在，验证通过（已在先前版本中完成）~0min
- [x] T-012: `packages/auth` Better Auth 现有配置，微信登录通过独立 Hono router 处理（无需修改 auth package）~0min
- [x] T-013: `apps/server/src/wechat.ts` 新增 `POST /miniprogram-login` 端点，处理 jscode2session → 创建用户 → 返回 JWT ~1h
- [x] T-014: 小程序端 `pages/auth` 实现 `wx.login()` + 调用 `/api/auth/wechat/miniprogram-login` + 存储 JWT token ~30min

### 功能 5: 审核合规

- [x] T-015: 新建隐私政策页（`pages/privacy`）和用户协议页（`pages/terms`），内容符合微信规范，措辞避开敏感词 ~30min

### 集成与测试

- [ ] T-016: 微信开发者工具全流程联调（需微信开发者工具环境）
- [ ] T-017: iOS + Android 真机测试（需真机设备）

## 依赖关系

- T-001、T-002 是所有其他任务的前置（已完成）
- T-016、T-017 需要微信开发者工具和 AppID，留待开发环境就绪后执行

## 风险点

- **Canvas 动画**：使用 requestAnimationFrame + cubic ease-out，若目标设备不支持，降级为静态图
- **AppID**：T-016/T-017 需先申请微信小程序 AppID，更新 `project.config.json` 中的 `appid` 字段
- **域名备案**：服务端域名需 HTTPS + ICP 备案，才能在非开发模式下发起 request
