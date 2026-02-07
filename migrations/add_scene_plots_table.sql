-- Migration: Add scene_plots table for storyboard restructure
-- Created: 2026-02-07

-- Scene Plots Table
-- Stores individual scene information for the storyboard pipeline
CREATE TABLE IF NOT EXISTS scene_plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    story_id UUID REFERENCES stories(id) ON DELETE SET NULL,
    
    -- Scene Identity
    scene_number INTEGER NOT NULL,
    title VARCHAR(200),
    
    -- Scene Content
    synopsis TEXT,                          -- What happens in this scene
    emotional_beat VARCHAR(100),            -- Rising tension, comic relief, etc
    
    -- Context Links
    story_beat_id UUID,                     -- Which key action this belongs to
    story_beat_name VARCHAR(200),           -- Cached beat name
    
    -- Location (from Universe)
    location VARCHAR(200),                  -- Location name
    location_description TEXT,              -- Cached description
    location_image_url TEXT,                -- Reference image from universe
    time_of_day VARCHAR(50) DEFAULT 'day',  -- day, night, dawn, dusk
    weather VARCHAR(100),
    
    -- Characters
    characters_involved JSONB DEFAULT '[]', -- Array of {id, name, imageUrl, role}
    props JSONB DEFAULT '[]',               -- Important objects
    
    -- Meta
    estimated_duration INTEGER DEFAULT 60,  -- Seconds
    status VARCHAR(50) DEFAULT 'empty',     -- empty, plotted, shot_listed, storyboarded, scripted
    generation_metadata JSONB DEFAULT '{}', -- Provider, credits, etc
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    
    UNIQUE(project_id, scene_number)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_scene_plots_project ON scene_plots(project_id, scene_number);
CREATE INDEX IF NOT EXISTS idx_scene_plots_story ON scene_plots(story_id);
CREATE INDEX IF NOT EXISTS idx_scene_plots_status ON scene_plots(status);
CREATE INDEX IF NOT EXISTS idx_scene_plots_beat ON scene_plots(story_beat_id);
CREATE INDEX IF NOT EXISTS idx_scene_plots_active ON scene_plots(project_id) WHERE deleted_at IS NULL;

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_scene_plots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_scene_plots_updated_at ON scene_plots;
CREATE TRIGGER trigger_scene_plots_updated_at
    BEFORE UPDATE ON scene_plots
    FOR EACH ROW
    EXECUTE FUNCTION update_scene_plots_updated_at();
