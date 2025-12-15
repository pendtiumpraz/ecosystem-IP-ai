-- Migration: Update AI Providers schema for MODO Creator Verse
-- December 2025

-- 1. Add missing columns to ai_providers
ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS base_url TEXT,
ADD COLUMN IF NOT EXISTS api_key TEXT,
ADD COLUMN IF NOT EXISTS provider_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Update display_name from name if empty
UPDATE ai_providers SET display_name = name WHERE display_name IS NULL;
UPDATE ai_providers SET base_url = api_base_url WHERE base_url IS NULL;
UPDATE ai_providers SET provider_type = type WHERE provider_type IS NULL;
UPDATE ai_providers SET is_enabled = is_active WHERE is_enabled IS NULL;

-- 2. Add missing columns to ai_models
ALTER TABLE ai_models
ADD COLUMN IF NOT EXISTS display_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS model_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS credit_cost_per_use INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE;

-- Update from existing columns
UPDATE ai_models SET display_name = name WHERE display_name IS NULL;
UPDATE ai_models SET model_type = type WHERE model_type IS NULL;
UPDATE ai_models SET credit_cost_per_use = credit_cost WHERE credit_cost_per_use IS NULL;
UPDATE ai_models SET is_enabled = is_active WHERE is_enabled IS NULL;

-- 3. Create unique constraint on provider name if not exists
-- First drop if exists to recreate
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_providers_name_unique'
  ) THEN
    ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_name_unique UNIQUE (name);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- 4. Create unique constraint on model_id per provider
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ai_models_provider_model_unique'
  ) THEN
    ALTER TABLE ai_models ADD CONSTRAINT ai_models_provider_model_unique UNIQUE (provider_id, model_id);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- 5. Ensure provider_type enum has all values
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ai_provider_type') THEN
    CREATE TYPE ai_provider_type AS ENUM ('text', 'image', 'video', 'audio', 'multimodal');
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
