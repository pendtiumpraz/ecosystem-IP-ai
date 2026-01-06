// Migration script to add character_relations column
const { neon } = require('@neondatabase/serverless');
require('dotenv').config();

async function migrate() {
    const sql = neon(process.env.DATABASE_URL);

    try {
        await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS character_relations jsonb DEFAULT '[]'`;
        console.log('✅ Migration SUCCESS! character_relations column added to stories table.');
    } catch (error) {
        console.error('❌ Migration FAILED:', error.message);
        process.exit(1);
    }
}

migrate();
