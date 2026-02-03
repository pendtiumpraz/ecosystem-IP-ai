require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function checkRoles() {
    try {
        const result = await sql`SELECT id, name, role FROM characters WHERE deleted_at IS NULL LIMIT 20`;
        console.log('Characters and roles:');
        result.rows.forEach(row => {
            console.log(`  - ${row.name}: role='${row.role}'`);
        });
    } catch (e) {
        console.error('Error:', e.message);
    }
    process.exit();
}

checkRoles();
