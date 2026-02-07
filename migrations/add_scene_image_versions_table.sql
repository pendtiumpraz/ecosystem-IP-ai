-- Migration: Add scene_image_versions table for storyboard restructure
-- Created: 2026-02-07

-- Scene Image Versions Table
-- Stores storyboard image versions for each scene (like cover_versions)
CREATE TABLE IF NOT EXISTS scene_image_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    
    -- Image
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    prompt TEXT,                                    -- Prompt used to generate
    
    -- Generation metadata
    provider VARCHAR(100),
    model VARCHAR(100),
    credit_cost INTEGER DEFAULT 0,
    generation_mode VARCHAR(50) DEFAULT 'i2i',      -- t2i, i2i
    reference_images JSONB DEFAULT '[]',            -- Character/universe refs used
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                           -- Soft delete support
    
    UNIQUE(scene_id, version_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scene_image_versions_scene ON scene_image_versions(scene_id, version_number);
CREATE INDEX IF NOT EXISTS idx_scene_image_versions_active ON scene_image_versions(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scene_image_versions_not_deleted ON scene_image_versions(scene_id) WHERE deleted_at IS NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scene_image_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scene_image_versions_updated_at ON scene_image_versions;
CREATE TRIGGER trigger_scene_image_versions_updated_at
    BEFORE UPDATE ON scene_image_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_scene_image_versions_updated_at();

-- Function to ensure only one active version per scene
CREATE OR REPLACE FUNCTION ensure_single_active_image_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE scene_image_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = NEW.scene_id
          AND id != NEW.id
          AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_image_version ON scene_image_versions;
CREATE TRIGGER trigger_single_active_image_version
    BEFORE INSERT OR UPDATE OF is_active ON scene_image_versions
    FOR EACH ROW
    WHEN (NEW.is_active = TRUE)
    EXECUTE FUNCTION ensure_single_active_image_version();
