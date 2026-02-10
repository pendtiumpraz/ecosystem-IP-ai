-- Migration: Ensure scene_shots table has all required columns
-- Created: 2026-02-10
-- This migration ensures the scene_shots table matches the expected schema.
-- It adds missing columns if they don't exist and is safe to re-run.

-- Rename scene_id to scene_plot_id if scene_id exists and scene_plot_id doesn't
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'scene_id')
       AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'scene_plot_id')
    THEN
        ALTER TABLE scene_shots RENAME COLUMN scene_id TO scene_plot_id;
    END IF;
END $$;

-- Add scene_plot_id if it doesn't exist at all
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'scene_plot_id')
    THEN
        ALTER TABLE scene_shots ADD COLUMN scene_plot_id UUID REFERENCES scene_plots(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add shot_type (maps to camera type from dropdown: establishing, wide, full, medium, etc.)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'shot_type')
    THEN
        ALTER TABLE scene_shots ADD COLUMN shot_type VARCHAR(50) DEFAULT 'medium';
        -- Copy data from camera_type if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'camera_type')
        THEN
            UPDATE scene_shots SET shot_type = camera_type WHERE shot_type IS NULL OR shot_type = 'medium';
        END IF;
    END IF;
END $$;

-- Add shot_size
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'shot_size')
    THEN
        ALTER TABLE scene_shots ADD COLUMN shot_size VARCHAR(50) DEFAULT 'medium';
    END IF;
END $$;

-- Add shot_angle (maps to camera angle)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'shot_angle')
    THEN
        ALTER TABLE scene_shots ADD COLUMN shot_angle VARCHAR(50) DEFAULT 'eye-level';
        -- Copy data from camera_angle if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'camera_angle')
        THEN
            UPDATE scene_shots SET shot_angle = camera_angle WHERE shot_angle IS NULL OR shot_angle = 'eye-level';
        END IF;
    END IF;
END $$;

-- Add shot_description
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'shot_description')
    THEN
        ALTER TABLE scene_shots ADD COLUMN shot_description TEXT;
        -- Copy data from framing or action if exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'framing')
        THEN
            UPDATE scene_shots SET shot_description = framing WHERE shot_description IS NULL;
        END IF;
    END IF;
END $$;

-- Add duration_seconds (decimal to support 0.5s action shots)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'duration_seconds')
    THEN
        ALTER TABLE scene_shots ADD COLUMN duration_seconds NUMERIC(5,1) DEFAULT 5;
        -- Copy data from duration if it exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'duration')
        THEN
            UPDATE scene_shots SET duration_seconds = duration WHERE duration_seconds IS NULL OR duration_seconds = 5;
        END IF;
    END IF;
END $$;

-- Ensure camera_movement exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'camera_movement')
    THEN
        ALTER TABLE scene_shots ADD COLUMN camera_movement VARCHAR(50) DEFAULT 'static';
    END IF;
END $$;

-- Add audio_notes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'audio_notes')
    THEN
        ALTER TABLE scene_shots ADD COLUMN audio_notes TEXT;
        -- Copy from audio if exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'audio')
        THEN
            UPDATE scene_shots SET audio_notes = audio WHERE audio_notes IS NULL;
        END IF;
    END IF;
END $$;

-- Add visual_notes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'visual_notes')
    THEN
        ALTER TABLE scene_shots ADD COLUMN visual_notes TEXT;
        -- Copy from lighting if exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'lighting')
        THEN
            UPDATE scene_shots SET visual_notes = lighting WHERE visual_notes IS NULL;
        END IF;
    END IF;
END $$;

-- Add dialogue column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'dialogue')
    THEN
        ALTER TABLE scene_shots ADD COLUMN dialogue TEXT;
    END IF;
END $$;

-- Ensure action column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'action')
    THEN
        ALTER TABLE scene_shots ADD COLUMN action TEXT;
    END IF;
END $$;

-- Ensure deleted_at exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'deleted_at')
    THEN
        ALTER TABLE scene_shots ADD COLUMN deleted_at TIMESTAMP;
    END IF;
END $$;

-- Ensure updated_at exists  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scene_shots' AND column_name = 'updated_at')
    THEN
        ALTER TABLE scene_shots ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
    END IF;
END $$;

-- Update indexes to use scene_plot_id
DROP INDEX IF EXISTS idx_scene_shots_scene;
DROP INDEX IF EXISTS idx_scene_shots_active;
CREATE INDEX IF NOT EXISTS idx_scene_shots_scene_plot ON scene_shots(scene_plot_id, shot_number);
CREATE INDEX IF NOT EXISTS idx_scene_shots_active_plot ON scene_shots(scene_plot_id) WHERE deleted_at IS NULL;
