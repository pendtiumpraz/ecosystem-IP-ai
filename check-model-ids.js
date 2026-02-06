const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkModelIds() {
    try {
        console.log('Checking AI models...');
        const result = await sql`
            SELECT id, name, model_id, LENGTH(model_id) as model_id_length 
            FROM ai_models 
            ORDER BY LENGTH(model_id) DESC
            LIMIT 10
        `;
        console.log('Longest model_ids:');
        result.forEach(r => console.log(`  ${r.name}: ${r.model_id} (${r.model_id_length} chars)`));

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkModelIds();
