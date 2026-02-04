import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkCharacter() {
    console.log('Checking Putri Arum Dalu character data...\n');

    const characters = await sql`
        SELECT * 
        FROM characters 
        WHERE name ILIKE '%Putri Arum%' OR name ILIKE '%Arum Dalu%'
        LIMIT 1
    `;

    if (characters.length === 0) {
        console.log('Character not found');
        return;
    }

    const char = characters[0];
    console.log('Character:', char.name);
    console.log('\n=== ALL COLUMNS ===\n');
    console.log(JSON.stringify(char, null, 2));

    console.log('\n=== CHECKING JSONB FIELDS ===\n');

    // Check each JSONB column
    console.log('emotional:', JSON.stringify(char.emotional, null, 2));
    console.log('\nfamily:', JSON.stringify(char.family, null, 2));
    console.log('\ncore_beliefs:', JSON.stringify(char.core_beliefs, null, 2));
    console.log('\nsociopolitics:', JSON.stringify(char.sociopolitics, null, 2));
    console.log('\neducational:', JSON.stringify(char.educational, null, 2));
}

checkCharacter().catch(console.error);
