/**
 * Check and set active models from ai_active_models table
 * Run: npx tsx scripts/check-active-models.ts
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function main() {
    console.log("\n🔍 Checking ai_active_models table...\n");

    // Check all active models
    const activeModels = await sql`
        SELECT 
            am.subcategory,
            m.model_id,
            m.name as model_name,
            p.slug as provider_slug,
            pk.encrypted_key IS NOT NULL as has_api_key
        FROM ai_active_models am
        JOIN ai_models m ON am.model_id = m.id
        JOIN ai_providers p ON m.provider_id = p.id
        LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
        ORDER BY am.subcategory
    `;

    if (activeModels.length === 0) {
        console.log("❌ No active models set in ai_active_models!");
        console.log("\nPlease set active models via /admin/ai-providers\n");
    } else {
        console.log(`✅ Found ${activeModels.length} active model(s):\n`);
        activeModels.forEach(m => {
            console.log(`   ${m.subcategory}: ${m.model_name} (${m.provider_slug}) ${m.has_api_key ? '✅' : '❌ No API Key'}`);
        });
    }

    // Check specifically for text-to-image
    console.log("\n\n🎨 Checking text-to-image specifically...\n");

    const imageModel = await sql`
        SELECT 
            am.subcategory,
            m.model_id,
            m.name as model_name,
            p.slug as provider_slug,
            pk.encrypted_key as api_key
        FROM ai_active_models am
        JOIN ai_models m ON am.model_id = m.id
        JOIN ai_providers p ON m.provider_id = p.id
        LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
        WHERE am.subcategory = 'text-to-image'
    `;

    if (imageModel.length === 0) {
        console.log("❌ No active text-to-image model set!\n");

        // List available modelslab models
        console.log("📋 Available ModelsLab models:\n");
        const modelsLabModels = await sql`
            SELECT m.id, m.model_id, m.name, m.type
            FROM ai_models m
            JOIN ai_providers p ON m.provider_id = p.id
            WHERE p.slug = 'modelslab'
            AND m.is_active = TRUE
            ORDER BY m.name
            LIMIT 20
        `;

        if (modelsLabModels.length > 0) {
            modelsLabModels.forEach(m => {
                console.log(`   - ${m.name} (${m.model_id}) [${m.type}]`);
            });

            // Find a good image model
            const seedream = modelsLabModels.find(m =>
                m.model_id.includes('seedream') ||
                m.type === 'text-to-image' ||
                m.type === 'image'
            );

            if (seedream) {
                console.log(`\n🔧 Setting ${seedream.name} as active text-to-image model...\n`);

                await sql`
                    INSERT INTO ai_active_models (subcategory, model_id, updated_at)
                    VALUES ('text-to-image', ${seedream.id}, NOW())
                    ON CONFLICT (subcategory) 
                    DO UPDATE SET model_id = ${seedream.id}, updated_at = NOW()
                `;

                console.log("✅ Done! Model set as active.\n");
            }
        } else {
            console.log("   No ModelsLab models found in database!");
        }
    } else {
        console.log("✅ Active text-to-image model:");
        console.log(`   Model: ${imageModel[0].model_name}`);
        console.log(`   Provider: ${imageModel[0].provider_slug}`);
        console.log(`   API Key: ${imageModel[0].api_key ? '✅ Present' : '❌ MISSING'}`);
    }

    console.log("\n✅ Check complete!\n");
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
