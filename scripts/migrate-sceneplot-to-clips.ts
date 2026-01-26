/**
 * Sceneplot Migration - Add scene_plot to animation_clips
 * Run with: npx tsx scripts/migrate-sceneplot-to-clips.ts
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

    console.log("🚀 Starting Scene Plot Migration (to animation_clips)...\n");

    try {
        // 1. Add scene_plot column to animation_clips
        console.log("📝 Adding scene_plot column to animation_clips...");

        await sql`
            ALTER TABLE animation_clips 
            ADD COLUMN IF NOT EXISTS scene_plot JSONB
        `;
        console.log("   ✓ scene_plot column added");

        // 2. Create GIN index for JSONB querying
        console.log("\n📝 Creating GIN index for scene_plot...");

        await sql`
            CREATE INDEX IF NOT EXISTS idx_animation_clips_scene_plot 
            ON animation_clips USING GIN (scene_plot)
        `;
        console.log("   ✓ GIN index created");

        // 3. Add scene_plot_preference column for per-clip preference
        console.log("\n📝 Adding scene_plot_preference column...");

        await sql`
            ALTER TABLE animation_clips 
            ADD COLUMN IF NOT EXISTS scene_plot_preference TEXT
        `;
        console.log("   ✓ scene_plot_preference column added");

        console.log("\n" + "=".repeat(50));
        console.log("✅ Migration completed successfully!");
        console.log("=".repeat(50));

        // Verify columns
        console.log("\n📊 Verifying animation_clips columns...");
        const cols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'animation_clips'
            ORDER BY ordinal_position
        `;

        console.log(`\nanimation_clips table (${cols.length} columns):`);
        cols.forEach((row: any) => {
            const highlight = row.column_name.includes('scene_plot') ? ' ⭐ NEW' : '';
            console.log(`  ${row.column_name} (${row.data_type})${highlight}`);
        });

        // Check for scene_plot column specifically
        const hasScenePlot = cols.some((c: any) => c.column_name === 'scene_plot');
        if (hasScenePlot) {
            console.log("\n🎉 scene_plot column verified!");
        } else {
            console.log("\n⚠️ scene_plot column not found - please check manually");
        }

        console.log("\n✅ Migration complete!\n");

    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
