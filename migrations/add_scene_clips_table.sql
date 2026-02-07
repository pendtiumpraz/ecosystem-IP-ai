-- Migration: Add scene_clips table for storyboard restructure
-- Created: 2026-02-07

-- Scene Clips Table
-- Stores video clip versions for each scene (generated via Seedance i2v)
CREATE TABLE IF NOT EXISTS scene_clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    shot_id UUID REFERENCES scene_shots(id) ON DELETE SET NULL,           -- Optional: specific shot being animated
    image_version_id UUID REFERENCES scene_image_versions(id) ON DELETE SET NULL,
    
    -- Version info (like other version tables)
    version_number INTEGER NOT NULL,
    
    -- Clip info
    video_url TEXT,                                 -- NULL until generation complete
    thumbnail_url TEXT,
    duration INTEGER,                               -- Seconds
    
    -- Movement (from shot list or user override)
    camera_movement VARCHAR(50),                    -- pan, tilt, dolly, zoom, static, etc
    movement_direction VARCHAR(50),                 -- left, right, up, down, in, out
    movement_speed VARCHAR(50) DEFAULT 'normal',    -- slow, normal, fast
    
    -- Generation
    prompt TEXT,                                    -- Full Seedance prompt including movement
    seed_prompt_data JSONB DEFAULT '{}',            -- { sceneContext, shotContext, movementPrompt }
    provider VARCHAR(100) DEFAULT 'seedance',
    model VARCHAR(100),
    credit_cost INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending',           -- pending, processing, complete, failed
    error_message TEXT,                             -- Error details if failed
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                           -- Soft delete support
    
    UNIQUE(scene_id, version_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scene_clips_scene ON scene_clips(scene_id, version_number);
CREATE INDEX IF NOT EXISTS idx_scene_clips_shot ON scene_clips(shot_id);
CREATE INDEX IF NOT EXISTS idx_scene_clips_image ON scene_clips(image_version_id);
CREATE INDEX IF NOT EXISTS idx_scene_clips_active ON scene_clips(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scene_clips_status ON scene_clips(status) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_scene_clips_not_deleted ON scene_clips(scene_id) WHERE deleted_at IS NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scene_clips_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scene_clips_updated_at ON scene_clips;
CREATE TRIGGER trigger_scene_clips_updated_at
    BEFORE UPDATE ON scene_clips
    FOR EACH ROW
    EXECUTE FUNCTION update_scene_clips_updated_at();

-- Function to ensure only one active version per scene
CREATE OR REPLACE FUNCTION ensure_single_active_clip_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE scene_clips
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = NEW.scene_id
          AND id != NEW.id
          AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_clip_version ON scene_clips;
CREATE TRIGGER trigger_single_active_clip_version
    BEFORE INSERT OR UPDATE OF is_active ON scene_clips
    FOR EACH ROW
    WHEN (NEW.is_active = TRUE)
    EXECUTE FUNCTION ensure_single_active_clip_version();
