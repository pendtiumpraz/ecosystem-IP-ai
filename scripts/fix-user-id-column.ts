/**
 * Fix user_id column type from UUID to TEXT
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
    console.log("Fixing user_id column type...");

    try {
        await sql`ALTER TABLE character_image_versions ALTER COLUMN user_id TYPE TEXT`;
        console.log("✅ user_id column type changed to TEXT");
    } catch (e: any) {
        console.error("Error:", e.message);
    }
}

fix();
