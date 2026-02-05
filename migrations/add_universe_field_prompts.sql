-- Universe Field Prompts Table
-- Stores enhanced prompts for each field separately from images

CREATE TABLE IF NOT EXISTS universe_field_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  story_id UUID,
  field_key VARCHAR(100) NOT NULL,
  level_number INTEGER NOT NULL DEFAULT 0,
  enhanced_prompt TEXT,
  prompt_reference TEXT,
  original_description TEXT,
  model_used VARCHAR(100),
  provider VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, COALESCE(story_id, '00000000-0000-0000-0000-000000000000'::uuid), field_key)
);

CREATE INDEX IF NOT EXISTS idx_universe_prompts_project ON universe_field_prompts(project_id);
CREATE INDEX IF NOT EXISTS idx_universe_prompts_story ON universe_field_prompts(story_id);
CREATE INDEX IF NOT EXISTS idx_universe_prompts_field ON universe_field_prompts(field_key);
