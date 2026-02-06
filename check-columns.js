const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
    try {
        console.log('Checking universe_field_images columns...');
        const images = await sql`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'universe_field_images' 
            AND character_maximum_length IS NOT NULL
        `;
        console.log('universe_field_images:', JSON.stringify(images, null, 2));

        console.log('\nChecking universe_field_prompts columns...');
        const prompts = await sql`
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'universe_field_prompts' 
            AND character_maximum_length IS NOT NULL
        `;
        console.log('universe_field_prompts:', JSON.stringify(prompts, null, 2));

    } catch (e) {
        console.error('Error:', e.message);
    }
}

checkColumns();
