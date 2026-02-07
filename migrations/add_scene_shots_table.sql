-- Migration: Add scene_shots table for storyboard restructure
-- Created: 2026-02-07

-- Scene Shots Table
-- Stores individual shots within a scene (camera settings, blocking, etc)
CREATE TABLE IF NOT EXISTS scene_shots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
    
    -- Shot Identity
    shot_number INTEGER NOT NULL,
    
    -- Camera Technical
    camera_type VARCHAR(50) DEFAULT 'medium',       -- wide, medium, close-up, extreme-close-up, pov, over-shoulder
    camera_angle VARCHAR(50) DEFAULT 'eye-level',   -- eye-level, low-angle, high-angle, dutch, birds-eye, worms-eye
    camera_movement VARCHAR(50) DEFAULT 'static',   -- static, pan, tilt, dolly, tracking, crane, handheld, zoom
    lens VARCHAR(50),                               -- wide, normal, telephoto
    
    -- Timing
    duration INTEGER DEFAULT 5,                     -- Seconds
    
    -- Content
    framing TEXT,                                   -- What's in frame description
    action TEXT,                                    -- What happens in this shot
    blocking TEXT,                                  -- Character positions/movements
    
    -- Technical Notes
    lighting TEXT,
    audio TEXT,                                     -- Sound effects, music notes
    notes TEXT,                                     -- Director's notes
    
    -- Generation metadata
    generation_metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,                           -- Soft delete support
    
    UNIQUE(scene_id, shot_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scene_shots_scene ON scene_shots(scene_id, shot_number);
CREATE INDEX IF NOT EXISTS idx_scene_shots_active ON scene_shots(scene_id) WHERE deleted_at IS NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scene_shots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scene_shots_updated_at ON scene_shots;
CREATE TRIGGER trigger_scene_shots_updated_at
    BEFORE UPDATE ON scene_shots
    FOR EACH ROW
    EXECUTE FUNCTION update_scene_shots_updated_at();
