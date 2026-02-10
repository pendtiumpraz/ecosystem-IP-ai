// Run migration: node scripts/run-shot-prefs-migration.js
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Adding shot_preferences column to projects...');

    try {
        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS shot_preferences JSONB DEFAULT NULL`;
        console.log('✅ shot_preferences column added');
    } catch (err) {
        console.log('Column may already exist:', err.message);
    }

    // Also add updated_at to scene_shots if missing
    try {
        await sql`ALTER TABLE scene_shots ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;
        console.log('✅ updated_at column added to scene_shots');
    } catch (err) {
        console.log('updated_at may already exist:', err.message);
    }

    // Verify
    const cols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'shot_preferences'
    `;
    console.log('Verified shot_preferences exists:', cols.length > 0);

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
