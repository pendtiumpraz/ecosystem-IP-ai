-- Story Formula V2 Migration
-- Adds columns for Global Synopsis, Preferences, Want/Need V2, and Ending Types
-- Created: 2026-01-26

-- 1. Global Synopsis & Preferences
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS synopsis_preference TEXT;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis_preference TEXT;

-- 2. Want/Need Matrix V2 (Journey Stages)
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS want_stages JSONB DEFAULT '{
    "menginginkan": "",
    "memastikan": "",
    "mengejar": "",
    "tercapai": null
}'::jsonb;

ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS need_stages JSONB DEFAULT '{
    "membutuhkan": "",
    "menemukan": "",
    "menerima": "",
    "terpenuhi": null
}'::jsonb;

-- 3. Ending Types with Rasa
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_type VARCHAR(50);
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_rasa VARCHAR(100);

-- 4. Three Act and Freytag's Pyramid beats
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS three_act_beats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS freytag_beats JSONB DEFAULT '{}'::jsonb;
ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS custom_beats JSONB DEFAULT '{}'::jsonb;

-- 5. Character enhancements for visual grids (if not exists)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS key_poses JSONB DEFAULT '{}'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}'::jsonb;
ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}'::jsonb;
