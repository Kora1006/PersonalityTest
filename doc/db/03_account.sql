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
)
