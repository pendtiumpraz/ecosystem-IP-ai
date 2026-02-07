-- Migration: Add scene_script_versions table for storyboard restructure
-- Created: 2026-02-07

-- Scene Script Versions Table
-- Stores screenplay script versions for each scene
-- Auto creates new version when upstream content changes (scene plot, shot list, story beat)
CREATE TABLE IF NOT EXISTS scene_script_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Version info
    version_number INTEGER NOT NULL,
    
    -- Script content
    script_content TEXT NOT NULL,                   -- Screenplay format content
    word_count INTEGER DEFAULT 0,
    dialogue_count INTEGER DEFAULT 0,
    
    -- Context snapshot (what was used to generate this version)
    -- Hash of upstream content to detect changes
    context_snapshot JSONB DEFAULT '{}',            -- { scenePlotHash, shotListHash, beatId, sceneSynopsis }
    
    -- Generation metadata
    provider VARCHAR(100),
    model VARCHAR(100),
    credit_cost INTEGER DEFAULT 0,
    prompt TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT FALSE,
    is_manual_edit BOOLEAN DEFAULT FALSE,           -- True if user edited (not AI generated)
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                           -- Soft delete support
    
    UNIQUE(scene_id, version_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scene_script_versions_scene ON scene_script_versions(scene_id, version_number);
CREATE INDEX IF NOT EXISTS idx_scene_script_versions_active ON scene_script_versions(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_scene_script_versions_not_deleted ON scene_script_versions(scene_id) WHERE deleted_at IS NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scene_script_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scene_script_versions_updated_at ON scene_script_versions;
CREATE TRIGGER trigger_scene_script_versions_updated_at
    BEFORE UPDATE ON scene_script_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_scene_script_versions_updated_at();

-- Function to ensure only one active version per scene
CREATE OR REPLACE FUNCTION ensure_single_active_script_version()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_active = TRUE THEN
        UPDATE scene_script_versions
        SET is_active = FALSE, updated_at = NOW()
        WHERE scene_id = NEW.scene_id
          AND id != NEW.id
          AND is_active = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_single_active_script_version ON scene_script_versions;
CREATE TRIGGER trigger_single_active_script_version
    BEFORE INSERT OR UPDATE OF is_active ON scene_script_versions
    FOR EACH ROW
    WHEN (NEW.is_active = TRUE)
    EXECUTE FUNCTION ensure_single_active_script_version();

-- Function to auto-calculate word and dialogue count
CREATE OR REPLACE FUNCTION calculate_script_stats()
RETURNS TRIGGER AS $$
DECLARE
    content TEXT;
    words INTEGER;
    dialogues INTEGER;
BEGIN
    content := NEW.script_content;
    
    -- Count words (approximate)
    words := array_length(regexp_split_to_array(content, '\s+'), 1);
    
    -- Count dialogue lines (lines that look like CHARACTER NAME in caps followed by dialogue)
    -- This is a rough estimate - counts lines that match pattern of character names
    dialogues := (SELECT COUNT(*) FROM regexp_matches(content, '^\s*[A-Z][A-Z ]+\s*$', 'gm'));
    
    NEW.word_count := COALESCE(words, 0);
    NEW.dialogue_count := COALESCE(dialogues, 0);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_script_stats ON scene_script_versions;
CREATE TRIGGER trigger_calculate_script_stats
    BEFORE INSERT OR UPDATE OF script_content ON scene_script_versions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_script_stats();
