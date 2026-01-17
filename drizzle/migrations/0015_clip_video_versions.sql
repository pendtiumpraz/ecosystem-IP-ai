-- Add clip_video_versions table for tracking video versions per clip
-- Migration: 0015_clip_video_versions

-- Create video source enum
DO $$ BEGIN
    CREATE TYPE video_source AS ENUM ('generated', 'uploaded', 'external_link');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add active_video_version_id column to animation_clips
ALTER TABLE animation_clips 
ADD COLUMN IF NOT EXISTS active_video_version_id VARCHAR(36);

-- Create clip_video_versions table
CREATE TABLE IF NOT EXISTS clip_video_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    clip_id VARCHAR(36) NOT NULL REFERENCES animation_clips(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    
    -- Video source
    source video_source DEFAULT 'generated',
    
    -- Video data
    video_url TEXT,
    thumbnail_url TEXT,
    preview_gif_url TEXT,
    
    -- For uploads - store Google Drive file ID
    drive_file_id VARCHAR(255),
    original_file_name VARCHAR(500),
    
    -- For external links
    external_url TEXT,
    
    -- Generation info (if generated)
    prompt TEXT,
    camera_motion camera_motion DEFAULT 'static',
    duration INTEGER DEFAULT 6,
    
    -- Job tracking
    job_id VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clip_video_versions_clip ON clip_video_versions(clip_id);
CREATE INDEX IF NOT EXISTS idx_clip_video_versions_active ON clip_video_versions(clip_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_clip_video_versions_source ON clip_video_versions(source);
