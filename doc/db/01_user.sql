CREATE TABLE IF NOT EXISTS `user` (
  `id`              VARCHAR(36)  NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `email`           VARCHAR(255) NOT NULL,
  `email_verified`  TINYINT(1)   NOT NULL DEFAULT 0,
  `image`           TEXT,
  `wechat_open_id`  VARCHAR(64),
  `wechat_union_id` VARCHAR(64),
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`),
  UNIQUE KEY `uq_user_wechat_open_id` (`wechat_open_id`)
)
