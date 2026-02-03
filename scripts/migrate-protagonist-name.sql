-- Add protagonist_name column to projects table
-- This field is set in IP Project and auto-creates a character when episode count is set

ALTER TABLE projects ADD COLUMN IF NOT EXISTS protagonist_name VARCHAR(255);

-- Add comment for documentation
COMMENT ON COLUMN projects.protagonist_name IS 'Name of the main protagonist character, set in IP Project tab. Locked after episode count is set.';
