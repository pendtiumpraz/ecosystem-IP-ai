const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

(async () => {
    const sql = neon(process.env.DATABASE_URL);

    // Check users.id type
    const userCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'id'`;
    console.log('users.id type:', userCols[0]?.data_type);

    // Check stories.project_id type
    const storyCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stories' AND column_name = 'project_id'`;
    console.log('stories.project_id type:', storyCols[0]?.data_type);

    // Check characters.project_id type
    const charCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'characters' AND column_name = 'project_id'`;
    console.log('characters.project_id type:', charCols[0]?.data_type);

    // Check projects.id type
    const projCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'id'`;
    console.log('projects.id type:', projCols[0]?.data_type);

    process.exit(0);
})();
