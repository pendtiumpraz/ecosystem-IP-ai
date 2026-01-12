-- Migration: Add user storage tables for Google Drive integration and generated media
-- Safe migration - only ADD new tables and enums, no modifications to existing tables

-- Create enums
DO $$ BEGIN
    CREATE TYPE media_source_type AS ENUM ('generated', 'linked', 'replaced');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE media_type AS ENUM ('image', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entity_type AS ENUM ('character', 'moodboard', 'animation', 'reference');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table: user_google_drive_tokens
CREATE TABLE IF NOT EXISTS user_google_drive_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- OAuth Tokens
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- User's Drive Info
    drive_email VARCHAR(255),
    drive_folder_id VARCHAR(255),
    storage_used_bytes BIGINT DEFAULT 0,
    storage_quota_bytes BIGINT DEFAULT 0,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Table: generated_media
CREATE TABLE IF NOT EXISTS generated_media (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
    
    -- Source Entity
    entity_type entity_type NOT NULL,
    entity_id VARCHAR(36) NOT NULL,
    
    -- Media Info
    media_type media_type NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100),
    file_size_bytes BIGINT,
    
    -- Source Type
    source_type media_source_type DEFAULT 'generated' NOT NULL,
    
    -- Google Drive Storage
    drive_file_id VARCHAR(255),
    drive_web_view_link TEXT,
    
    -- Generated URLs
    download_url TEXT,
    thumbnail_url TEXT,
    public_url TEXT,
    
    -- Manual Link Info
    original_drive_url TEXT,
    linked_at TIMESTAMP WITH TIME ZONE,
    
    -- Generation Info
    model_used VARCHAR(100),
    prompt_used TEXT,
    credits_used INTEGER DEFAULT 0,
    
    -- Status
    is_accessible BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_drive_tokens_user ON user_google_drive_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_media_entity ON generated_media(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_generated_media_user ON generated_media(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_media_accessible ON generated_media(is_accessible);
