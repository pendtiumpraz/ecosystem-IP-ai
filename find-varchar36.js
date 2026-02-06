const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function findVarchar36() {
    try {
        console.log('Finding all VARCHAR(36) columns...');
        const result = await sql`
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE character_maximum_length = 36
            ORDER BY table_name, column_name
        `;
        console.log('Columns with VARCHAR(36):');
        result.forEach(r => console.log(`  ${r.table_name}.${r.column_name}`));

    } catch (e) {
        console.error('Error:', e.message);
    }
}

findVarchar36();
