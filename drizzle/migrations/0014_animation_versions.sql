-- Animation Versions & Clips Migration
-- Links animation to moodboard for image-to-video generation

-- Enums
DO $$ BEGIN
    CREATE TYPE animation_version_status AS ENUM ('draft', 'generating', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE animation_clip_status AS ENUM ('pending', 'prompt_ready', 'queued', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE transition_type AS ENUM ('none', 'fade', 'dissolve', 'wipe', 'zoom', 'slide', 'blur');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE camera_motion AS ENUM ('static', 'orbit', 'zoom_in', 'zoom_out', 'pan_left', 'pan_right', 'pan_up', 'pan_down', 'ken_burns', 'parallax');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Animation Versions Table
CREATE TABLE IF NOT EXISTS animation_versions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    moodboard_id VARCHAR(36) NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    name VARCHAR(255),
    
    -- Default settings
    default_duration INTEGER DEFAULT 6,
    default_fps INTEGER DEFAULT 25,
    default_resolution VARCHAR(20) DEFAULT '1920x1080',
    generate_audio BOOLEAN DEFAULT false,
    
    -- Transition settings
    transition_type transition_type DEFAULT 'fade',
    transition_duration DECIMAL(3,1) DEFAULT 0.5,
    
    -- Effect preset
    effect_preset JSONB,
    
    -- Progress
    status animation_version_status DEFAULT 'draft',
    total_clips INTEGER DEFAULT 0,
    completed_clips INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Animation Clips Table
CREATE TABLE IF NOT EXISTS animation_clips (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    animation_version_id VARCHAR(36) NOT NULL REFERENCES animation_versions(id) ON DELETE CASCADE,
    moodboard_item_id VARCHAR(36) REFERENCES moodboard_items(id) ON DELETE SET NULL,
    
    -- Beat/Order
    beat_key VARCHAR(100),
    beat_label VARCHAR(255),
    clip_order INTEGER NOT NULL DEFAULT 0,
    
    -- Source
    source_image_url TEXT NOT NULL,
    key_action_description TEXT,
    
    -- Prompts
    video_prompt TEXT,
    negative_prompt TEXT,
    
    -- Settings
    duration INTEGER DEFAULT 6,
    fps INTEGER DEFAULT 25,
    resolution VARCHAR(20) DEFAULT '1920x1080',
    
    -- Camera
    camera_motion camera_motion DEFAULT 'static',
    camera_angle VARCHAR(100),
    
    -- Output
    video_url TEXT,
    thumbnail_url TEXT,
    preview_gif_url TEXT,
    
    -- Job tracking
    job_id VARCHAR(255),
    eta_seconds INTEGER,
    
    -- Status
    status animation_clip_status DEFAULT 'pending',
    error_message TEXT,
    generation_cost INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_animation_versions_moodboard ON animation_versions(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_animation_versions_deleted ON animation_versions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_animation_clips_version ON animation_clips(animation_version_id);
CREATE INDEX IF NOT EXISTS idx_animation_clips_item ON animation_clips(moodboard_item_id);
CREATE INDEX IF NOT EXISTS idx_animation_clips_beat ON animation_clips(beat_key);
CREATE INDEX IF NOT EXISTS idx_animation_clips_status ON animation_clips(status);
