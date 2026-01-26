/**
 * Sceneplot Migration Runner
 * Creates scene_plots and scene_shots tables for beat-level scene breakdown
 * Run with: npx tsx scripts/run-sceneplot-migration.ts
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

    console.log("🚀 Starting Sceneplot Migration...\n");

    try {
        // 1. Create scene_plots table
        console.log("📝 Creating scene_plots table...");

        await sql`
            CREATE TABLE IF NOT EXISTS scene_plots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                story_version_id UUID NOT NULL,
                beat_key VARCHAR(100) NOT NULL,
                scene_number INTEGER NOT NULL DEFAULT 1,
                scene_title VARCHAR(255),
                scene_description TEXT,
                scene_location TEXT,
                scene_time VARCHAR(50),
                characters_present TEXT[],
                preference TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_beat_scene UNIQUE(story_version_id, beat_key, scene_number)
            )
        `;
        console.log("   ✓ scene_plots table created");

        // Add foreign key if story_versions exists
        try {
            await sql`
                ALTER TABLE scene_plots 
                ADD CONSTRAINT scene_plots_story_version_fkey 
                FOREIGN KEY (story_version_id) REFERENCES story_versions(id) ON DELETE CASCADE
            `;
            console.log("   ✓ Foreign key to story_versions added");
        } catch (e: any) {
            if (e.message?.includes("already exists")) {
                console.log("   ⏭️ Foreign key already exists");
            } else {
                console.log(`   ⚠️ Could not add foreign key: ${e.message}`);
            }
        }

        // Create indexes for scene_plots
        await sql`CREATE INDEX IF NOT EXISTS idx_scene_plots_story_version ON scene_plots(story_version_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_scene_plots_beat_key ON scene_plots(beat_key)`;
        console.log("   ✓ scene_plots indexes created");

        // 2. Create scene_shots table
        console.log("\n📝 Creating scene_shots table...");

        await sql`
            CREATE TABLE IF NOT EXISTS scene_shots (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                scene_plot_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
                shot_number INTEGER NOT NULL DEFAULT 1,
                shot_type VARCHAR(50),
                shot_size VARCHAR(50),
                shot_angle VARCHAR(50),
                shot_description TEXT,
                duration_seconds INTEGER,
                camera_movement VARCHAR(100),
                audio_notes TEXT,
                visual_notes TEXT,
                dialogue TEXT,
                action TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_scene_shot UNIQUE(scene_plot_id, shot_number)
            )
        `;
        console.log("   ✓ scene_shots table created");

        // Create indexes for scene_shots
        await sql`CREATE INDEX IF NOT EXISTS idx_scene_shots_scene_plot ON scene_shots(scene_plot_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_scene_shots_type ON scene_shots(shot_type)`;
        console.log("   ✓ scene_shots indexes created");

        console.log("\n" + "=".repeat(50));
        console.log("✅ Migration completed successfully!");
        console.log("=".repeat(50));

        // Verify tables
        console.log("\n📊 Verifying scene_plots columns...");
        const scenePlotCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'scene_plots'
            ORDER BY ordinal_position
        `;

        console.log(`\nscene_plots table (${scenePlotCols.length} columns):`);
        scenePlotCols.forEach((row: any) => {
            console.log(`  ✓ ${row.column_name} (${row.data_type})`);
        });

        console.log("\n📊 Verifying scene_shots columns...");
        const sceneShotCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'scene_shots'
            ORDER BY ordinal_position
        `;

        console.log(`\nscene_shots table (${sceneShotCols.length} columns):`);
        sceneShotCols.forEach((row: any) => {
            console.log(`  ✓ ${row.column_name} (${row.data_type})`);
        });

        console.log("\n🎉 Sceneplot migration complete!\n");

    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
