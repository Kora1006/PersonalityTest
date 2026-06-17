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
)
