// Migration runner for Moodboard V2
// Run with: npx tsx scripts/run-moodboard-v2-migration.ts

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

    console.log("🚀 Starting Moodboard V2 migration...\n");

    try {
        // Check projects and story_versions table column types
        console.log("📋 Checking existing table schemas...");

        const projectsColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'id'
        `;

        const storyVersionsColumns = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'story_versions' AND column_name = 'id'
        `;

        const projectIdType = projectsColumns[0]?.data_type || 'uuid';
        const storyVersionIdType = storyVersionsColumns[0]?.data_type || 'uuid';

        console.log(`   projects.id type: ${projectIdType}`);
        console.log(`   story_versions.id type: ${storyVersionIdType}`);

        // Create new moodboards table with matching column types
        console.log("\n📝 Creating moodboards table...");

        // Map data types to PostgreSQL column definitions
        const projectIdColType = projectIdType === 'character varying' ? 'VARCHAR(255)' : 'UUID';
        const storyVersionIdColType = storyVersionIdType === 'character varying' ? 'VARCHAR(255)' : 'UUID';
        const defaultId = projectIdType === 'character varying' ? "gen_random_uuid()::text" : "gen_random_uuid()";

        console.log(`   Using project_id type: ${projectIdColType}`);
        console.log(`   Using story_version_id type: ${storyVersionIdColType}`);

        // Drop existing moodboards table if it has old schema
        const existingMoodboards = await sql`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'moodboards'
        `;

        if (existingMoodboards.length > 0) {
            const hasOldSchema = existingMoodboards.some((c: any) => c.column_name === 'beat_name');
            const hasNewSchema = existingMoodboards.some((c: any) => c.column_name === 'story_version_id');

            if (hasOldSchema && !hasNewSchema) {
                console.log("⚠️  Found old moodboards table, dropping it...");
                await sql`DROP TABLE IF EXISTS moodboards CASCADE`;
                console.log("✅ Old moodboards table dropped");
            } else if (hasNewSchema) {
                console.log("✅ moodboards table already has new schema, skipping creation");
            }
        }

        // Create moodboards table  
        await sql`
            CREATE TABLE IF NOT EXISTS moodboards (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id VARCHAR(255) NOT NULL,
                story_version_id UUID NOT NULL,
                art_style VARCHAR(50) DEFAULT 'realistic',
                key_action_count INTEGER DEFAULT 7 CHECK (key_action_count >= 3 AND key_action_count <= 10),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                deleted_at TIMESTAMP WITH TIME ZONE,
                CONSTRAINT unique_story_version_moodboard UNIQUE(story_version_id)
            )
        `;
        console.log("✅ moodboards table created");

        // Add foreign keys separately (allows more flexibility)
        try {
            await sql`
                ALTER TABLE moodboards 
                ADD CONSTRAINT moodboards_project_id_fkey 
                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
            `;
            console.log("✅ moodboards project_id foreign key added");
        } catch (e: any) {
            if (e.message?.includes("already exists")) {
                console.log("⏭️  moodboards project_id foreign key already exists");
            } else {
                console.log(`⚠️  Could not add project_id foreign key: ${e.message}`);
            }
        }

        try {
            await sql`
                ALTER TABLE moodboards 
                ADD CONSTRAINT moodboards_story_version_id_fkey 
                FOREIGN KEY (story_version_id) REFERENCES story_versions(id) ON DELETE CASCADE
            `;
            console.log("✅ moodboards story_version_id foreign key added");
        } catch (e: any) {
            if (e.message?.includes("already exists")) {
                console.log("⏭️  moodboards story_version_id foreign key already exists");
            } else {
                console.log(`⚠️  Could not add story_version_id foreign key: ${e.message}`);
            }
        }

        // Create indexes for moodboards
        console.log("📝 Creating moodboards indexes...");
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboards_project ON moodboards(project_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboards_story_version ON moodboards(story_version_id)`;
        console.log("✅ moodboards indexes created");

        // Create moodboard_items table
        console.log("\n📝 Creating moodboard_items table...");

        await sql`
            CREATE TABLE IF NOT EXISTS moodboard_items (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
                beat_key VARCHAR(100) NOT NULL,
                beat_label VARCHAR(255) NOT NULL,
                beat_content TEXT,
                beat_index INTEGER NOT NULL,
                key_action_index INTEGER NOT NULL,
                key_action_description TEXT,
                characters_involved TEXT[],
                universe_level VARCHAR(100),
                prompt TEXT,
                negative_prompt TEXT,
                image_url TEXT,
                video_prompt TEXT,
                video_url TEXT,
                previous_image_url TEXT,
                edit_count INTEGER DEFAULT 0,
                status VARCHAR(20) DEFAULT 'empty',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                CONSTRAINT unique_moodboard_beat_action UNIQUE(moodboard_id, beat_key, key_action_index)
            )
        `;
        console.log("✅ moodboard_items table created");

        // Create indexes for moodboard_items
        console.log("📝 Creating moodboard_items indexes...");
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboard_items_moodboard ON moodboard_items(moodboard_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboard_items_beat ON moodboard_items(beat_key)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboard_items_status ON moodboard_items(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_moodboard_items_beat_order ON moodboard_items(moodboard_id, beat_index, key_action_index)`;
        console.log("✅ moodboard_items indexes created");

        console.log("\n" + "=".repeat(50));
        console.log("✅ Migration completed successfully!");
        console.log("=".repeat(50));

        // Verify tables
        console.log("\n📋 Verifying tables...");

        const moodboardsTable = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'moodboards'
            ORDER BY ordinal_position
        `;

        const moodboardItemsTable = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'moodboard_items'
            ORDER BY ordinal_position
        `;

        console.log(`\n✅ moodboards table: ${moodboardsTable.length} columns`);
        moodboardsTable.forEach((col: any) => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

        console.log(`\n✅ moodboard_items table: ${moodboardItemsTable.length} columns`);
        moodboardItemsTable.forEach((col: any) => {
            console.log(`   - ${col.column_name}: ${col.data_type}`);
        });

    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }

    console.log("\n🎉 Moodboard V2 migration complete!\n");
}

runMigration();
