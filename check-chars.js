const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function check() {
    // Find project
    const projects = await sql`
        SELECT id, title FROM projects 
        WHERE title ILIKE '%nana%' OR title ILIKE '%mustika%' 
        LIMIT 5
    `;
    console.log('Projects found:', projects.length);
    projects.forEach(p => console.log(`  - ${p.id}: ${p.title}`));

    if (projects.length > 0) {
        const projectId = projects[0].id;
        console.log('\nChecking characters for:', projects[0].title);

        const chars = await sql`
            SELECT id, name, role, image_url, image_poses 
            FROM characters 
            WHERE project_id = ${projectId}
        `;

        console.log('\nCharacters:', chars.length);
        chars.forEach(c => {
            console.log(`\n  Name: ${c.name}`);
            console.log(`  Role: ${c.role}`);
            console.log(`  image_url: ${c.image_url ? 'YES' : 'NO'}`);
            console.log(`  image_poses: ${c.image_poses ? JSON.stringify(Object.keys(c.image_poses)) : 'null'}`);
        });
    }
}

check().catch(console.error);
