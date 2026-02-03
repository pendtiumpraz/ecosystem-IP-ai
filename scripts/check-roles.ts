import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load from .env.local
dotenv.config({ path: '.env.local' });

async function checkRoles() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in .env.local!');
        process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.DATABASE_URL);

    try {
        const result = await sql`SELECT id, name, role FROM characters WHERE deleted_at IS NULL LIMIT 20`;
        console.log('Characters and roles:');
        result.forEach(row => {
            console.log(`  - ${row.name}: role='${row.role}'`);
        });
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkRoles();
