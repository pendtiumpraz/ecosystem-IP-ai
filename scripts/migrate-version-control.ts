/**
 * Migration: Add Version Control columns to generated_media
 * 
 * Run: npx tsx scripts/migrate-version-control.ts
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function migrate() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("🔧 Adding version control columns to generated_media...\n");

    // Add variant_type column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS variant_type VARCHAR(50) DEFAULT 'default'
        `;
        console.log("✅ Added variant_type column");
    } catch (e) {
        console.log("⚠️ variant_type column may already exist");
    }

    // Add variant_name column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS variant_name VARCHAR(100)
        `;
        console.log("✅ Added variant_name column");
    } catch (e) {
        console.log("⚠️ variant_name column may already exist");
    }

    // Add style_used column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS style_used VARCHAR(100) DEFAULT 'realistic'
        `;
        console.log("✅ Added style_used column");
    } catch (e) {
        console.log("⚠️ style_used column may already exist");
    }

    // Add generation_version column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS generation_version INTEGER DEFAULT 1
        `;
        console.log("✅ Added generation_version column");
    } catch (e) {
        console.log("⚠️ generation_version column may already exist");
    }

    // Add version_name column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS version_name VARCHAR(255)
        `;
        console.log("✅ Added version_name column");
    } catch (e) {
        console.log("⚠️ version_name column may already exist");
    }

    // Add is_primary_for_style column
    try {
        await sql`
            ALTER TABLE generated_media 
            ADD COLUMN IF NOT EXISTS is_primary_for_style BOOLEAN DEFAULT FALSE
        `;
        console.log("✅ Added is_primary_for_style column");
    } catch (e) {
        console.log("⚠️ is_primary_for_style column may already exist");
    }

    // Create index for faster queries
    try {
        await sql`
            CREATE INDEX IF NOT EXISTS idx_generated_media_entity_style 
            ON generated_media(entity_type, entity_id, style_used)
        `;
        console.log("✅ Created index for entity+style queries");
    } catch (e) {
        console.log("⚠️ Index may already exist");
    }

    console.log("\n🎉 Migration complete!");
    console.log("\nNew columns:");
    console.log("  - variant_type: 'default', 'expression', 'pose', 'style'");
    console.log("  - variant_name: 'Happy', 'Sad', 'Portrait', etc.");
    console.log("  - style_used: 'realistic', 'anime', 'ghibli', etc.");
    console.log("  - generation_version: Auto-increment per entity+style");
    console.log("  - version_name: User-defined, editable name");
    console.log("  - is_primary_for_style: Primary image per style");
}

migrate().catch(console.error);
