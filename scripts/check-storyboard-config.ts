// Check storyboard_config in database
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL!);

async function checkStoryboardConfig() {
    const projectId = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe';

    console.log('Checking project:', projectId);

    const result = await sql`
        SELECT id, title, storyboard_config, updated_at 
        FROM projects 
        WHERE id = ${projectId}
    `;

    if (result.length === 0) {
        console.log('Project not found!');
        return;
    }

    const project = result[0];
    console.log('\nProject name:', project.name);
    console.log('Updated at:', project.updated_at);
    console.log('\nStoryboard config:');
    console.log(JSON.stringify(project.storyboard_config, null, 2));
}

checkStoryboardConfig().catch(console.error);
