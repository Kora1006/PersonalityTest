-- ============================================================
-- PersonalityTest — 数据库初始化脚本
-- 数据库引擎：MySQL 8.0+
-- 字符集：utf8mb4 / utf8mb4_unicode_ci
-- 生成来源：packages/db/src/schema/
-- ============================================================

CREATE DATABASE IF NOT EXISTS personality_test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE personality_test;

-- ------------------------------------------------------------
-- 1. user — 用户表（Better Auth 核心表）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id`              VARCHAR(36)   NOT NULL,
  `name`            VARCHAR(255)  NOT NULL,
  `email`           VARCHAR(255)  NOT NULL,
  `email_verified`  TINYINT(1)    NOT NULL DEFAULT 0,
  `image`           TEXT,
  `wechat_open_id`  VARCHAR(64),
  `wechat_union_id` VARCHAR(64),
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `uq_user_wechat_open_id` (`wechat_open_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户账户，支持邮箱密码与微信登录';

-- ------------------------------------------------------------
-- 2. session — 登录会话表（Better Auth）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `session` (
  `id`          VARCHAR(36)   NOT NULL,
  `expires_at`  DATETIME      NOT NULL,
  `token`       VARCHAR(255)  NOT NULL,
  `ip_address`  TEXT,
  `user_agent`  TEXT,
  `user_id`     VARCHAR(36)   NOT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_token` (`token`),
  KEY `session_userId_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='用户登录会话，7天有效期';

-- ------------------------------------------------------------
-- 3. account — OAuth 账号绑定表（Better Auth）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `account` (
  `id`                       VARCHAR(36)   NOT NULL,
  `account_id`               VARCHAR(255)  NOT NULL,
  `provider_id`              VARCHAR(64)   NOT NULL,
  `user_id`                  VARCHAR(36)   NOT NULL,
  `access_token`             TEXT,
  `refresh_token`            TEXT,
  `id_token`                 TEXT,
  `access_token_expires_at`  DATETIME,
  `refresh_token_expires_at` DATETIME,
  `scope`                    VARCHAR(255),
  `password`                 TEXT,
  `created_at`               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`               DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_userId_idx` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='OAuth 第三方账号绑定（邮箱密码/微信）';

-- ------------------------------------------------------------
-- 4. verification — 邮箱验证令牌表（Better Auth）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `verification` (
  `id`          VARCHAR(36)   NOT NULL,
  `identifier`  VARCHAR(255)  NOT NULL,
  `value`       TEXT          NOT NULL,
  `expires_at`  DATETIME      NOT NULL,
  `created_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `verification_identifier_idx` (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='邮件验证/密码重置一次性令牌';

-- ------------------------------------------------------------
-- 5. assessments — DISC 测评结果表
-- ------------------------------------------------------------
-- dominant_type: D | I | S | C
-- mode:          full（40题）| quick（20题）
-- theme:         professional | relationship | leadership
-- is_paid:       是否已付费解锁 PDF
-- is_unlocked:   分享裂变解锁（邀请3人）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `assessments` (
  `id`            VARCHAR(36)   NOT NULL,
  `user_id`       VARCHAR(36)   NOT NULL,
  `date`          DATE          NOT NULL,
  `dominant_type` VARCHAR(1)    NOT NULL COMMENT 'D|I|S|C',
  `score_d`       INT           NOT NULL DEFAULT 0,
  `score_i`       INT           NOT NULL DEFAULT 0,
  `score_s`       INT           NOT NULL DEFAULT 0,
  `score_c`       INT           NOT NULL DEFAULT 0,
  `note`          TEXT,
  `is_paid`       TINYINT(1)    NOT NULL DEFAULT 0,
  `is_unlocked`   TINYINT(1)    NOT NULL DEFAULT 0,
  `mode`          VARCHAR(10)   NOT NULL DEFAULT 'full'         COMMENT 'full|quick',
  `theme`         VARCHAR(20)   NOT NULL DEFAULT 'professional' COMMENT 'professional|relationship|leadership',
  `created_at`    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assessments_user_id` (`user_id`),
  KEY `idx_assessments_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='DISC 测评结果，支持职场/情感/管理三种主题';

-- ------------------------------------------------------------
-- 6. invitations — 好友邀请对比表
-- ------------------------------------------------------------
-- 邀请流程：inviter 生成邀请链接 → invitee 完成测评 → 双方查看对比报告
-- status: pending | completed | expired
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `invitations` (
  `id`                VARCHAR(36)   NOT NULL,
  `inviter_id`        VARCHAR(36)   NOT NULL,
  `inviter_result_id` VARCHAR(36)   NOT NULL,
  `invitee_id`        VARCHAR(36),
  `invitee_result_id` VARCHAR(36),
  `status`            VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending|completed|expired',
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`      DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_invitations_inviter_id` (`inviter_id`),
  KEY `idx_invitations_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='好友邀请，完成后可查看双方 DISC 对比报告';

-- ------------------------------------------------------------
-- 7. orders — 支付订单表
-- ------------------------------------------------------------
-- amount: 分（人民币最小单位，如 1900 = ¥19.00）
-- currency: CNY
-- payment_method: wechat | alipay
-- status: pending | paid | failed | refunded
-- is_paid: 支付成功标记（冗余字段，便于快速查询）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                VARCHAR(36)   NOT NULL,
  `user_id`           VARCHAR(36)   NOT NULL,
  `assessment_id`     VARCHAR(36)   NOT NULL,
  `amount`            INT           NOT NULL COMMENT '单位：分',
  `currency`          VARCHAR(3)    NOT NULL DEFAULT 'CNY',
  `payment_method`    VARCHAR(20)             COMMENT 'wechat|alipay',
  `status`            VARCHAR(20)   NOT NULL DEFAULT 'pending' COMMENT 'pending|paid|failed|refunded',
  `is_paid`           TINYINT(1)    NOT NULL DEFAULT 0,
  `wechat_prepay_id`  VARCHAR(64),
  `alipay_trade_no`   VARCHAR(64),
  `paid_at`           DATETIME,
  `expires_at`        DATETIME,
  `created_at`        DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_assessment_id` (`assessment_id`),
  KEY `idx_orders_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='支付订单，关联微信支付/支付宝，用于解锁 PDF 报告';

-- ============================================================
-- 初始化完成
-- 表创建顺序（逻辑依赖）：
--   user → session, account, verification
--   user + assessments → invitations
--   user + assessments → orders
-- ============================================================
