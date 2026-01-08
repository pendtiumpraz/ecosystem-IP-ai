// Check where story beats are stored
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkStories() {
    const sql = neon(process.env.DATABASE_URL!);

    // Check stories table
    const stories = await sql`
        SELECT * FROM stories 
        WHERE project_id = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe'
        LIMIT 1
    `;

    console.log("=== STORIES ===");
    if (stories.length > 0) {
        const s = stories[0];
        console.log("id:", s.id);
        console.log("structure:", s.structure);
        console.log("structure_beats:", JSON.stringify(s.structure_beats, null, 2)?.substring(0, 1000));
    } else {
        console.log("No stories found");
    }

    // Check story_versions columns
    const cols = await sql`
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'story_versions' 
        ORDER BY ordinal_position
    `;
    console.log("\n=== STORY_VERSIONS COLUMNS ===");
    cols.forEach((c: any) => console.log("  -", c.column_name));
}

checkStories().catch(console.error);
