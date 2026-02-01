-- Migration: Add IP Project format, genre & structure fields
-- Date: 2026-02-01
-- Description: Adds new fields for Format & Duration, Genre & Structure sections to projects table

-- Add Format & Duration fields
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "medium_type" varchar(100);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" varchar(50);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "custom_duration" integer;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "target_scenes" integer;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "episode_count" integer DEFAULT 1;

-- Add Genre & Structure fields
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "main_genre" varchar(100);
-- sub_genre already exists in the schema
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "theme" varchar(255);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "tone" varchar(100);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "core_conflict" varchar(100);
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "story_structure" varchar(100);

-- Add constraint for episode_count (1-13)
-- Note: PostgreSQL CHECK constraint
-- ALTER TABLE "projects" ADD CONSTRAINT "episode_count_check" CHECK ("episode_count" >= 1 AND "episode_count" <= 13);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS "idx_projects_main_genre" ON "projects" ("main_genre");
CREATE INDEX IF NOT EXISTS "idx_projects_story_structure" ON "projects" ("story_structure");
