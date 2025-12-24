import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running Edit & Mix migration...");
  
  try {
    // Create edit_mix_sessions table
    console.log("\nCreating edit_mix_sessions table...");
    await sql`
      CREATE TABLE IF NOT EXISTS edit_mix_sessions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) NOT NULL,
        source_materials JSONB,
        source_urls JSONB,
        mix_mode VARCHAR(50),
        blend_mode VARCHAR(50),
        opacity INTEGER DEFAULT 100,
        duration INTEGER,
        filters JSONB,
        effects JSONB,
        output_url VARCHAR(1000),
        output_format VARCHAR(50),
        output_quality INTEGER DEFAULT 100,
        ai_generated BOOLEAN DEFAULT false,
        ai_prompt TEXT,
        ai_model VARCHAR(255),
        ai_provider VARCHAR(100),
        status VARCHAR(50) DEFAULT 'draft',
        error_message TEXT,
        created_by VARCHAR(36) NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✅ edit_mix_sessions table created");

    // Add foreign key constraints
    console.log("\nAdding foreign key constraints...");
    try {
      await sql`
        ALTER TABLE edit_mix_sessions 
        ADD CONSTRAINT edit_mix_sessions_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✅ edit_mix_sessions.project_id foreign key added");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.project_id foreign key may already exist");
    }

    try {
      await sql`
        ALTER TABLE edit_mix_sessions 
        ADD CONSTRAINT edit_mix_sessions_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      `;
      console.log("✅ edit_mix_sessions.created_by foreign key added");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.created_by foreign key may already exist");
    }

    // Create indexes
    console.log("\nCreating indexes...");
    try {
      await sql`CREATE INDEX IF NOT EXISTS edit_mix_sessions_project_id_idx ON edit_mix_sessions(project_id)`;
      console.log("✅ edit_mix_sessions.project_id index created");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.project_id index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS edit_mix_sessions_created_by_idx ON edit_mix_sessions(created_by)`;
      console.log("✅ edit_mix_sessions.created_by index created");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.created_by index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS edit_mix_sessions_type_idx ON edit_mix_sessions(type)`;
      console.log("✅ edit_mix_sessions.type index created");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.type index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS edit_mix_sessions_status_idx ON edit_mix_sessions(status)`;
      console.log("✅ edit_mix_sessions.status index created");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.status index may already exist");
    }

    // Create trigger for updated_at
    console.log("\nCreating trigger for updated_at...");
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_edit_mix_sessions_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      await sql`
        DROP TRIGGER IF EXISTS edit_mix_sessions_updated_at_trigger ON edit_mix_sessions
      `;
      await sql`
        CREATE TRIGGER edit_mix_sessions_updated_at_trigger
        BEFORE UPDATE ON edit_mix_sessions
        FOR EACH ROW
        EXECUTE FUNCTION update_edit_mix_sessions_updated_at()
      `;
      console.log("✅ edit_mix_sessions.updated_at trigger created");
    } catch (error) {
      console.log("⚠️ edit_mix_sessions.updated_at trigger may already exist");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nTables created:");
    console.log("  - edit_mix_sessions");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
