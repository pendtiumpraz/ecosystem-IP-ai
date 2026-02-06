-- Alter field_key columns to support longer keys
-- Some field keys like 'neighborhoodEnvironment' are longer than 36 chars

-- For universe_field_images
ALTER TABLE universe_field_images 
ALTER COLUMN field_key TYPE VARCHAR(100);

-- For universe_field_prompts
ALTER TABLE universe_field_prompts 
ALTER COLUMN field_key TYPE VARCHAR(100);
