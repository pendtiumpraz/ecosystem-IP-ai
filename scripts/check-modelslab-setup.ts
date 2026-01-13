/**
 * Script to check ModelsLab AI provider setup in database
 * Run: npx tsx scripts/check-modelslab-setup.ts
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function checkSetup() {
    console.log("\n🔍 Checking ModelsLab AI Provider Setup...\n");

    // 1. Check ai_providers table
    console.log("1️⃣ Checking ai_providers table...");
    const providers = await sql`
        SELECT id, name, slug, is_active, api_base_url 
        FROM ai_providers 
        WHERE slug ILIKE '%modelslab%' OR name ILIKE '%modelslab%'
    `;

    if (providers.length === 0) {
        console.log("   ❌ No ModelsLab provider found!");
        console.log("   Please add provider with slug = 'modelslab'");
    } else {
        console.log("   ✅ Provider found:");
        providers.forEach(p => {
            console.log(`      - ID: ${p.id}`);
            console.log(`      - Name: ${p.name}`);
            console.log(`      - Slug: ${p.slug} ${p.slug === 'modelslab' ? '✅' : '⚠️ Should be "modelslab"'}`);
            console.log(`      - Active: ${p.is_active ? '✅' : '❌'}`);
            console.log(`      - Base URL: ${p.api_base_url}`);
        });
    }

    const providerId = providers[0]?.id;

    // 2. Check ai_models table
    console.log("\n2️⃣ Checking ai_models table...");
    const models = await sql`
        SELECT m.id, m.model_id, m.name, m.type, m.is_active, m.is_default, m.credit_cost,
               p.slug as provider_slug
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE p.slug ILIKE '%modelslab%' OR p.name ILIKE '%modelslab%'
    `;

    if (models.length === 0) {
        console.log("   ❌ No models found for ModelsLab!");
        console.log("   Please add models with provider_id linked to ModelsLab");
    } else {
        console.log(`   ✅ Found ${models.length} model(s):`);
        models.forEach(m => {
            console.log(`      - Model ID: ${m.model_id}`);
            console.log(`        Name: ${m.name}`);
            console.log(`        Type: ${m.type}`);
            console.log(`        Active: ${m.is_active ? '✅' : '❌'}`);
            console.log(`        Default: ${m.is_default ? '✅' : '❌'}`);
            console.log(`        Credit Cost: ${m.credit_cost}`);
            console.log("");
        });
    }

    // 3. Check platform_api_keys table
    console.log("3️⃣ Checking platform_api_keys table...");
    const apiKeys = await sql`
        SELECT pk.id, pk.name, pk.is_active, 
               LEFT(pk.encrypted_key, 8) || '...' || RIGHT(pk.encrypted_key, 4) as masked_key,
               LENGTH(pk.encrypted_key) as key_length,
               p.slug as provider_slug
        FROM platform_api_keys pk
        JOIN ai_providers p ON pk.provider_id = p.id
        WHERE p.slug ILIKE '%modelslab%' OR p.name ILIKE '%modelslab%'
    `;

    if (apiKeys.length === 0) {
        console.log("   ❌ No API keys found for ModelsLab!");
        console.log("   Please add API key in /admin/ai-providers");
    } else {
        console.log(`   ✅ Found ${apiKeys.length} API key(s):`);
        apiKeys.forEach(k => {
            console.log(`      - ID: ${k.id}`);
            console.log(`        Name: ${k.name}`);
            console.log(`        Active: ${k.is_active ? '✅' : '❌'}`);
            console.log(`        Key: ${k.masked_key} (${k.key_length} chars)`);
            console.log("");
        });
    }

    // 4. Check ai_tier_models for image type
    console.log("4️⃣ Checking ai_tier_models (tier-specific models)...");
    const tierModels = await sql`
        SELECT tm.tier, tm.model_type, m.model_id, m.name, p.slug
        FROM ai_tier_models tm
        JOIN ai_models m ON tm.model_id = m.id
        JOIN ai_providers p ON m.provider_id = p.id
        WHERE tm.model_type = 'image'
    `;

    if (tierModels.length === 0) {
        console.log("   ⚠️ No tier-specific image models set!");
        console.log("   System will use is_default=true model as fallback");
    } else {
        console.log(`   ✅ Found ${tierModels.length} tier model(s):`);
        tierModels.forEach(t => {
            console.log(`      - Tier: ${t.tier}, Model: ${t.model_id} (${t.name}), Provider: ${t.slug}`);
        });
    }

    // 5. Test getActiveModel query
    console.log("\n5️⃣ Testing getActiveModel query for 'image' type...");
    const activeModel = await sql`
        SELECT 
            m.id, m.model_id, m.name as display_name, m.credit_cost,
            p.slug as provider_name, pk.encrypted_key as api_key, p.api_base_url as base_url
        FROM ai_models m
        JOIN ai_providers p ON m.provider_id = p.id
        LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
        WHERE m.type = 'image' 
            AND m.is_default = TRUE 
            AND m.is_active = TRUE
            AND p.is_active = TRUE
        LIMIT 1
    `;

    if (activeModel.length === 0) {
        console.log("   ❌ No default active image model found!");
    } else {
        const am = activeModel[0];
        console.log("   ✅ Active image model:");
        console.log(`      - Model ID: ${am.model_id}`);
        console.log(`      - Name: ${am.display_name}`);
        console.log(`      - Provider: ${am.provider_name}`);
        console.log(`      - Credit Cost: ${am.credit_cost}`);
        console.log(`      - API Key: ${am.api_key ? '✅ Present' : '❌ MISSING!'}`);
        console.log(`      - Base URL: ${am.base_url}`);
    }

    console.log("\n✅ Check complete!\n");
}

checkSetup().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
