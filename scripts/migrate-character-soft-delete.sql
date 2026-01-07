-- Add deleted_at column to characters table for soft delete

ALTER TABLE characters ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_characters_deleted ON characters(deleted_at);
