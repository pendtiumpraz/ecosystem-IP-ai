import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running Project Team and Materials migration...");
  
  try {
    // Create project_team table
    console.log("\nCreating project_team table...");
    await sql`
      CREATE TABLE IF NOT EXISTS project_team (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(36) NOT NULL,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        is_modo_token_holder BOOLEAN DEFAULT false,
        modo_token_address VARCHAR(255),
        modo_token_amount VARCHAR(50),
        responsibilities TEXT,
        expertise TEXT,
        joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✅ project_team table created");

    // Create project_materials table
    console.log("\nCreating project_materials table...");
    await sql`
      CREATE TABLE IF NOT EXISTS project_materials (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        file_url VARCHAR(1000),
        file_size VARCHAR(50),
        mime_type VARCHAR(100),
        category VARCHAR(100),
        tags JSONB,
        uploaded_by VARCHAR(36) NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✅ project_materials table created");

    // Add foreign key constraints for project_team
    console.log("\nAdding foreign key constraints for project_team...");
    try {
      await sql`
        ALTER TABLE project_team 
        ADD CONSTRAINT project_team_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✅ project_team.project_id foreign key added");
    } catch (error) {
      console.log("⚠️ project_team.project_id foreign key may already exist");
    }

    try {
      await sql`
        ALTER TABLE project_team 
        ADD CONSTRAINT project_team_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      `;
      console.log("✅ project_team.user_id foreign key added");
    } catch (error) {
      console.log("⚠️ project_team.user_id foreign key may already exist");
    }

    // Add foreign key constraints for project_materials
    console.log("\nAdding foreign key constraints for project_materials...");
    try {
      await sql`
        ALTER TABLE project_materials 
        ADD CONSTRAINT project_materials_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✅ project_materials.project_id foreign key added");
    } catch (error) {
      console.log("⚠️ project_materials.project_id foreign key may already exist");
    }

    try {
      await sql`
        ALTER TABLE project_materials 
        ADD CONSTRAINT project_materials_uploaded_by_fkey 
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
      `;
      console.log("✅ project_materials.uploaded_by foreign key added");
    } catch (error) {
      console.log("⚠️ project_materials.uploaded_by foreign key may already exist");
    }

    // Create indexes for project_team
    console.log("\nCreating indexes for project_team...");
    try {
      await sql`CREATE INDEX IF NOT EXISTS project_team_project_id_idx ON project_team(project_id)`;
      console.log("✅ project_team.project_id index created");
    } catch (error) {
      console.log("⚠️ project_team.project_id index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS project_team_user_id_idx ON project_team(user_id)`;
      console.log("✅ project_team.user_id index created");
    } catch (error) {
      console.log("⚠️ project_team.user_id index may already exist");
    }

    // Create indexes for project_materials
    console.log("\nCreating indexes for project_materials...");
    try {
      await sql`CREATE INDEX IF NOT EXISTS project_materials_project_id_idx ON project_materials(project_id)`;
      console.log("✅ project_materials.project_id index created");
    } catch (error) {
      console.log("⚠️ project_materials.project_id index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS project_materials_uploaded_by_idx ON project_materials(uploaded_by)`;
      console.log("✅ project_materials.uploaded_by index created");
    } catch (error) {
      console.log("⚠️ project_materials.uploaded_by index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS project_materials_type_idx ON project_materials(type)`;
      console.log("✅ project_materials.type index created");
    } catch (error) {
      console.log("⚠️ project_materials.type index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS project_materials_category_idx ON project_materials(category)`;
      console.log("✅ project_materials.category index created");
    } catch (error) {
      console.log("⚠️ project_materials.category index may already exist");
    }

    // Create triggers for updated_at
    console.log("\nCreating triggers for updated_at...");
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_project_team_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      await sql`
        DROP TRIGGER IF EXISTS project_team_updated_at_trigger ON project_team
      `;
      await sql`
        CREATE TRIGGER project_team_updated_at_trigger
        BEFORE UPDATE ON project_team
        FOR EACH ROW
        EXECUTE FUNCTION update_project_team_updated_at()
      `;
      console.log("✅ project_team.updated_at trigger created");
    } catch (error) {
      console.log("⚠️ project_team.updated_at trigger may already exist");
    }

    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_project_materials_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      await sql`
        DROP TRIGGER IF EXISTS project_materials_updated_at_trigger ON project_materials
      `;
      await sql`
        CREATE TRIGGER project_materials_updated_at_trigger
        BEFORE UPDATE ON project_materials
        FOR EACH ROW
        EXECUTE FUNCTION update_project_materials_updated_at()
      `;
      console.log("✅ project_materials.updated_at trigger created");
    } catch (error) {
      console.log("⚠️ project_materials.updated_at trigger may already exist");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nTables created:");
    console.log("  - project_team");
    console.log("  - project_materials");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
