import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function runMigration() {
    console.log("🚀 Running character visual grids migration...\n");

    try {
        // Add key_poses column
        console.log("Adding key_poses column...");
        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS key_poses JSONB DEFAULT '{}'`;
        console.log("✅ key_poses column added\n");

        // Add facial_expressions column
        console.log("Adding facial_expressions column...");
        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS facial_expressions JSONB DEFAULT '{}'`;
        console.log("✅ facial_expressions column added\n");

        // Add emotion_gestures column
        console.log("Adding emotion_gestures column...");
        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS emotion_gestures JSONB DEFAULT '{}'`;
        console.log("✅ emotion_gestures column added\n");

        // Create indexes
        console.log("Creating indexes...");
        await sql`CREATE INDEX IF NOT EXISTS idx_characters_key_poses ON characters USING GIN (key_poses)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_characters_facial_expressions ON characters USING GIN (facial_expressions)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_characters_emotion_gestures ON characters USING GIN (emotion_gestures)`;
        console.log("✅ Indexes created\n");

        // Verify
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'characters' 
      AND column_name IN ('key_poses', 'facial_expressions', 'emotion_gestures')
      ORDER BY column_name
    `;
        console.log("📋 Verification - New columns:");
        columns.forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));

        console.log("\n✅ Migration completed successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
}

runMigration();
