// Add is_active column to moodboards table
// Run with: npx tsx scripts/add-moodboard-is-active.ts

import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ DATABASE_URL environment variable is required");
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    console.log("🚀 Adding is_active column to moodboards...\n");

    try {
        // Check if column already exists
        const existingColumns = await sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'moodboards' AND column_name = 'is_active'
        `;

        if (existingColumns.length > 0) {
            console.log("✅ is_active column already exists");
        } else {
            // Add is_active column with default true for existing records
            await sql`
                ALTER TABLE moodboards 
                ADD COLUMN is_active BOOLEAN DEFAULT false
            `;
            console.log("✅ Added is_active column");

            // Set the latest moodboard for each story version as active
            await sql`
                WITH latest_moodboards AS (
                    SELECT DISTINCT ON (story_version_id) id
                    FROM moodboards
                    WHERE deleted_at IS NULL
                    ORDER BY story_version_id, version_number DESC
                )
                UPDATE moodboards m
                SET is_active = true
                FROM latest_moodboards lm
                WHERE m.id = lm.id
            `;
            console.log("✅ Set latest moodboards as active");
        }

        // Create index for is_active
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboards_is_active ON moodboards(is_active)`;
        console.log("✅ Created is_active index");

        console.log("\n✅ Migration completed successfully!");

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
