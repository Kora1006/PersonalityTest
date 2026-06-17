CREATE TABLE IF NOT EXISTS `verification` (
  `id`          VARCHAR(36)  NOT NULL,
  `identifier`  VARCHAR(255) NOT NULL,
  `value`       TEXT         NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `verification_identifier_idx` (`identifier`)
)
