-- Add unique index on rewards for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS rewards_user_type_ref_unique ON rewards (user_id, type, reference_id) WHERE reference_id IS NOT NULL;
