-- Character Image Versions Migration
-- Run this to create the character_image_versions table

-- Create the table
CREATE TABLE IF NOT EXISTS character_image_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign Keys
    character_id UUID NOT NULL,
    project_id UUID NOT NULL,
    user_id UUID NOT NULL,
    
    -- Version Info
    version_name VARCHAR(255) NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Image Data
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    drive_file_id TEXT,
    drive_web_view_link TEXT,
    
    -- Generation Settings (from modal)
    template VARCHAR(50),
    art_style VARCHAR(50),
    aspect_ratio VARCHAR(20),
    action_pose VARCHAR(50),
    
    -- References
    character_ref_url TEXT,
    background_ref_url TEXT,
    
    -- Prompts
    additional_prompt TEXT,
    full_prompt_used TEXT,
    
    -- Character Data Snapshot
    character_data_snapshot JSONB,
    
    -- AI/Model Info
    model_used VARCHAR(100),
    model_provider VARCHAR(50),
    credit_cost INTEGER DEFAULT 0,
    generation_time_ms INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_char_img_ver_char_id ON character_image_versions(character_id);
CREATE INDEX IF NOT EXISTS idx_char_img_ver_project_id ON character_image_versions(project_id);
CREATE INDEX IF NOT EXISTS idx_char_img_ver_user_id ON character_image_versions(user_id);
CREATE INDEX IF NOT EXISTS idx_char_img_ver_active ON character_image_versions(character_id, is_active);

-- Add comment
COMMENT ON TABLE character_image_versions IS 'Stores all generated images for characters with their generation settings';
