import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running Custom Roles migration...");
  
  try {
    // Create custom_roles table
    console.log("\nCreating custom_roles table...");
    await sql`
      CREATE TABLE IF NOT EXISTS custom_roles (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(50),
        icon VARCHAR(50),
        permissions JSONB,
        is_predefined BOOLEAN DEFAULT false,
        created_by VARCHAR(36) NOT NULL,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;
    console.log("✅ custom_roles table created");

    // Add foreign key constraints
    console.log("\nAdding foreign key constraints...");
    try {
      await sql`
        ALTER TABLE custom_roles 
        ADD CONSTRAINT custom_roles_project_id_fkey 
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
      `;
      console.log("✅ custom_roles.project_id foreign key added");
    } catch (error) {
      console.log("⚠️ custom_roles.project_id foreign key may already exist");
    }

    try {
      await sql`
        ALTER TABLE custom_roles 
        ADD CONSTRAINT custom_roles_created_by_fkey 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      `;
      console.log("✅ custom_roles.created_by foreign key added");
    } catch (error) {
      console.log("⚠️ custom_roles.created_by foreign key may already exist");
    }

    // Create indexes
    console.log("\nCreating indexes...");
    try {
      await sql`CREATE INDEX IF NOT EXISTS custom_roles_project_id_idx ON custom_roles(project_id)`;
      console.log("✅ custom_roles.project_id index created");
    } catch (error) {
      console.log("⚠️ custom_roles.project_id index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS custom_roles_created_by_idx ON custom_roles(created_by)`;
      console.log("✅ custom_roles.created_by index created");
    } catch (error) {
      console.log("⚠️ custom_roles.created_by index may already exist");
    }

    try {
      await sql`CREATE INDEX IF NOT EXISTS custom_roles_is_public_idx ON custom_roles(is_public)`;
      console.log("✅ custom_roles.is_public index created");
    } catch (error) {
      console.log("⚠️ custom_roles.is_public index may already exist");
    }

    // Create trigger for updated_at
    console.log("\nCreating trigger for updated_at...");
    try {
      await sql`
        CREATE OR REPLACE FUNCTION update_custom_roles_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;
      await sql`
        DROP TRIGGER IF EXISTS custom_roles_updated_at_trigger ON custom_roles
      `;
      await sql`
        CREATE TRIGGER custom_roles_updated_at_trigger
        BEFORE UPDATE ON custom_roles
        FOR EACH ROW
        EXECUTE FUNCTION update_custom_roles_updated_at()
      `;
      console.log("✅ custom_roles.updated_at trigger created");
    } catch (error) {
      console.log("⚠️ custom_roles.updated_at trigger may already exist");
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\nTables created:");
    console.log("  - custom_roles");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
