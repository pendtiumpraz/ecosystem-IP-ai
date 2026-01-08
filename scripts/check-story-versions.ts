// Quick check for story_versions data
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkStoryVersions() {
    const sql = neon(process.env.DATABASE_URL!);

    // Check story_versions for this project
    const storyVersions = await sql`
        SELECT id, version_name, structure, structure_type, character_ids
        FROM story_versions 
        WHERE project_id = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe'
        AND deleted_at IS NULL
    `;

    console.log("=== STORY VERSIONS ===");
    for (const sv of storyVersions) {
        console.log(`\n${sv.version_name} (${sv.id}):`);
        console.log("  structure_type:", sv.structure_type);
        console.log("  structure:", JSON.stringify(sv.structure, null, 2)?.substring(0, 500));
        console.log("  character_ids:", sv.character_ids);
    }
}

checkStoryVersions().catch(console.error);
