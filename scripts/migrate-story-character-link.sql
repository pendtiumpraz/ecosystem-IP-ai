-- Story-Character Linking Migration
-- Adds structure_type and character_ids to story_versions table

-- Add structure_type column (locked at creation)
ALTER TABLE story_versions 
ADD COLUMN IF NOT EXISTS structure_type TEXT DEFAULT 'hero-journey';

-- Add character_ids as TEXT array (stores UUIDs of characters used in this story)
ALTER TABLE story_versions 
ADD COLUMN IF NOT EXISTS character_ids TEXT[] DEFAULT '{}';

-- Add episode_number for ordering
ALTER TABLE story_versions 
ADD COLUMN IF NOT EXISTS episode_number INTEGER DEFAULT 1;

-- Update existing stories to have structure_type based on their data
-- (If they have beats, try to detect structure type)
UPDATE story_versions 
SET structure_type = 'hero-journey' 
WHERE structure_type IS NULL;

-- Create index for faster character lookups
CREATE INDEX IF NOT EXISTS idx_story_versions_character_ids 
ON story_versions USING GIN (character_ids);

-- Success message
SELECT 'Migration complete: story_versions now has structure_type, character_ids, and episode_number columns' as status;
