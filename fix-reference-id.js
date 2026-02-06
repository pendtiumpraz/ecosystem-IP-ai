const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function fixReferenceId() {
    try {
        console.log('Altering credit_transactions.reference_id to VARCHAR(100)...');
        await sql`ALTER TABLE credit_transactions ALTER COLUMN reference_id TYPE VARCHAR(100)`;
        console.log('✓ credit_transactions.reference_id fixed');

        console.log('Migration complete!');
    } catch (e) {
        console.error('Error:', e.message);
    }
}

fixReferenceId();
