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
)
