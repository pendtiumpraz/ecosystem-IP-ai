-- Add moodboard versioning support
-- 1. Add version columns to moodboards table
ALTER TABLE moodboards 
ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS version_name VARCHAR(255) DEFAULT 'v1';

-- 2. Update existing moodboards to have version 1
UPDATE moodboards SET version_number = 1, version_name = 'v1' WHERE version_number IS NULL;

-- 3. Create index for faster version queries
CREATE INDEX IF NOT EXISTS idx_moodboards_story_version ON moodboards (story_version_id, version_number);
