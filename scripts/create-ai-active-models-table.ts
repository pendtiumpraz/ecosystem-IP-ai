/**
 * Create ai_active_models table
 * This script creates the table for storing active models per subcategory
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function createAiActiveModelsTable() {
    console.log("🏗️ Creating ai_active_models table...\n");

    try {
        await sql`
            CREATE TABLE IF NOT EXISTS ai_active_models (
                id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
                subcategory VARCHAR(50) NOT NULL UNIQUE,
                model_id VARCHAR(36) NOT NULL REFERENCES ai_models(id),
                created_at TIMESTAMP DEFAULT NOW() NOT NULL,
                updated_at TIMESTAMP DEFAULT NOW() NOT NULL
            )
        `;
        console.log("✅ ai_active_models table created successfully!");

        // List existing tables to verify
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'ai_active_models'
        `;
        console.log("\nVerification:", tables);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

createAiActiveModelsTable()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Failed:", err);
        process.exit(1);
    });
