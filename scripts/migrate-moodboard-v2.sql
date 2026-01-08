-- Moodboard V2 Migration Script
-- Creates tables for moodboard with key actions breakdown

-- ============================================
-- TABLE: moodboards
-- One moodboard per story version
-- ============================================
CREATE TABLE IF NOT EXISTS moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  story_version_id UUID NOT NULL REFERENCES story_versions(id) ON DELETE CASCADE,
  
  -- Settings
  art_style VARCHAR(50) DEFAULT 'realistic',
  key_action_count INTEGER DEFAULT 7 CHECK (key_action_count >= 3 AND key_action_count <= 10),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT unique_story_version_moodboard UNIQUE(story_version_id)
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_moodboards_project ON moodboards(project_id);
CREATE INDEX IF NOT EXISTS idx_moodboards_story_version ON moodboards(story_version_id);
CREATE INDEX IF NOT EXISTS idx_moodboards_deleted ON moodboards(deleted_at) WHERE deleted_at IS NULL;

-- ============================================
-- TABLE: moodboard_items
-- Each key action within a beat
-- ============================================
CREATE TABLE IF NOT EXISTS moodboard_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  
  -- Beat information (from story structure)
  beat_key VARCHAR(100) NOT NULL,       -- e.g., "ordinary_world", "call_to_adventure"
  beat_label VARCHAR(255) NOT NULL,     -- e.g., "Ordinary World"
  beat_content TEXT,                     -- Story beat description
  beat_index INTEGER NOT NULL,           -- Order of beat in story (1, 2, 3...)
  
  -- Key action (within beat)
  key_action_index INTEGER NOT NULL,     -- 1 to key_action_count
  key_action_description TEXT,           -- Generated key action description
  
  -- Characters & Universe
  characters_involved UUID[],            -- Array of character IDs in this action
  universe_level VARCHAR(100),           -- e.g., "room_cave", "village_kingdom"
  
  -- Image generation
  prompt TEXT,                           -- Image generation prompt
  negative_prompt TEXT,                  -- Negative prompt for image gen
  image_url TEXT,                        -- Generated image URL
  
  -- Video generation (for later)
  video_prompt TEXT,                     -- Video animation prompt
  video_url TEXT,                        -- Generated video URL
  
  -- Edit history
  previous_image_url TEXT,               -- For undo/compare feature
  edit_count INTEGER DEFAULT 0,          -- Number of edits made
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'empty',    -- empty, has_description, has_prompt, has_image, has_video
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_moodboard_beat_action UNIQUE(moodboard_id, beat_key, key_action_index)
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_moodboard_items_moodboard ON moodboard_items(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_items_beat ON moodboard_items(beat_key);
CREATE INDEX IF NOT EXISTS idx_moodboard_items_status ON moodboard_items(status);
CREATE INDEX IF NOT EXISTS idx_moodboard_items_beat_order ON moodboard_items(moodboard_id, beat_index, key_action_index);

-- ============================================
-- FUNCTION: Update timestamp trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_moodboard_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to moodboards
DROP TRIGGER IF EXISTS trigger_moodboards_updated_at ON moodboards;
CREATE TRIGGER trigger_moodboards_updated_at
  BEFORE UPDATE ON moodboards
  FOR EACH ROW
  EXECUTE FUNCTION update_moodboard_updated_at();

-- Apply trigger to moodboard_items
DROP TRIGGER IF EXISTS trigger_moodboard_items_updated_at ON moodboard_items;
CREATE TRIGGER trigger_moodboard_items_updated_at
  BEFORE UPDATE ON moodboard_items
  FOR EACH ROW
  EXECUTE FUNCTION update_moodboard_updated_at();

-- ============================================
-- COMMENT: Table descriptions
-- ============================================
COMMENT ON TABLE moodboards IS 'Stores moodboard settings per story version. One story version has one moodboard.';
COMMENT ON TABLE moodboard_items IS 'Stores individual key actions within story beats. Each beat has multiple key actions with prompts and images.';

COMMENT ON COLUMN moodboards.art_style IS 'Visual style for image generation: realistic, anime, ghibli, disney, etc.';
COMMENT ON COLUMN moodboards.key_action_count IS 'Number of key actions per beat (default 7, configurable 3-10)';

COMMENT ON COLUMN moodboard_items.beat_key IS 'Unique key for the story beat, e.g., ordinary_world';
COMMENT ON COLUMN moodboard_items.beat_index IS 'Order of beat in story structure (1-based)';
COMMENT ON COLUMN moodboard_items.key_action_index IS 'Order of key action within beat (1 to key_action_count)';
COMMENT ON COLUMN moodboard_items.status IS 'Generation status: empty, has_description, has_prompt, has_image, has_video';
COMMENT ON COLUMN moodboard_items.characters_involved IS 'Array of character UUIDs that appear in this key action';
COMMENT ON COLUMN moodboard_items.universe_level IS 'Universe level/location for this scene';
