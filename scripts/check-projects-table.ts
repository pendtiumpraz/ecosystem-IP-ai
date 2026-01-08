// Quick check for projects table columns
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkProjectsTable() {
    const sql = neon(process.env.DATABASE_URL!);

    // Check projects columns
    const columns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'projects'
        ORDER BY ordinal_position
    `;

    console.log("=== PROJECTS TABLE COLUMNS ===");
    columns.forEach((c: any) => console.log(`  - ${c.column_name}: ${c.data_type}`));

    // Check universes table
    const universesColumns = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'universes'
        ORDER BY ordinal_position
    `;

    console.log("\n=== UNIVERSES TABLE COLUMNS ===");
    universesColumns.forEach((c: any) => console.log(`  - ${c.column_name}: ${c.data_type}`));
}

checkProjectsTable().catch(console.error);
