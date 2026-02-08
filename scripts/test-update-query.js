const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function testQuery() {
    const versionId = '84636cc9-7267-4442-96c9-35dd854c5dbe';
    const sceneNumber = 1;
    const title = 'Test Title';
    const synopsis = 'Test synopsis';
    const location = 'Test location';
    const timeOfDay = 'day';
    const emotionalBeat = 'Test emotion';
    const characters = ['Gatotkaca'];

    console.log('Testing UPDATE query...');
    console.log('versionId:', versionId, typeof versionId);

    try {
        // Test 1: Using CAST
        const result1 = await sql`
            UPDATE scene_plots SET
                scene_title = ${title},
                scene_description = ${synopsis},
                scene_location = ${location},
                scene_time = ${timeOfDay},
                emotional_beat = ${emotionalBeat},
                characters_present = ${characters}::text[],
                updated_at = NOW()
            WHERE story_version_id = CAST(${versionId} AS uuid)
            AND scene_number = ${sceneNumber}
            RETURNING id, scene_number, scene_title
        `;
        console.log('CAST approach SUCCESS:', result1);
    } catch (e) {
        console.error('CAST approach FAILED:', e.message);
    }

    try {
        // Test 2: Direct comparison (should work if versionId is valid uuid string)
        const result2 = await sql`
            SELECT id, scene_number, story_version_id 
            FROM scene_plots 
            WHERE story_version_id = ${versionId}::uuid
            AND scene_number = 1
            LIMIT 1
        `;
        console.log('::uuid approach on SELECT SUCCESS:', result2);
    } catch (e) {
        console.error('::uuid approach on SELECT FAILED:', e.message);
    }

    process.exit(0);
}

testQuery();
