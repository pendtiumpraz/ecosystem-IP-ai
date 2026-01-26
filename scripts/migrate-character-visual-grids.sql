-- Add visual grid columns to characters table
-- These columns store generated images for character poses, expressions, and gestures

-- Key Poses: { front, right, left, back, three_quarter }
ALTER TABLE characters ADD COLUMN IF NOT EXISTS key_poses JSONB DEFAULT '{}';

-- Facial Expressions: { happy, sad, angry, scared, surprised, determined }
ALTER TABLE characters ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}';

-- Emotion Gestures: { greeting, bow, dance, run, fight, thinking, celebrate }
ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}';

-- Add indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_characters_key_poses ON characters USING GIN (key_poses);
CREATE INDEX IF NOT EXISTS idx_characters_facial_expressions ON characters USING GIN (facial_expressions);
CREATE INDEX IF NOT EXISTS idx_characters_emotion_gestures ON characters USING GIN (emotion_gestures);
