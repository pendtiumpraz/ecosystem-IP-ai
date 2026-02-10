const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function run() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('Adding protagonist_name column to projects...');
    try {
        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS protagonist_name TEXT`;
        console.log('✅ protagonist_name added');
    } catch (err) {
        console.log('May already exist:', err.message);
    }

    // Verify
    const cols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'protagonist_name'
    `;
    console.log('Verified protagonist_name exists:', cols.length > 0);

    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
