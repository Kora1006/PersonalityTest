-- ============================================================
-- PersonalityTest — 数据库初始化脚本
-- 兼容：MySQL 8.0 / 腾讯云 CloudBase TDSQL
-- ============================================================

-- 1. user
CREATE TABLE IF NOT EXISTS `user` (
  `id`              VARCHAR(36)  NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `email`           VARCHAR(255) NOT NULL,
  `email_verified`  TINYINT(1)  NOT NULL DEFAULT 0,
  `image`           TEXT,
  `wechat_open_id`  VARCHAR(64),
  `wechat_union_id` VARCHAR(64),
  `created_at`      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `uq_user_wechat_open_id` (`wechat_open_id`)
);

-- 2. session
CREATE TABLE IF NOT EXISTS `session` (
  `id`          VARCHAR(36)  NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `token`       VARCHAR(255) NOT NULL,
  `ip_address`  TEXT,
  `user_agent`  TEXT,
  `user_id`     VARCHAR(36)  NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_session_token` (`token`),
  KEY `session_userId_idx` (`user_id`)
);

-- 3. account
CREATE TABLE IF NOT EXISTS `account` (
  `id`                       VARCHAR(36)  NOT NULL,
  `account_id`               VARCHAR(255) NOT NULL,
  `provider_id`              VARCHAR(64)  NOT NULL,
  `user_id`                  VARCHAR(36)  NOT NULL,
  `access_token`             TEXT,
  `refresh_token`            TEXT,
  `id_token`                 TEXT,
  `access_token_expires_at`  DATETIME,
  `refresh_token_expires_at` DATETIME,
  `scope`                    VARCHAR(255),
  `password`                 TEXT,
  `created_at`               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`               DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_userId_idx` (`user_id`)
);

-- 4. verification
CREATE TABLE IF NOT EXISTS `verification` (
  `id`          VARCHAR(36)  NOT NULL,
  `identifier`  VARCHAR(255) NOT NULL,
  `value`       TEXT         NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `verification_identifier_idx` (`identifier`)
);

-- 5. assessments
-- dominant_type: D | I | S | C
-- mode: full（40题）| quick（20题）
-- theme: professional | relationship | leadership
CREATE TABLE IF NOT EXISTS `assessments` (
  `id`            VARCHAR(36)  NOT NULL,
  `user_id`       VARCHAR(36)  NOT NULL,
  `date`          DATE         NOT NULL,
  `dominant_type` VARCHAR(1)   NOT NULL,
  `score_d`       INT          NOT NULL DEFAULT 0,
  `score_i`       INT          NOT NULL DEFAULT 0,
  `score_s`       INT          NOT NULL DEFAULT 0,
  `score_c`       INT          NOT NULL DEFAULT 0,
  `note`          TEXT,
  `is_paid`       TINYINT(1)   NOT NULL DEFAULT 0,
  `is_unlocked`   TINYINT(1)   NOT NULL DEFAULT 0,
  `mode`          VARCHAR(10)  NOT NULL DEFAULT 'full',
  `theme`         VARCHAR(20)  NOT NULL DEFAULT 'professional',
  `created_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assessments_user_id` (`user_id`),
  KEY `idx_assessments_created_at` (`created_at`)
);

-- 6. invitations
-- status: pending | completed | expired
CREATE TABLE IF NOT EXISTS `invitations` (
  `id`                VARCHAR(36) NOT NULL,
  `inviter_id`        VARCHAR(36) NOT NULL,
  `inviter_result_id` VARCHAR(36) NOT NULL,
  `invitee_id`        VARCHAR(36),
  `invitee_result_id` VARCHAR(36),
  `status`            VARCHAR(20) NOT NULL DEFAULT 'pending',
  `created_at`        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`      DATETIME,
  PRIMARY KEY (`id`),
  KEY `idx_invitations_inviter_id` (`inviter_id`),
  KEY `idx_invitations_status` (`status`)
);

-- 7. orders
-- amount: 分（如 1900 = ¥19.00）
-- payment_method: wechat | alipay
-- status: pending | paid | failed | refunded
CREATE TABLE IF NOT EXISTS `orders` (
  `id`                VARCHAR(36)  NOT NULL,
  `user_id`           VARCHAR(36)  NOT NULL,
  `assessment_id`     VARCHAR(36)  NOT NULL,
  `amount`            INT          NOT NULL,
  `currency`          VARCHAR(3)   NOT NULL DEFAULT 'CNY',
  `payment_method`    VARCHAR(20),
  `status`            VARCHAR(20)  NOT NULL DEFAULT 'pending',
  `is_paid`           TINYINT(1)   NOT NULL DEFAULT 0,
  `wechat_prepay_id`  VARCHAR(64),
  `alipay_trade_no`   VARCHAR(64),
  `paid_at`           DATETIME,
  `expires_at`        DATETIME,
  `created_at`        DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_orders_user_id` (`user_id`),
  KEY `idx_orders_assessment_id` (`assessment_id`),
  KEY `idx_orders_status` (`status`)
);
