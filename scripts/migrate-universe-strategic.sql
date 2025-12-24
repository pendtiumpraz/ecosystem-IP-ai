-- Migration: Add Universe Formula and Strategic Plan tables
-- Date: 2024-12-24

-- Create universe_formulas table
CREATE TABLE IF NOT EXISTS universe_formulas (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(36) NOT NULL,
  
  -- Top Row - Locations
  working_office_school VARCHAR(255),
  town_district_city VARCHAR(255),
  neighborhood_environment VARCHAR(255),
  
  -- Left Column - Systems
  rules_of_work TEXT,
  labor_law TEXT,
  country VARCHAR(255),
  government_system TEXT,
  
  -- Center Column - Identity
  universe_name VARCHAR(255),
  period VARCHAR(255),
  
  -- Center Column - Visual
  environment_landscape TEXT,
  society_and_system TEXT,
  private_interior TEXT,
  
  -- Center Column - Systems
  sociopolitic_economy TEXT,
  sociocultural_system TEXT,
  
  -- Right Column - Private Spaces
  house_castle VARCHAR(255),
  room_cave VARCHAR(255),
  family_inner_circle TEXT,
  kingdom_tribe_communal TEXT,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create strategic_plans table
CREATE TABLE IF NOT EXISTS strategic_plans (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id VARCHAR(36) NOT NULL,
  
  -- IP Business Model Canvas - 9 Sections
  customer_segments TEXT,
  value_propositions TEXT,
  channels TEXT,
  customer_relationships TEXT,
  revenue_streams TEXT,
  key_resources TEXT,
  key_activities TEXT,
  key_partnerships TEXT,
  cost_structure TEXT,
  
  -- Performance Analysis - 15 Key Factors
  cast VARCHAR(255),
  director VARCHAR(255),
  producer VARCHAR(255),
  executive_producer VARCHAR(255),
  distributor VARCHAR(255),
  publisher VARCHAR(255),
  title_brand_positioning VARCHAR(255),
  theme_stated VARCHAR(255),
  unique_selling VARCHAR(255),
  story_values VARCHAR(255),
  fans_loyalty VARCHAR(255),
  production_budget VARCHAR(255),
  promotion_budget VARCHAR(255),
  social_media_engagements VARCHAR(255),
  teaser_trailer_engagements VARCHAR(255),
  genre VARCHAR(255),
  
  -- Performance Analysis - Additional Data
  competitor_name VARCHAR(255),
  competitor_scores JSONB,
  project_scores JSONB,
  predicted_audience JSONB,
  ai_suggestions TEXT,
  
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE universe_formulas 
ADD CONSTRAINT IF NOT EXISTS universe_formulas_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

ALTER TABLE strategic_plans 
ADD CONSTRAINT IF NOT EXISTS strategic_plans_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- Add columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS universe_formula_id VARCHAR(36);

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS strategic_plan_id VARCHAR(36);

-- Add foreign key constraints to projects table
ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_universe_formula_id_fkey 
FOREIGN KEY (universe_formula_id) REFERENCES universe_formulas(id) ON DELETE SET NULL;

ALTER TABLE projects 
ADD CONSTRAINT IF NOT EXISTS projects_strategic_plan_id_fkey 
FOREIGN KEY (strategic_plan_id) REFERENCES strategic_plans(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_universe_formulas_project_id ON universe_formulas(project_id);
CREATE INDEX IF NOT EXISTS idx_strategic_plans_project_id ON strategic_plans(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_universe_formula_id ON projects(universe_formula_id);
CREATE INDEX IF NOT EXISTS idx_projects_strategic_plan_id ON projects(strategic_plan_id);

-- Create trigger to update updated_at timestamp for universe_formulas
CREATE OR REPLACE FUNCTION update_universe_formulas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS universe_formulas_updated_at_trigger
BEFORE UPDATE ON universe_formulas
FOR EACH ROW
EXECUTE FUNCTION update_universe_formulas_updated_at();

-- Create trigger to update updated_at timestamp for strategic_plans
CREATE OR REPLACE FUNCTION update_strategic_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER IF NOT EXISTS strategic_plans_updated_at_trigger
BEFORE UPDATE ON strategic_plans
FOR EACH ROW
EXECUTE FUNCTION update_strategic_plans_updated_at();
