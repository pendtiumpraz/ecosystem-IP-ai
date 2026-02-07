const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function addColumn() {
    console.log('Adding emotional_beat column to scene_plots table...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'NOT FOUND');

    try {
        await sql`ALTER TABLE scene_plots ADD COLUMN IF NOT EXISTS emotional_beat TEXT`;
        console.log('SUCCESS: emotional_beat column added!');
    } catch (e) {
        console.error('ERROR:', e.message);
    }

    process.exit(0);
}

addColumn();
