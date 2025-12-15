import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Initialize missing AI tables
export async function POST() {
  try {
    // Create subscription_tier enum if not exists
    await sql`
      DO $$ BEGIN
        CREATE TYPE subscription_tier AS ENUM ('trial', 'creator', 'studio', 'enterprise');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

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

    // Add subscription_tier column to users if not exists
    await sql`
      DO $$ BEGIN
        ALTER TABLE users ADD COLUMN subscription_tier subscription_tier DEFAULT 'trial';
      EXCEPTION
        WHEN duplicate_column THEN null;
      END $$;
    `;

    // Update universe table with new columns
    await sql`
      DO $$ BEGIN
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
      END $$;
    `;

    // Update moodboards table
    await sql`
      DO $$ BEGIN
        ALTER TABLE moodboards RENAME COLUMN beat_index TO beat_order;
      EXCEPTION
        WHEN undefined_column THEN null;
      END $$;
    `;

    await sql`
      ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `;

    // Update animations table
    await sql`
      DO $$ BEGIN
        ALTER TABLE animations RENAME COLUMN beat_name TO scene_name;
      EXCEPTION
        WHEN undefined_column THEN null;
      END $$;
    `;

    await sql`
      DO $$ BEGIN
        ALTER TABLE animations RENAME COLUMN beat_index TO scene_order;
      EXCEPTION
        WHEN undefined_column THEN null;
      END $$;
    `;

    await sql`
      ALTER TABLE animations ADD COLUMN IF NOT EXISTS preview_url TEXT;
      ALTER TABLE animations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `;

    return NextResponse.json({ 
      success: true, 
      message: "All tables initialized successfully" 
    });
  } catch (error: any) {
    console.error("Init tables error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
