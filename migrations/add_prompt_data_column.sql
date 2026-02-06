-- Add prompt_data column to store structured JSON prompt data
-- This stores the parsed JSON from AI including scene, lighting, camera, etc.

ALTER TABLE universe_field_prompts
ADD COLUMN IF NOT EXISTS prompt_data JSONB;

-- Add comment for documentation
COMMENT ON COLUMN universe_field_prompts.prompt_data IS 'Structured JSON prompt data containing scene, lighting, camera, atmosphere, colorPalette, style, mood, setting, details, elements, enhancedPrompt';
