-- Migration: Add shot_preferences column to projects table
-- Created: 2026-02-10

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'shot_preferences')
    THEN
        ALTER TABLE projects ADD COLUMN shot_preferences JSONB DEFAULT NULL;
    END IF;
END $$;
