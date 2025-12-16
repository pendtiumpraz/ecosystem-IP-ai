import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Initialize missing AI tables
export async function POST() {
  const results: string[] = [];
  const errors: string[] = [];
  
  // Helper to run SQL safely
  async function runSafe(name: string, query: () => Promise<any>) {
    try {
      await query();
      results.push(`✓ ${name}`);
    } catch (e: any) {
      errors.push(`✗ ${name}: ${e.message}`);
    }
  }

  // 1. Create subscription_tier enum
  await runSafe("subscription_tier enum", () => sql`
    DO $$ BEGIN
      CREATE TYPE subscription_tier AS ENUM ('trial', 'creator', 'studio', 'enterprise');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 1b. Create generation_type enum
  await runSafe("generation_type enum", () => sql`
    DO $$ BEGIN
      CREATE TYPE generation_type AS ENUM ('synopsis', 'story_structure', 'character_profile', 'character_image', 'universe', 'moodboard_prompt', 'moodboard_image', 'script', 'animation_preview', 'video', 'voice', 'music');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 1c. Create generation_status enum
  await runSafe("generation_status enum", () => sql`
    DO $$ BEGIN
      CREATE TYPE generation_status AS ENUM ('pending', 'processing', 'completed', 'failed');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 1d. Add missing story columns
  await runSafe("stories.conflict_type", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS conflict_type VARCHAR(255)
  `);
  await runSafe("stories.intensity", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS intensity VARCHAR(50)
  `);
  await runSafe("stories.sub_theme", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS sub_theme VARCHAR(255)
  `);
  await runSafe("stories.moral_values", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS moral_values TEXT
  `);
  await runSafe("stories.local_values", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS local_values TEXT
  `);
  await runSafe("stories.plot", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS plot TEXT
  `);
  await runSafe("stories.twist", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS twist TEXT
  `);
  await runSafe("stories.target_market", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS target_market VARCHAR(255)
  `);
  await runSafe("stories.generated_script", () => sql`
    ALTER TABLE stories ADD COLUMN IF NOT EXISTS generated_script TEXT
  `);

  // 2. Create ai_tier_models table
  await runSafe("ai_tier_models table", () => sql`
    CREATE TABLE IF NOT EXISTS ai_tier_models (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      tier subscription_tier NOT NULL,
      model_type ai_provider_type NOT NULL,
      model_id VARCHAR(36) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
      UNIQUE(tier, model_type)
    )
  `);

  // 3. Create ai_fallback_configs table  
  await runSafe("ai_fallback_configs table", () => sql`
    CREATE TABLE IF NOT EXISTS ai_fallback_configs (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      tier subscription_tier NOT NULL,
      model_type ai_provider_type NOT NULL,
      priority INTEGER NOT NULL DEFAULT 0,
      provider_name VARCHAR(100) NOT NULL,
      model_id VARCHAR(255) NOT NULL,
      api_key_id VARCHAR(36),
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `);

  // 4. Add subscription_tier to users
  await runSafe("users.subscription_tier column", () => sql`
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN subscription_tier subscription_tier DEFAULT 'trial';
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `);

  // 5. Universe columns
  await runSafe("universes new columns", () => sql`
    DO $$ 
    BEGIN
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS name VARCHAR(255);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS period VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS era VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS location VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS world_type VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS technology_level VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS magic_system VARCHAR(100);
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS society TEXT;
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS private_life TEXT;
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS government TEXT;
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS economy TEXT;
      ALTER TABLE universes ADD COLUMN IF NOT EXISTS culture TEXT;
    EXCEPTION WHEN OTHERS THEN null;
    END $$;
  `);

  // 6. Moodboards columns
  await runSafe("moodboards.beat_order", () => sql`
    ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS beat_order INTEGER DEFAULT 0
  `);
  await runSafe("moodboards.updated_at", () => sql`
    ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `);

  // 7. Animations columns
  await runSafe("animations.scene_name", () => sql`
    ALTER TABLE animations ADD COLUMN IF NOT EXISTS scene_name VARCHAR(255)
  `);
  await runSafe("animations.scene_order", () => sql`
    ALTER TABLE animations ADD COLUMN IF NOT EXISTS scene_order INTEGER DEFAULT 0
  `);
  await runSafe("animations.preview_url", () => sql`
    ALTER TABLE animations ADD COLUMN IF NOT EXISTS preview_url TEXT
  `);
  await runSafe("animations.updated_at", () => sql`
    ALTER TABLE animations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()
  `);

  // 8. AI Generation Logs - ensure all columns exist
  // First drop FK constraint if exists (model_id should be model identifier string, not UUID)
  await runSafe("ai_generation_logs.drop_model_id_fk", () => sql`
    ALTER TABLE ai_generation_logs DROP CONSTRAINT IF EXISTS ai_generation_logs_model_id_ai_models_id_fk
  `);
  await runSafe("ai_generation_logs.model_provider", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS model_provider VARCHAR(50)
  `);
  await runSafe("ai_generation_logs.model_id_varchar", () => sql`
    ALTER TABLE ai_generation_logs ALTER COLUMN model_id TYPE VARCHAR(100)
  `);
  await runSafe("ai_generation_logs.prompt", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS prompt TEXT
  `);
  await runSafe("ai_generation_logs.input_params", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS input_params JSONB
  `);
  await runSafe("ai_generation_logs.result_text", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS result_text TEXT
  `);
  await runSafe("ai_generation_logs.result_url", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS result_url TEXT
  `);
  await runSafe("ai_generation_logs.result_drive_id", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS result_drive_id VARCHAR(100)
  `);
  await runSafe("ai_generation_logs.result_metadata", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS result_metadata JSONB
  `);
  await runSafe("ai_generation_logs.token_input", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS token_input INTEGER
  `);
  await runSafe("ai_generation_logs.token_output", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS token_output INTEGER
  `);
  await runSafe("ai_generation_logs.started_at", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS started_at TIMESTAMP
  `);
  await runSafe("ai_generation_logs.completed_at", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP
  `);
  await runSafe("ai_generation_logs.is_accepted", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS is_accepted BOOLEAN DEFAULT FALSE
  `);
  await runSafe("ai_generation_logs.deleted_at", () => sql`
    ALTER TABLE ai_generation_logs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
  `);

  // 9. Create transaction_type enum
  await runSafe("transaction_type enum", () => sql`
    DO $$ BEGIN
      CREATE TYPE transaction_type AS ENUM ('subscription_credit', 'purchase', 'usage', 'refund', 'bonus', 'adjustment');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // 10. Create credit_transactions table
  await runSafe("credit_transactions table", () => sql`
    CREATE TABLE IF NOT EXISTS credit_transactions (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(36) REFERENCES users(id),
      org_id VARCHAR(36),
      type transaction_type NOT NULL,
      amount INTEGER NOT NULL,
      balance_after INTEGER NOT NULL,
      reference_type VARCHAR(50),
      reference_id VARCHAR(36),
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // 11. Ensure users.credit_balance column exists
  await runSafe("users.credit_balance", () => sql`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS credit_balance INTEGER DEFAULT 100
  `);

  return NextResponse.json({ 
    success: errors.length === 0, 
    results,
    errors: errors.length > 0 ? errors : undefined
  });
}
