-- Migration: Add tension_levels column to stories table
-- Stores Arc View graph tension values (1-100 per beat)
ALTER TABLE stories ADD COLUMN IF NOT EXISTS tension_levels jsonb DEFAULT '{}';
