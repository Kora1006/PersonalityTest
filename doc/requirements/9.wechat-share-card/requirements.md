# wechat-share-card — 需求规格

## 概述

在 H5 Web 端接入微信 JS-SDK，使结果页与深度解析页在微信内分享时展示带复合类型缩略图和自定义文案的分享卡片，同时打通邀请承接页完成邀请解锁的完整链路。

## 项目信息

- 项目名: PersonalityTest
- 架构类型: Monorepo (Turborepo)

## 需求版本

| 日期       | 版本 | 说明     |
| ---------- | ---- | -------- |
| 2026-06-18 | v1   | 初始需求 |

## 用户故事

- 作为完成测评的用户，我想要在微信内分享结果时看到带复合类型缩略图的分享卡片，以便朋友更容易点击查看
- 作为想免费解锁报告的用户，我想要分享邀请链接给朋友，以便邀请 2 人完成测评后自动解锁深度报告
- 作为被邀请的朋友，我想要点击分享卡片后看到邀请人的性格类型预览，以便了解测评的意义后再决定参与

## 功能需求

1. [F-001] 后端新增 JSSDK 签名接口，根据页面 URL 返回 appId、timestamp、nonceStr、signature
2. [F-002] 后端新增 `getInvitationPreview` 公开接口，返回邀请人的复合类型和昵称（不暴露分数明细）
3. [F-003] 前端新增 `getCompositeType(scores)` 工具函数，从四维得分计算复合类型（取最高分和第二高分的 DISC 字母组合，共 12 种）
4. [F-004] 前端新增 `use-wechat-share` Hook，仅在微信 UA 下生效，完成 JSSDK 动态加载 → 签名获取 → wx.config → wx.ready → 设置自定义分享数据的完整流程
5. [F-005] 结果页（`/result`）集成分享 Hook，分享标题含复合类型名称，描述含四维分数，缩略图使用对应复合类型的 CDN 静态图
6. [F-006] 深度解析页（`/detail`）集成分享 Hook，已登录用户先调用 `createInvitation` 获取邀请链接后再配置分享，未登录用户 fallback 到当前页 URL
7. [F-007] 前端新增邀请承接页 `/invite/:invitationId`，展示邀请人复合类型预览，引导被邀请人完成测评，测评后自动调用 `completeInvitation` 并更新邀请解锁进度

## 非功能需求

- 性能: JSSDK 仅在微信 UA 下动态加载，非微信环境零额外请求
- 安全: jsapi_ticket 和 access_token 均在服务端缓存，不下发给前端；签名 URL 严格使用当前页面完整 URL（不含 hash）
- 兼容性: 支持微信 7.0.12+ 版本（使用 `updateAppMessageShareData` 而非废弃的 `onMenuShareAppMessage`）
- 降级: `WECHAT_APP_ID` 未配置时签名接口返回 mock 数据，不报 500，本地开发不崩溃

## 验收标准

- [ ] [AC-001] 在微信内打开结果页，右上角分享给朋友，卡片显示复合类型名称标题、四维分数描述和对应类型缩略图
- [ ] [AC-002] 分享卡片的缩略图与用户复合类型匹配（最高分 + 第二高分的 2 字母组合）
- [ ] [AC-003] 在 Chrome/Safari 中打开结果页，控制台无 JSSDK 相关 JS 错误
- [ ] [AC-004] 深度解析页已登录用户分享，链接为 `/invite/:invitationId`
- [ ] [AC-005] 深度解析页未登录用户分享，链接 fallback 为当前页 URL
- [ ] [AC-006] 访问 `/invite/:invitationId` 页面可看到邀请人复合类型预览和"开始测评"入口
- [ ] [AC-007] 被邀请人完成测评后，`getUnlockStatus` 中 `inviteCount` 正确递增
- [ ] [AC-008] jsapi_ticket 缓存有效，连续刷新同一页面不重复调用微信接口（服务器日志可验证）

## 功能范围

**In Scope:**
- H5 Web 端 JSSDK 分享卡（发送给朋友）
- 邀请承接页完整流程
- 基于 12 种复合类型的静态缩略图映射

**Out of Scope:**
- 朋友圈分享（微信规则限制，缩略图无法自定义）
- 小程序端分享（已有 Canvas 动态绘制方案，不动）
- 动态 OG 图生成（含用户实时分数的服务端渲染图片）
- 分享次数埋点统计

## 依赖

- 微信公众号已完成 JS 接口安全域名配置（需运维配置，不在代码范围）
- CDN 上已有 12 张静态缩略图（`share-di.png` ~ `share-cs.png`），CDN base: `https://7072-prod-d1gj2nkrx05fb1c16-1444533815.tcb.qcloud.la/static-images`
- 现有 `WECHAT_APP_ID` / `WECHAT_APP_SECRET` env 变量（`packages/env/src/server.ts` 已定义）
- 现有 `invitationRouter.createInvitation` / `completeInvitation` / `getUnlockStatus`（`packages/api/src/routers/invitation.ts`）

## 开放问题

- 12 张静态缩略图的完整 CDN 命名规则需与设计确认（本文档假设为 `share-{type小写}.png`，如 `share-di.png`）
