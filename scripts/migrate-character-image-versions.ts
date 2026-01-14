/**
 * Run Character Image Versions Migration
 * Usage: npx tsx scripts/migrate-character-image-versions.ts
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
    console.log("🚀 Running character_image_versions migration...\n");

    try {
        // Create the table
        await sql`
            CREATE TABLE IF NOT EXISTS character_image_versions (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                
                -- Foreign Keys
                character_id UUID NOT NULL,
                project_id UUID NOT NULL,
                user_id UUID NOT NULL,
                
                -- Version Info
                version_name VARCHAR(255) NOT NULL,
                version_number INTEGER NOT NULL DEFAULT 1,
                is_active BOOLEAN DEFAULT FALSE,
                
                -- Image Data
                image_url TEXT NOT NULL,
                thumbnail_url TEXT,
                drive_file_id TEXT,
                drive_web_view_link TEXT,
                
                -- Generation Settings (from modal)
                template VARCHAR(50),
                art_style VARCHAR(50),
                aspect_ratio VARCHAR(20),
                action_pose VARCHAR(50),
                
                -- References
                character_ref_url TEXT,
                background_ref_url TEXT,
                
                -- Prompts
                additional_prompt TEXT,
                full_prompt_used TEXT,
                
                -- Character Data Snapshot
                character_data_snapshot JSONB,
                
                -- AI/Model Info
                model_used VARCHAR(100),
                model_provider VARCHAR(50),
                credit_cost INTEGER DEFAULT 0,
                generation_time_ms INTEGER,
                
                -- Timestamps
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;
        console.log("✅ Table character_image_versions created");

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_char_img_ver_char_id ON character_image_versions(character_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_char_img_ver_project_id ON character_image_versions(project_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_char_img_ver_user_id ON character_image_versions(user_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_char_img_ver_active ON character_image_versions(character_id, is_active)`;
        console.log("✅ Indexes created");

        // Verify table exists
        const tables = await sql`
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'character_image_versions'
        `;

        if (tables.length > 0) {
            console.log("\n✅ Migration successful! Table 'character_image_versions' is ready.");

            // Show table columns
            const columns = await sql`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'character_image_versions'
                ORDER BY ordinal_position
            `;
            console.log("\n📋 Table columns:");
            columns.forEach((col: any) => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
        } else {
            console.log("❌ Migration failed - table not created");
        }

    } catch (error) {
        console.error("❌ Migration error:", error);
        process.exit(1);
    }
}

runMigration();
