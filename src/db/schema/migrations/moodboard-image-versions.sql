-- Migration: Create moodboard_item_image_versions table
-- Run this SQL in your Neon database console

-- 1. Create the table
CREATE TABLE IF NOT EXISTS moodboard_item_image_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Reference to moodboard item
    moodboard_id VARCHAR(36) NOT NULL,
    moodboard_item_id VARCHAR(100) NOT NULL, -- Format: beatKey_keyActionIndex
    
    -- Version info
    version_number INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT false,
    
    -- Image data
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    drive_file_id VARCHAR(100),
    
    -- Generation info
    prompt_used TEXT,
    model_used VARCHAR(100),
    art_style VARCHAR(50),
    aspect_ratio VARCHAR(20),
    credit_cost INTEGER DEFAULT 0,
    generation_time_ms INTEGER,
    
    -- Source type: generated, uploaded_drive, uploaded_url
    source_type VARCHAR(50) DEFAULT 'generated',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP -- Soft delete for restore
);

-- 2. Create indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_moodboard_image_versions_moodboard_id 
    ON moodboard_item_image_versions(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_image_versions_item_id 
    ON moodboard_item_image_versions(moodboard_item_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_image_versions_active 
    ON moodboard_item_image_versions(moodboard_id, moodboard_item_id, is_active) 
    WHERE is_active = true;

-- 3. Migrate existing images from moodboard_items to versions table as v1
-- This creates v1 for each existing moodboard item that has an image
INSERT INTO moodboard_item_image_versions (
    moodboard_id,
    moodboard_item_id,
    version_number,
    is_active,
    image_url,
    thumbnail_url,
    prompt_used,
    art_style,
    source_type,
    created_at
)
SELECT 
    mi.moodboard_id,
    mi.id as moodboard_item_id,
    1 as version_number,
    true as is_active,
    mi.image_url,
    mi.image_url as thumbnail_url, -- Use same URL for thumbnail
    mi.prompt as prompt_used,
    m.art_style,
    'generated' as source_type,
    COALESCE(mi.updated_at, mi.created_at, NOW()) as created_at
FROM moodboard_items mi
JOIN moodboards m ON m.id = mi.moodboard_id
WHERE mi.image_url IS NOT NULL 
    AND mi.image_url != ''
    AND mi.deleted_at IS NULL
ON CONFLICT DO NOTHING; -- Skip if already migrated

-- 4. Verify migration
SELECT 
    COUNT(*) as total_versions,
    COUNT(DISTINCT moodboard_id) as unique_moodboards,
    COUNT(DISTINCT moodboard_item_id) as unique_items
FROM moodboard_item_image_versions;
