const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
    console.log('Checking scene_plots table schema...');

    try {
        const result = await sql`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'scene_plots'
            ORDER BY ordinal_position
        `;
        console.log('Columns:');
        result.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (${r.udt_name})`));
    } catch (e) {
        console.error('ERROR:', e.message);
    }

    process.exit(0);
}

checkSchema();
