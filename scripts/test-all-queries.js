const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testAllQueries() {
    const projectId = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe';
    const versionId = '84636cc9-7267-4442-96c9-35dd854c5dbe';

    console.log('Testing all queries from generate-batch...\n');

    // Test 1: SELECT story_version from stories
    try {
        const result = await sql`
            SELECT sv.id FROM story_versions sv
            JOIN stories s ON sv.story_id = s.id
            WHERE s.project_id = CAST(${projectId} AS uuid)
            ORDER BY sv.created_at DESC
            LIMIT 1
        `;
        console.log('✓ SELECT story_version:', result[0]?.id);
    } catch (e) {
        console.error('✗ SELECT story_version FAILED:', e.message);
    }

    // Test 2: UPDATE scene_plots
    try {
        const result = await sql`
            UPDATE scene_plots SET
                scene_title = ${'Test'},
                updated_at = NOW()
            WHERE story_version_id = CAST(${versionId} AS uuid)
            AND scene_number = 1
            RETURNING id
        `;
        console.log('✓ UPDATE scene_plots:', result[0]?.id);
    } catch (e) {
        console.error('✗ UPDATE scene_plots FAILED:', e.message);
    }

    // Test 3: UPDATE projects - THIS IS LIKELY THE PROBLEM
    try {
        const result = await sql`
            UPDATE projects
            SET storyboard_config = COALESCE(storyboard_config, '{}'::jsonb) || 
                '{"generationStatus": "generating_plots"}'::jsonb,
                updated_at = NOW()
            WHERE id = CAST(${projectId} AS uuid)
            RETURNING id
        `;
        console.log('✓ UPDATE projects:', result[0]?.id);
    } catch (e) {
        console.error('✗ UPDATE projects FAILED:', e.message);
    }

    // Test 4: What type is projects.id?
    try {
        const result = await sql`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'id'
        `;
        console.log('\nprojects.id column type:', result[0]);
    } catch (e) {
        console.error('Schema check failed:', e.message);
    }

    // Test 5: What type is stories.project_id?
    try {
        const result = await sql`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'stories' AND column_name = 'project_id'
        `;
        console.log('stories.project_id column type:', result[0]);
    } catch (e) {
        console.error('Schema check failed:', e.message);
    }

    process.exit(0);
}

testAllQueries();
