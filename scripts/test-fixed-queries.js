const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testFixedQueries() {
    const projectId = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe';
    const versionId = '84636cc9-7267-4442-96c9-35dd854c5dbe';

    console.log('Testing FIXED queries (no uuid cast for varchar columns)...\n');

    // Test 1: SELECT story_version from stories (NO CAST - varchar)
    try {
        const result = await sql`
            SELECT sv.id FROM story_versions sv
            JOIN stories s ON sv.story_id = s.id
            WHERE s.project_id = ${projectId}
            ORDER BY sv.created_at DESC
            LIMIT 1
        `;
        console.log('✓ SELECT story_version:', result[0]?.id);
    } catch (e) {
        console.error('✗ SELECT story_version FAILED:', e.message);
    }

    // Test 2: UPDATE scene_plots (CAST - uuid column)
    try {
        const result = await sql`
            UPDATE scene_plots SET
                scene_title = ${'Test Fixed'},
                updated_at = NOW()
            WHERE story_version_id = CAST(${versionId} AS uuid)
            AND scene_number = 1
            RETURNING id
        `;
        console.log('✓ UPDATE scene_plots:', result[0]?.id);
    } catch (e) {
        console.error('✗ UPDATE scene_plots FAILED:', e.message);
    }

    // Test 3: UPDATE projects (NO CAST - varchar)
    try {
        const result = await sql`
            UPDATE projects
            SET storyboard_config = COALESCE(storyboard_config, '{}'::jsonb) || 
                '{"generationStatus": "generating_plots"}'::jsonb,
                updated_at = NOW()
            WHERE id = ${projectId}
            RETURNING id
        `;
        console.log('✓ UPDATE projects:', result[0]?.id);
    } catch (e) {
        console.error('✗ UPDATE projects FAILED:', e.message);
    }

    console.log('\n✅ All queries should pass now!');
    process.exit(0);
}

testFixedQueries();
