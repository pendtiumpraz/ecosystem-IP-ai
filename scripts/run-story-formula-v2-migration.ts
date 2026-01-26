/**
 * Story Formula V2 Migration Runner
 * Adds columns for Global Synopsis, Preferences, Want/Need V2, and Ending Types
 * Run with: npx tsx scripts/run-story-formula-v2-migration.ts
 */

import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function runMigration() {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error("❌ DATABASE_URL environment variable is required");
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    console.log("🚀 Starting Story Formula V2 Migration...\n");

    try {
        // 1. Global Synopsis & Preferences
        console.log("📝 Adding Global Synopsis & Preferences columns...");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis TEXT`;
        console.log("   ✓ global_synopsis");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS synopsis_preference TEXT`;
        console.log("   ✓ synopsis_preference");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS global_synopsis_preference TEXT`;
        console.log("   ✓ global_synopsis_preference");

        // 2. Want/Need Matrix V2 (Journey Stages)
        console.log("\n📝 Adding Want/Need Matrix V2 columns...");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS want_stages JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ want_stages (JSONB)");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS need_stages JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ need_stages (JSONB)");

        // 3. Ending Types with Rasa
        console.log("\n📝 Adding Ending Types columns...");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_type VARCHAR(50)`;
        console.log("   ✓ ending_type");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS ending_rasa VARCHAR(100)`;
        console.log("   ✓ ending_rasa");

        // 4. Three Act and Freytag's Pyramid beats
        console.log("\n📝 Adding new Story Structure columns...");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS three_act_beats JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ three_act_beats (JSONB)");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS freytag_beats JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ freytag_beats (JSONB)");

        await sql`ALTER TABLE story_versions ADD COLUMN IF NOT EXISTS custom_beats JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ custom_beats (JSONB)");

        // 5. Character enhancements for visual grids
        console.log("\n📝 Adding Character Visual Grid columns...");

        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS key_poses JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ key_poses (JSONB)");

        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ facial_expressions (JSONB)");

        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}'::jsonb`;
        console.log("   ✓ emotion_gestures (JSONB)");

        console.log("\n" + "=".repeat(50));
        console.log("✅ Migration completed successfully!");
        console.log("=".repeat(50));

        // Verify the columns were added
        console.log("\n📊 Verifying story_versions columns...");
        const columns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'story_versions' 
            AND column_name IN (
                'global_synopsis', 'synopsis_preference', 'global_synopsis_preference',
                'want_stages', 'need_stages', 'ending_type', 'ending_rasa',
                'three_act_beats', 'freytag_beats', 'custom_beats'
            )
            ORDER BY column_name
        `;

        console.log(`\nNew story_versions columns (${columns.length} found):`);
        columns.forEach((row: any) => {
            console.log(`  ✓ ${row.column_name} (${row.data_type})`);
        });

        console.log("\n📊 Verifying characters columns...");
        const charColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'characters' 
            AND column_name IN ('key_poses', 'facial_expressions', 'emotion_gestures')
            ORDER BY column_name
        `;

        console.log(`\nNew characters columns (${charColumns.length} found):`);
        charColumns.forEach((row: any) => {
            console.log(`  ✓ ${row.column_name} (${row.data_type})`);
        });

        console.log("\n🎉 Story Formula V2 migration complete!\n");

    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
