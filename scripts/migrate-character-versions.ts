/**
 * Migration: Create character_versions table
 * 
 * Run: npx tsx scripts/migrate-character-versions.ts
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("🔧 Creating character_versions table...\n");

    // Create table
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS character_versions (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                
                -- References
                character_id VARCHAR(36) NOT NULL,
                project_id VARCHAR(36) REFERENCES projects(id) ON DELETE CASCADE,
                user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                
                -- Version info
                version_number INTEGER NOT NULL DEFAULT 1,
                version_name VARCHAR(255),
                
                -- Full character data as JSONB
                character_data JSONB NOT NULL,
                
                -- Status
                is_current BOOLEAN NOT NULL DEFAULT FALSE,
                is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
                
                -- Generation info
                generated_by VARCHAR(100),
                prompt_used TEXT,
                
                -- Timestamps
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
            )
        `;
        console.log("✅ Created character_versions table");
    } catch (e: any) {
        if (e.message?.includes('already exists')) {
            console.log("⚠️ Table already exists");
        } else {
            throw e;
        }
    }

    // Create indexes
    try {
        await sql`
            CREATE INDEX IF NOT EXISTS idx_character_versions_character_id 
            ON character_versions(character_id)
        `;
        console.log("✅ Created index on character_id");
    } catch (e) {
        console.log("⚠️ Index may already exist");
    }

    try {
        await sql`
            CREATE INDEX IF NOT EXISTS idx_character_versions_project_user 
            ON character_versions(project_id, user_id)
        `;
        console.log("✅ Created index on project_id, user_id");
    } catch (e) {
        console.log("⚠️ Index may already exist");
    }

    try {
        await sql`
            CREATE INDEX IF NOT EXISTS idx_character_versions_current 
            ON character_versions(character_id, is_current) WHERE is_current = TRUE
        `;
        console.log("✅ Created partial index for current version lookup");
    } catch (e) {
        console.log("⚠️ Index may already exist");
    }

    console.log("\n🎉 Migration complete!");
    console.log("\nTable: character_versions");
    console.log("Features:");
    console.log("  - Stores full character data as JSONB");
    console.log("  - Version numbering with custom names");
    console.log("  - is_current flag for active version");
    console.log("  - Tracks generation method (manual/AI)");
}

migrate().catch(console.error);
