import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running Universe Formula and Strategic Plan migration...");
  
  try {
    // Create universe_formulas table
    await sql`
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
      )
    `;
    console.log("✓ Created universe_formulas table");

    // Create strategic_plans table
    await sql`
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
        
        -- Performance Analysis - 15 Key Factors (using "cast_" prefix to avoid reserved keyword)
        cast_ VARCHAR(255),
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
      )
    `;
    console.log("✓ Created strategic_plans table");

    // Add foreign key constraints
    try {
      await sql`
        ALTER TABLE universe_formulas 
        ADD CONSTRAINT universe_formulas_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✓ Added foreign key constraint for universe_formulas");
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("constraint")) {
        console.log("⊘ Foreign key constraint for universe_formulas already exists");
      } else throw e;
    }

    try {
      await sql`
        ALTER TABLE strategic_plans 
        ADD CONSTRAINT strategic_plans_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✓ Added foreign key constraint for strategic_plans");
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("constraint")) {
        console.log("⊘ Foreign key constraint for strategic_plans already exists");
      } else throw e;
    }

    // Add columns to projects table
    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS universe_formula_id VARCHAR(36)`;
      console.log("✓ Added universe_formula_id column to projects");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("⊘ universe_formula_id column already exists in projects");
      } else throw e;
    }

    try {
      await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS strategic_plan_id VARCHAR(36)`;
      console.log("✓ Added strategic_plan_id column to projects");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("⊘ strategic_plan_id column already exists in projects");
      } else throw e;
    }

    // Add foreign key constraints to projects table
    try {
      await sql`
        ALTER TABLE projects 
        ADD CONSTRAINT projects_universe_formula_id_fkey 
        FOREIGN KEY (universe_formula_id) REFERENCES universe_formulas(id) ON DELETE SET NULL
      `;
      console.log("✓ Added foreign key constraint for projects.universe_formula_id");
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("constraint")) {
        console.log("⊘ Foreign key constraint for projects.universe_formula_id already exists");
      } else throw e;
    }

    try {
      await sql`
        ALTER TABLE projects 
        ADD CONSTRAINT projects_strategic_plan_id_fkey 
        FOREIGN KEY (strategic_plan_id) REFERENCES strategic_plans(id) ON DELETE SET NULL
      `;
      console.log("✓ Added foreign key constraint for projects.strategic_plan_id");
    } catch (e: any) {
      if (e.message?.includes("already exists") || e.message?.includes("constraint")) {
        console.log("⊘ Foreign key constraint for projects.strategic_plan_id already exists");
      } else throw e;
    }

    // Create indexes for better performance
    await sql`CREATE INDEX IF NOT EXISTS idx_universe_formulas_project_id ON universe_formulas(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_strategic_plans_project_id ON strategic_plans(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_universe_formula_id ON projects(universe_formula_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_strategic_plan_id ON projects(strategic_plan_id)`;
    console.log("✓ Created indexes");

    // Create trigger to update updated_at timestamp for universe_formulas
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_universe_formulas_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      console.log("✓ Created update_universe_formulas_updated_at function");
    } catch (e: any) {
      console.log("⊘ update_universe_formulas_updated_at function already exists");
    }

    try {
      await sql`
        DROP TRIGGER IF EXISTS universe_formulas_updated_at_trigger ON universe_formulas
      `;
      await sql`
        CREATE TRIGGER universe_formulas_updated_at_trigger
        BEFORE UPDATE ON universe_formulas
        FOR EACH ROW
        EXECUTE FUNCTION update_universe_formulas_updated_at()
      `;
      console.log("✓ Created trigger for universe_formulas.updated_at");
    } catch (e: any) {
      console.log("⊘ Trigger for universe_formulas.updated_at already exists");
    }

    // Create trigger to update updated_at timestamp for strategic_plans
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_strategic_plans_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      console.log("✓ Created update_strategic_plans_updated_at function");
    } catch (e: any) {
      console.log("⊘ update_strategic_plans_updated_at function already exists");
    }

    try {
      await sql`
        DROP TRIGGER IF EXISTS strategic_plans_updated_at_trigger ON strategic_plans
      `;
      await sql`
        CREATE TRIGGER strategic_plans_updated_at_trigger
        BEFORE UPDATE ON strategic_plans
        FOR EACH ROW
        EXECUTE FUNCTION update_strategic_plans_updated_at()
      `;
      console.log("✓ Created trigger for strategic_plans.updated_at");
    } catch (e: any) {
      console.log("⊘ Trigger for strategic_plans.updated_at already exists");
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
