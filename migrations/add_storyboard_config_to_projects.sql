-- Migration: Add storyboard_config column to projects table
-- Created: 2026-02-07

-- Add storyboard configuration to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS 
    storyboard_config JSONB DEFAULT '{
        "totalScenes": 0,
        "scenesPerMinute": 1,
        "generationStatus": "not_started",
        "lastGeneratedAt": null,
        "targetDuration": 60,
        "sceneDistribution": []
    }';

-- Add index for quick lookup of projects with storyboard
CREATE INDEX IF NOT EXISTS idx_projects_storyboard_status 
    ON projects ((storyboard_config->>'generationStatus'))
    WHERE storyboard_config IS NOT NULL;

COMMENT ON COLUMN projects.storyboard_config IS 'Storyboard pipeline configuration: totalScenes, scenesPerMinute, generationStatus (not_started, distributing, generating_plots, generating_shots, generating_images, generating_scripts, complete), lastGeneratedAt, targetDuration, sceneDistribution';
