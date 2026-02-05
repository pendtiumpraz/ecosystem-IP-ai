-- Universe Field Images Table
-- Stores generated images for each field in Universe Formula with versioning

CREATE TABLE IF NOT EXISTS universe_field_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
  field_key VARCHAR(100) NOT NULL,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 8),
  version_number INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  thumbnail_url TEXT,
  enhanced_prompt TEXT,
  original_description TEXT,
  style VARCHAR(100),
  model_used VARCHAR(100),
  provider VARCHAR(100),
  credit_cost INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(project_id, COALESCE(story_id, '00000000-0000-0000-0000-000000000000'::uuid), field_key, version_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_universe_images_project ON universe_field_images(project_id);
CREATE INDEX IF NOT EXISTS idx_universe_images_story ON universe_field_images(story_id);
CREATE INDEX IF NOT EXISTS idx_universe_images_field ON universe_field_images(field_key);
CREATE INDEX IF NOT EXISTS idx_universe_images_active ON universe_field_images(project_id, field_key, is_active) WHERE is_active = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_universe_images_deleted ON universe_field_images(project_id, deleted_at) WHERE deleted_at IS NOT NULL;

-- Add comment
COMMENT ON TABLE universe_field_images IS 'Stores AI-generated images for Universe Formula fields with versioning and soft delete';
