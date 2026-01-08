// Check story_versions structure and universe
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function check() {
    const sql = neon(process.env.DATABASE_URL!);

    // Check all columns in story_versions
    const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'story_versions'
        ORDER BY ordinal_position
    `;

    console.log("=== STORY_VERSIONS COLUMNS ===");
    cols.forEach((c: any) => console.log(`  ${c.column_name}: ${c.data_type}`));

    // Check specific story version
    const sv = await sql`
        SELECT id, version_name, structure, structure_type
        FROM story_versions 
        WHERE id = '84636cc9-7267-4442-96c9-35dd854c5dbe'
    `;

    console.log("\n=== STORY VERSION DATA ===");
    console.log("id:", sv[0].id);
    console.log("version_name:", sv[0].version_name);
    console.log("structure:", sv[0].structure);
    console.log("structure_type:", sv[0].structure_type);
}

check().catch(console.error);
