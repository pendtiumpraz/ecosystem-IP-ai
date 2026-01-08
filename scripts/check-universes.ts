// Check universes for specific project
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkUniverses() {
    const sql = neon(process.env.DATABASE_URL!);

    // Check universes for this project
    const universes = await sql`
        SELECT * FROM universes 
        WHERE project_id = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe'
    `;

    console.log("=== UNIVERSES for project ===");
    console.log("Found:", universes.length, "universes");

    if (universes.length > 0) {
        console.log("Universe data:", JSON.stringify(universes[0], null, 2));
    }

    // Also check projects.universe_formula_id
    const project = await sql`
        SELECT id, title, universe_formula_id FROM projects 
        WHERE id = 'c8a729aa-b105-4589-b4cc-f63f3ccd2ffe'
    `;
    console.log("\n=== PROJECT universe_formula_id ===");
    console.log(project[0]);
}

checkUniverses().catch(console.error);
