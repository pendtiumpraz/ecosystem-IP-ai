-- Migration: Add aspect_ratio to moodboards table
-- Date: 2026-01-15

ALTER TABLE moodboards 
ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(20) DEFAULT '16:9';

-- Add comment for documentation
COMMENT ON COLUMN moodboards.aspect_ratio IS 'Image aspect ratio for generated images. Options: 1:1, 16:9, 9:16, 4:3, 3:4, 21:9';
