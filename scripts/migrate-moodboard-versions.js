const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
    console.log('🚀 Running moodboard image versions migration...\n');

    // 1. Create table
    console.log('1. Creating table...');
    await sql`
        CREATE TABLE IF NOT EXISTS moodboard_item_image_versions (
            id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
            moodboard_id VARCHAR(36) NOT NULL,
            moodboard_item_id VARCHAR(100) NOT NULL,
            version_number INTEGER NOT NULL DEFAULT 1,
            is_active BOOLEAN NOT NULL DEFAULT false,
            image_url TEXT NOT NULL,
            thumbnail_url TEXT,
            drive_file_id VARCHAR(100),
            prompt_used TEXT,
            model_used VARCHAR(100),
            art_style VARCHAR(50),
            aspect_ratio VARCHAR(20),
            credit_cost INTEGER DEFAULT 0,
            generation_time_ms INTEGER,
            source_type VARCHAR(50) DEFAULT 'generated',
            created_at TIMESTAMP DEFAULT NOW() NOT NULL,
            deleted_at TIMESTAMP
        )
    `;
    console.log('   ✅ Table created\n');

    // 2. Create indexes
    console.log('2. Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_miv_moodboard_id ON moodboard_item_image_versions(moodboard_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_miv_item_id ON moodboard_item_image_versions(moodboard_item_id)`;
    console.log('   ✅ Indexes created\n');

    // 3. Check existing images to migrate
    console.log('3. Checking existing images...');
    const existingImages = await sql`
        SELECT COUNT(*) as count 
        FROM moodboard_items 
        WHERE image_url IS NOT NULL AND image_url != ''
    `;
    console.log(`   Found ${existingImages[0].count} images to migrate\n`);

    // 4. Check if already migrated
    const alreadyMigrated = await sql`
        SELECT COUNT(*) as count FROM moodboard_item_image_versions
    `;

    if (alreadyMigrated[0].count > 0) {
        console.log(`   ⚠️  Already have ${alreadyMigrated[0].count} versions, skipping migration\n`);
    } else {
        // 5. Migrate existing images as v1
        console.log('4. Migrating existing images as v1...');
        const migrated = await sql`
            INSERT INTO moodboard_item_image_versions (
                moodboard_id, moodboard_item_id, version_number, is_active,
                image_url, thumbnail_url, prompt_used, art_style, source_type, created_at
            )
            SELECT 
                mi.moodboard_id, mi.id, 1, true,
                mi.image_url, mi.image_url, mi.prompt, m.art_style, 'generated',
                COALESCE(mi.updated_at, mi.created_at, NOW())
            FROM moodboard_items mi
            JOIN moodboards m ON m.id = mi.moodboard_id
            WHERE mi.image_url IS NOT NULL AND mi.image_url != ''
            RETURNING id
        `;
        console.log(`   ✅ Migrated ${migrated.length} images as v1\n`);
    }

    // 6. Verify
    console.log('5. Verification:');
    const count = await sql`SELECT COUNT(*) as total FROM moodboard_item_image_versions`;
    console.log(`   Total versions in table: ${count[0].total}`);

    const activeCount = await sql`SELECT COUNT(*) as total FROM moodboard_item_image_versions WHERE is_active = true`;
    console.log(`   Active versions: ${activeCount[0].total}`);

    console.log('\n✅ Migration complete!');
}

runMigration()
    .then(() => process.exit(0))
    .catch(e => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    });
