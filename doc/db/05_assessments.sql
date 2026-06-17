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
)
