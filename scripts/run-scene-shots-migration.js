// Run migration: node scripts/run-scene-shots-migration.js
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Running scene_shots migration...');

    const migrationSQL = fs.readFileSync(
        path.join(__dirname, '..', 'migrations', 'alter_scene_shots_add_columns.sql'),
        'utf-8'
    );

    // Split by DO $$ blocks and execute each
    const blocks = migrationSQL.split(/;\s*\n\n/).filter(b => b.trim());

    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed || trimmed.startsWith('--')) continue;

        try {
            await sql(trimmed.endsWith(';') ? trimmed : trimmed + ';');
            console.log('✅ Block executed successfully');
        } catch (err) {
            console.error('⚠️ Block error:', err.message);
            // Continue - some blocks may fail if columns already exist
        }
    }

    // Verify columns
    const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'scene_shots'
        ORDER BY ordinal_position
    `;

    console.log('\n📋 Current scene_shots columns:');
    columns.forEach(c => console.log(`  - ${c.column_name} (${c.data_type})`));

    console.log('\n✅ Migration complete!');
}

runMigration().catch(console.error);
