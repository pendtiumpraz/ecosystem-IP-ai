import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
    console.log("🚀 Adding visual grid columns to character_image_versions...\n");

    try {
        // Add key_poses column to character_image_versions
        console.log("Adding key_poses column to character_image_versions...");
        await sql`ALTER TABLE character_image_versions ADD COLUMN IF NOT EXISTS key_poses JSONB DEFAULT '{}'`;
        console.log("✅ key_poses column added\n");

        // Add facial_expressions column
        console.log("Adding facial_expressions column to character_image_versions...");
        await sql`ALTER TABLE character_image_versions ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}'`;
        console.log("✅ facial_expressions column added\n");

        // Add emotion_gestures column
        console.log("Adding emotion_gestures column to character_image_versions...");
        await sql`ALTER TABLE character_image_versions ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}'`;
        console.log("✅ emotion_gestures column added\n");

        // Verify
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'character_image_versions' 
      AND column_name IN ('key_poses', 'facial_expressions', 'emotion_gestures')
      ORDER BY column_name
    `;
        console.log("📋 Verification - New columns in character_image_versions:");
        columns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

        console.log("\n✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
