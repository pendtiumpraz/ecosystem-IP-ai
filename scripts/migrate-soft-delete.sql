-- Add soft delete columns and create new tables

-- Add deleted_at to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deleted_at to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create enums
DO $$ BEGIN
    CREATE TYPE generation_type AS ENUM (
        'synopsis', 'story_structure', 'character_profile', 'character_image',
        'universe', 'moodboard_prompt', 'moodboard_image', 'script',
        'animation_preview', 'video', 'voice', 'music'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user_google_tokens table
CREATE TABLE IF NOT EXISTS user_google_tokens (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMP NOT NULL,
    drive_folder_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create ai_generation_logs table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    project_id VARCHAR(36) REFERENCES projects(id),
    generation_type generation_type NOT NULL,
    model_id VARCHAR(100),
    model_provider VARCHAR(50),
    prompt TEXT,
    input_params JSONB,
    result_text TEXT,
    result_url TEXT,
    result_drive_id VARCHAR(100),
    result_metadata JSONB,
    credit_cost INTEGER DEFAULT 0,
    token_input INTEGER,
    token_output INTEGER,
    status generation_status DEFAULT 'pending' NOT NULL,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    deleted_at TIMESTAMP
);

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(36) NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id VARCHAR(36),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_user ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_project ON ai_generation_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_status ON ai_generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_credit_trans_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at);
CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at);
