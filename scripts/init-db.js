require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function initTables() {
  console.log('Initializing missing tables...');
  
  try {
    // Create subscription_tier enum if not exists
    await sql`
      DO $$ BEGIN
        CREATE TYPE subscription_tier AS ENUM ('trial', 'creator', 'studio', 'enterprise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log('✓ subscription_tier enum ready');

    // Create ai_tier_models table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_tier_models (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        tier subscription_tier NOT NULL,
        model_type ai_provider_type NOT NULL,
        model_id VARCHAR(36) NOT NULL REFERENCES ai_models(id),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(tier, model_type)
      )
    `;
    console.log('✓ ai_tier_models table created');

    // Create ai_fallback_configs table
    await sql`
      CREATE TABLE IF NOT EXISTS ai_fallback_configs (
        id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
        tier subscription_tier NOT NULL,
        model_type ai_provider_type NOT NULL,
        priority INTEGER NOT NULL DEFAULT 0,
        provider_name VARCHAR(100) NOT NULL,
        model_id VARCHAR(255) NOT NULL,
        api_key_id VARCHAR(36) REFERENCES platform_api_keys(id),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    console.log('✓ ai_fallback_configs table created');

    // Add subscription_tier column to users if not exists
    await sql`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN subscription_tier subscription_tier DEFAULT 'trial';
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `;
    console.log('✓ users.subscription_tier column ready');

    console.log('\n✅ All tables initialized successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

initTables();
