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
)
