-- Migration: Add character_relations field to stories table
-- This stores the relationships between characters as a JSONB array

ALTER TABLE stories ADD COLUMN IF NOT EXISTS character_relations jsonb DEFAULT '[]';

-- Example structure:
-- [
--   {
--     "id": "rel-1",
--     "fromCharId": "char-1",
--     "toCharId": "char-2", 
--     "type": "loves",
--     "label": "Loves"
--   }
-- ]

COMMENT ON COLUMN stories.character_relations IS 'Array of character relationships with type and direction';
