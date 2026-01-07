/**
 * Story-Character Linking Migration Script
 * Run with: node scripts/run-story-character-migration.js
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
    console.log('🚀 Starting Story-Character Linking Migration...\n');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('❌ DATABASE_URL not found in environment');
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    try {
        // Check if story_versions table exists
        const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'story_versions'
      )
    `;

        if (!tableCheck[0].exists) {
            console.error('❌ story_versions table does not exist. Run story versions migration first.');
            process.exit(1);
        }

        console.log('✅ story_versions table exists\n');

        // Check and add structure_type column
        const structureTypeCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'story_versions' AND column_name = 'structure_type'
      )
    `;

        if (!structureTypeCheck[0].exists) {
            console.log('📝 Adding structure_type column...');
            await sql`ALTER TABLE story_versions ADD COLUMN structure_type TEXT DEFAULT 'hero-journey'`;
            console.log('✅ structure_type column added\n');
        } else {
            console.log('⏭️  structure_type column already exists\n');
        }

        // Check and add character_ids column
        const characterIdsCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'story_versions' AND column_name = 'character_ids'
      )
    `;

        if (!characterIdsCheck[0].exists) {
            console.log('📝 Adding character_ids column...');
            await sql`ALTER TABLE story_versions ADD COLUMN character_ids TEXT[] DEFAULT '{}'`;
            console.log('✅ character_ids column added\n');
        } else {
            console.log('⏭️  character_ids column already exists\n');
        }

        // Check and add episode_number column
        const episodeCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'story_versions' AND column_name = 'episode_number'
      )
    `;

        if (!episodeCheck[0].exists) {
            console.log('📝 Adding episode_number column...');
            await sql`ALTER TABLE story_versions ADD COLUMN episode_number INTEGER DEFAULT 1`;
            console.log('✅ episode_number column added\n');
        } else {
            console.log('⏭️  episode_number column already exists\n');
        }

        // Update existing stories to have default structure_type
        console.log('📝 Updating existing stories with default structure_type...');
        const updateResult = await sql`
      UPDATE story_versions 
      SET structure_type = 'hero-journey' 
      WHERE structure_type IS NULL
      RETURNING id
    `;
        console.log(`✅ Updated ${updateResult.length} stories\n`);

        // Verify columns
        console.log('📋 Verifying story_versions columns:');
        const columns = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_name = 'story_versions'
      ORDER BY ordinal_position
    `;

        columns.forEach(col => {
            console.log(`   - ${col.column_name}: ${col.data_type} ${col.column_default ? `(default: ${col.column_default})` : ''}`);
        });

        console.log('\n🎉 Migration completed successfully!');
        console.log('\nNew columns added:');
        console.log('   - structure_type: Stores locked structure type (hero-journey, save-the-cat, dan-harmon)');
        console.log('   - character_ids: Array of character UUIDs used in this story');
        console.log('   - episode_number: Episode ordering number');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigration();
