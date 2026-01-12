/**
 * Safe migration script - Only adds new tables
 * Does NOT modify or delete existing data
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in .env.local");
    process.exit(1);
}

const sql = neon(DATABASE_URL);

async function runMigration() {
    console.log("🚀 Starting SAFE migration...");
    console.log("📋 This will only ADD new tables, NOT modify existing data\n");

    try {
        // Create enums
        console.log("Creating enums...");

        await sql`
      DO $$ BEGIN
        CREATE TYPE media_source_type AS ENUM ('generated', 'linked', 'replaced');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;
        console.log("  ✓ media_source_type enum");

        await sql`
      DO $$ BEGIN
        CREATE TYPE media_type AS ENUM ('image', 'video');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;
        console.log("  ✓ media_type enum");

        await sql`
      DO $$ BEGIN
        CREATE TYPE entity_type AS ENUM ('character', 'moodboard', 'animation', 'reference');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `;
        console.log("  ✓ entity_type enum");

        // Check if tables exist
        const existingTables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_google_drive_tokens', 'generated_media')
    `;

        const existingTableNames = existingTables.map(t => t.table_name);

        // Create user_google_drive_tokens table
        if (!existingTableNames.includes('user_google_drive_tokens')) {
            console.log("\nCreating user_google_drive_tokens table...");
            await sql`
        CREATE TABLE user_google_drive_tokens (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
          access_token TEXT NOT NULL,
          refresh_token TEXT NOT NULL,
          token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          drive_email VARCHAR(255),
          drive_folder_id VARCHAR(255),
          storage_used_bytes BIGINT DEFAULT 0,
          storage_quota_bytes BIGINT DEFAULT 0,
          is_active BOOLEAN DEFAULT TRUE,
          connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          last_used_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )
      `;
            console.log("  ✓ user_google_drive_tokens table created");
        } else {
            console.log("\n⏭️  user_google_drive_tokens table already exists, skipping");
        }

        // Create generated_media table
        if (!existingTableNames.includes('generated_media')) {
            console.log("\nCreating generated_media table...");
            await sql`
        CREATE TABLE generated_media (
          id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          project_id VARCHAR(36) REFERENCES projects(id) ON DELETE SET NULL,
          entity_type entity_type NOT NULL,
          entity_id VARCHAR(36) NOT NULL,
          media_type media_type NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100),
          file_size_bytes BIGINT,
          source_type media_source_type DEFAULT 'generated' NOT NULL,
          drive_file_id VARCHAR(255),
          drive_web_view_link TEXT,
          download_url TEXT,
          thumbnail_url TEXT,
          public_url TEXT,
          original_drive_url TEXT,
          linked_at TIMESTAMP WITH TIME ZONE,
          model_used VARCHAR(100),
          prompt_used TEXT,
          credits_used INTEGER DEFAULT 0,
          is_accessible BOOLEAN DEFAULT TRUE,
          is_primary BOOLEAN DEFAULT FALSE,
          last_checked_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        )
      `;
            console.log("  ✓ generated_media table created");
        } else {
            console.log("\n⏭️  generated_media table already exists, skipping");
        }

        // Create indexes
        console.log("\nCreating indexes...");

        await sql`CREATE INDEX IF NOT EXISTS idx_user_drive_tokens_user ON user_google_drive_tokens(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_generated_media_entity ON generated_media(entity_type, entity_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_generated_media_user ON generated_media(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_generated_media_accessible ON generated_media(is_accessible)`;
        console.log("  ✓ Indexes created");

        console.log("\n✅ Migration completed successfully!");
        console.log("📊 Your existing data is SAFE and untouched.");

    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
