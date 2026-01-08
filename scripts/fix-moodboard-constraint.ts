// Fix unique constraint to support soft delete
import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function fixConstraint() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("🔧 Fixing moodboards unique constraint for soft delete support...\n");

    // Drop old constraint if exists
    try {
        console.log("1. Dropping old constraint...");
        await sql`ALTER TABLE moodboards DROP CONSTRAINT IF EXISTS unique_story_version_moodboard`;
        console.log("   ✅ Old constraint dropped");
    } catch (e: any) {
        console.log("   ⏭️ Constraint not found:", e.message);
    }

    // Drop old index if exists
    try {
        await sql`DROP INDEX IF EXISTS unique_story_version_moodboard`;
        await sql`DROP INDEX IF EXISTS unique_active_story_version_moodboard`;
        console.log("   ✅ Old indexes dropped");
    } catch (e: any) {
        console.log("   ⏭️ Index cleanup:", e.message);
    }

    // Create partial unique index (only for non-deleted records)
    console.log("\n2. Creating partial unique index...");
    await sql`
        CREATE UNIQUE INDEX unique_active_story_version_moodboard 
        ON moodboards (story_version_id) 
        WHERE deleted_at IS NULL
    `;
    console.log("   ✅ Partial unique index created");

    console.log("\n🎉 Done! Now soft-deleted moodboards won't conflict with new ones.");
}

fixConstraint().catch(console.error);
