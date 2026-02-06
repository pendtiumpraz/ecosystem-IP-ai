const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
    try {
        console.log('Altering universe_field_images.field_key...');
        await sql`ALTER TABLE universe_field_images ALTER COLUMN field_key TYPE VARCHAR(100)`;
        console.log('✓ universe_field_images fixed');

        console.log('Altering universe_field_prompts.field_key...');
        await sql`ALTER TABLE universe_field_prompts ALTER COLUMN field_key TYPE VARCHAR(100)`;
        console.log('✓ universe_field_prompts fixed');

        console.log('Migration complete!');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

runMigration();
