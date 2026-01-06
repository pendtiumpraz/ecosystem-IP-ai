-- Story Versions Migration
-- Creates story_versions table for version control of stories

-- Create story_versions table
CREATE TABLE IF NOT EXISTS story_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL,
  project_id UUID NOT NULL,
  
  -- Version info
  version_number INTEGER NOT NULL DEFAULT 1,
  version_name VARCHAR(255), -- Auto-generated: "Save the Cat v1", "Hero's Journey v2"
  is_active BOOLEAN DEFAULT FALSE,
  
  -- Story data
  premise TEXT,
  synopsis TEXT,
  global_synopsis TEXT,
  genre VARCHAR(100),
  sub_genre VARCHAR(100),
  format VARCHAR(100),
  duration VARCHAR(100),
  tone VARCHAR(100),
  theme VARCHAR(255),
  conflict TEXT,
  target_audience VARCHAR(255),
  ending_type VARCHAR(100),
  structure VARCHAR(100), -- 'Save the Cat', 'The Hero's Journey', 'Dan Harmon Story Circle'
  
  -- Beat data (JSONB)
  cat_beats JSONB DEFAULT '{}',
  hero_beats JSONB DEFAULT '{}',
  harmon_beats JSONB DEFAULT '{}',
  
  -- Additional data
  tension_levels JSONB DEFAULT '{}',
  want_need_matrix JSONB DEFAULT '{}',
  beat_characters JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL -- Soft delete
);

-- Migrate existing stories data to story_versions (first version for each)
INSERT INTO story_versions (
  story_id, project_id, version_number, version_name, is_active,
  premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
  tone, theme, conflict, target_audience, ending_type, structure,
  cat_beats, hero_beats, harmon_beats, tension_levels, want_need_matrix, beat_characters,
  created_at, updated_at
)
SELECT 
  id AS story_id, 
  project_id, 
  1 AS version_number, 
  COALESCE(structure, 'Save the Cat') || ' v1' AS version_name,
  TRUE AS is_active,
  premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
  tone, theme, conflict, target_audience, ending_type, 
  COALESCE(structure, 'Save the Cat') AS structure,
  COALESCE(cat_beats, '{}')::jsonb, 
  COALESCE(hero_beats, '{}')::jsonb, 
  COALESCE(harmon_beats, '{}')::jsonb,
  COALESCE(tension_levels, '{}')::jsonb, 
  COALESCE(want_need_matrix, '{}')::jsonb, 
  COALESCE(beat_characters, '{}')::jsonb,
  created_at, updated_at
FROM stories
WHERE deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_story_versions_story ON story_versions(story_id);
CREATE INDEX IF NOT EXISTS idx_story_versions_project ON story_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_story_versions_active ON story_versions(story_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_story_versions_not_deleted ON story_versions(project_id) WHERE deleted_at IS NULL;
