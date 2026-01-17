const { neon } = require("@neondatabase/serverless");
require("dotenv").config({ path: ".env.local" });

async function runMigration() {
    const sql = neon(process.env.DATABASE_URL);

    console.log("Running migration: clip_video_versions");

    // Add active_video_version_id column to animation_clips
    try {
        await sql`ALTER TABLE animation_clips ADD COLUMN IF NOT EXISTS active_video_version_id VARCHAR(36)`;
        console.log("✓ Added active_video_version_id column");
    } catch (e) {
        console.log("✓ active_video_version_id column exists");
    }

    // Check if clip_video_versions table exists
    const tableExists = await sql`
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'clip_video_versions'
        )
    `;

    if (tableExists[0].exists) {
        console.log("✓ clip_video_versions table already exists");
        return;
    }

    // Create clip_video_versions table
    await sql`
        CREATE TABLE clip_video_versions (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
            clip_id VARCHAR(36) NOT NULL REFERENCES animation_clips(id) ON DELETE CASCADE,
            version_number INTEGER NOT NULL DEFAULT 1,
            source VARCHAR(50) DEFAULT 'generated',
            video_url TEXT,
            thumbnail_url TEXT,
            preview_gif_url TEXT,
            drive_file_id VARCHAR(255),
            original_file_name VARCHAR(500),
            external_url TEXT,
            prompt TEXT,
            camera_motion VARCHAR(50) DEFAULT 'static',
            duration INTEGER DEFAULT 6,
            job_id VARCHAR(255),
            is_active BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            deleted_at TIMESTAMP
        )
    `;
    console.log("✓ Created clip_video_versions table");

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_clip_video_versions_clip ON clip_video_versions(clip_id)`;
    console.log("✓ Created index on clip_id");

    console.log("\nMigration complete!");
}

runMigration().catch(console.error);
