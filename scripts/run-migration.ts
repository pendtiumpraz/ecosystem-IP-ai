import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function migrate() {
  console.log("Running soft delete migration...");
  
  try {
    // Add deleted_at to users
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    console.log("✓ Added deleted_at to users");

    // Add deleted_at to projects
    await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    console.log("✓ Added deleted_at to projects");

    // Create enums
    try {
      await sql`CREATE TYPE generation_type AS ENUM (
        'synopsis', 'story_structure', 'character_profile', 'character_image',
        'universe', 'moodboard_prompt', 'moodboard_image', 'script',
        'animation_preview', 'video', 'voice', 'music'
      )`;
      console.log("✓ Created generation_type enum");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("⊘ generation_type enum already exists");
      } else throw e;
    }

    try {
      await sql`CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed')`;
      console.log("✓ Created generation_status enum");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        console.log("⊘ generation_status enum already exists");
      } else throw e;
    }

    // Create user_google_tokens table
    await sql`
      CREATE TABLE IF NOT EXISTS user_google_tokens (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TIMESTAMP NOT NULL,
        drive_folder_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✓ Created user_google_tokens table");

    // Create ai_generation_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_generation_logs (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        project_id VARCHAR(36) REFERENCES projects(id),
        generation_type generation_type NOT NULL,
        model_id VARCHAR(100),
        model_provider VARCHAR(50),
        prompt TEXT,
        input_params JSONB,
        result_text TEXT,
        result_url TEXT,
        result_drive_id VARCHAR(100),
        result_metadata JSONB,
        credit_cost INTEGER DEFAULT 0,
        token_input INTEGER,
        token_output INTEGER,
        status generation_status DEFAULT 'pending' NOT NULL,
        error_message TEXT,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMP
      )
    `;
    console.log("✓ Created ai_generation_logs table");

    // Create credit_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        type VARCHAR(50) NOT NULL,
        amount INTEGER NOT NULL,
        balance_after INTEGER NOT NULL,
        reference_type VARCHAR(50),
        reference_id VARCHAR(36),
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log("✓ Created credit_transactions table");

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_user ON ai_generation_logs(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_project ON ai_generation_logs(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_ai_gen_logs_status ON ai_generation_logs(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_credit_trans_user ON credit_transactions(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_deleted ON users(deleted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_deleted ON projects(deleted_at)`;
    console.log("✓ Created indexes");

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();
