// Run moodboard versioning migration
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function runMigration() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("🚀 Adding moodboard versioning support...\n");

    // 1. Add version columns
    console.log("1. Adding version columns...");
    try {
        await sql`ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS version_number INTEGER DEFAULT 1`;
        await sql`ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS version_name VARCHAR(255) DEFAULT 'v1'`;
        console.log("   ✅ Version columns added");
    } catch (e: any) {
        console.log("   ⏭️ Columns may already exist:", e.message);
    }

    // 2. Update existing moodboards
    console.log("\n2. Updating existing moodboards...");
    await sql`UPDATE moodboards SET version_number = 1, version_name = 'v1' WHERE version_number IS NULL`;
    console.log("   ✅ Existing moodboards updated");

    // 3. Drop old unique constraint (we already have partial unique index)
    console.log("\n3. Checking constraints...");
    try {
        await sql`DROP INDEX IF EXISTS unique_active_story_version_moodboard`;
        console.log("   ✅ Old unique index dropped");
    } catch (e: any) {
        console.log("   ⏭️ Index may not exist:", e.message);
    }

    // 4. Create new compound unique index (story_version_id + version_number where not deleted)
    console.log("\n4. Creating new unique index...");
    await sql`
        CREATE UNIQUE INDEX IF NOT EXISTS unique_active_moodboard_version 
        ON moodboards (story_version_id, version_number) 
        WHERE deleted_at IS NULL
    `;
    console.log("   ✅ New unique index created");

    // 5. Create index for faster queries
    console.log("\n5. Creating query optimization index...");
    await sql`CREATE INDEX IF NOT EXISTS idx_moodboards_story_version ON moodboards (story_version_id, version_number)`;
    console.log("   ✅ Query index created");

    console.log("\n🎉 Moodboard versioning migration complete!");

    // Verify
    const cols = await sql`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'moodboards' 
        AND column_name IN ('version_number', 'version_name')
    `;
    console.log("\nVerified columns:");
    cols.forEach((c: any) => console.log(`  - ${c.column_name}: ${c.data_type}`));
}

runMigration().catch(console.error);
