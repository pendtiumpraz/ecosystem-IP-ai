import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { 
  TEXT_MODEL_RATES, 
  IMAGE_MODEL_RATES, 
  VIDEO_MODEL_RATES, 
  AUDIO_MODEL_RATES 
} from "@/lib/ai-credit-rates";
import { PROVIDER_CONFIGS } from "@/lib/ai-providers";

const sql = neon(process.env.DATABASE_URL!);

// POST - Seed all providers and models to database
export async function POST() {
  try {
    const results = {
      providersCreated: 0,
      modelsCreated: 0,
      errors: [] as string[],
    };

    // 1. Create providers
    const providers = Object.entries(PROVIDER_CONFIGS).map(([key, config]) => ({
      name: key,
      displayName: config.displayName,
      baseUrl: config.baseUrl,
      types: config.types,
    }));

    for (const provider of providers) {
      try {
        await sql`
          INSERT INTO ai_providers (name, slug, type, api_base_url, is_active)
          VALUES (${provider.displayName}, ${provider.name}, ${provider.types[0]}, ${provider.baseUrl}, true)
          ON CONFLICT (slug) DO UPDATE SET
            name = ${provider.displayName},
            api_base_url = ${provider.baseUrl},
            is_active = true
        `;
        results.providersCreated++;
      } catch (e: any) {
        results.errors.push(`Provider ${provider.name}: ${e.message}`);
      }
    }

    // Get provider IDs (using slug as key)
    const providerRows = await sql`SELECT id, slug FROM ai_providers`;
    const providerMap: Record<string, string> = {};
    providerRows.forEach((p) => {
      providerMap[p.slug] = p.id;
    });

    // 2. Create models - TEXT
    for (const [modelId, rate] of Object.entries(TEXT_MODEL_RATES)) {
      const providerId = providerMap[rate.provider];
      if (!providerId) continue;
      
      try {
        await sql`
          INSERT INTO ai_models (provider_id, model_id, name, type, credit_cost, is_active, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'text', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            name = ${rate.name},
            credit_cost = ${rate.credits},
            updated_at = NOW()
        `;
        results.modelsCreated++;
      } catch (e: any) {
        results.errors.push(`Model ${modelId}: ${e.message}`);
      }
    }

    // 3. Create models - IMAGE
    for (const [modelId, rate] of Object.entries(IMAGE_MODEL_RATES)) {
      const providerId = providerMap[rate.provider];
      if (!providerId) continue;
      
      try {
        await sql`
          INSERT INTO ai_models (provider_id, model_id, name, type, credit_cost, is_active, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'image', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            name = ${rate.name},
            credit_cost = ${rate.credits},
            updated_at = NOW()
        `;
        results.modelsCreated++;
      } catch (e: any) {
        results.errors.push(`Model ${modelId}: ${e.message}`);
      }
    }

    // 4. Create models - VIDEO
    for (const [modelId, rate] of Object.entries(VIDEO_MODEL_RATES)) {
      const providerId = providerMap[rate.provider];
      if (!providerId) continue;
      
      try {
        await sql`
          INSERT INTO ai_models (provider_id, model_id, name, type, credit_cost, is_active, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'video', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            name = ${rate.name},
            credit_cost = ${rate.credits},
            updated_at = NOW()
        `;
        results.modelsCreated++;
      } catch (e: any) {
        results.errors.push(`Model ${modelId}: ${e.message}`);
      }
    }

    // 5. Create models - AUDIO
    for (const [modelId, rate] of Object.entries(AUDIO_MODEL_RATES)) {
      const providerId = providerMap[rate.provider];
      if (!providerId) continue;
      
      try {
        await sql`
          INSERT INTO ai_models (provider_id, model_id, name, type, credit_cost, is_active, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'audio', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            name = ${rate.name},
            credit_cost = ${rate.credits},
            updated_at = NOW()
        `;
        results.modelsCreated++;
      } catch (e: any) {
        results.errors.push(`Model ${modelId}: ${e.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Seed completed",
      results,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: "Seed failed" },
      { status: 500 }
    );
  }
}

// GET - Get seed status / available models count
export async function GET() {
  try {
    const counts = await sql`
      SELECT 
        type as model_type,
        COUNT(*) as count,
        SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as enabled_count,
        SUM(CASE WHEN is_default THEN 1 ELSE 0 END) as default_count
      FROM ai_models
      GROUP BY type
    `;

    const providers = await sql`
      SELECT 
        p.slug as name,
        p.name as display_name,
        CASE WHEN pk.id IS NOT NULL THEN true ELSE false END as has_api_key,
        COUNT(m.id) as models_count
      FROM ai_providers p
      LEFT JOIN ai_models m ON m.provider_id = p.id
      LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
      GROUP BY p.id, p.slug, p.name, pk.id
    `;

    const expected = {
      text: Object.keys(TEXT_MODEL_RATES).length,
      image: Object.keys(IMAGE_MODEL_RATES).length,
      video: Object.keys(VIDEO_MODEL_RATES).length,
      audio: Object.keys(AUDIO_MODEL_RATES).length,
    };

    return NextResponse.json({
      success: true,
      counts: counts.reduce((acc: any, row) => {
        acc[row.model_type] = {
          total: Number(row.count),
          enabled: Number(row.enabled_count),
          hasDefault: Number(row.default_count) > 0,
          expected: expected[row.model_type as keyof typeof expected] || 0,
        };
        return acc;
      }, {}),
      providers: providers.map((p) => ({
        name: p.name,
        displayName: p.display_name,
        hasApiKey: p.has_api_key,
        modelsCount: Number(p.models_count),
      })),
      expected,
    });
  } catch (error) {
    console.error("Get seed status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get status" },
      { status: 500 }
    );
  }
}
