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
          INSERT INTO ai_providers (name, display_name, base_url, provider_type, is_enabled)
          VALUES (${provider.name}, ${provider.displayName}, ${provider.baseUrl}, ${provider.types[0]}, true)
          ON CONFLICT (name) DO UPDATE SET
            display_name = ${provider.displayName},
            base_url = ${provider.baseUrl},
            updated_at = NOW()
        `;
        results.providersCreated++;
      } catch (e: any) {
        results.errors.push(`Provider ${provider.name}: ${e.message}`);
      }
    }

    // Get provider IDs
    const providerRows = await sql`SELECT id, name FROM ai_providers`;
    const providerMap: Record<string, string> = {};
    providerRows.forEach((p) => {
      providerMap[p.name] = p.id;
    });

    // 2. Create models - TEXT
    for (const [modelId, rate] of Object.entries(TEXT_MODEL_RATES)) {
      const providerId = providerMap[rate.provider];
      if (!providerId) continue;
      
      try {
        await sql`
          INSERT INTO ai_models (provider_id, model_id, display_name, model_type, credit_cost_per_use, is_enabled, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'text', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            display_name = ${rate.name},
            credit_cost_per_use = ${rate.credits},
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
          INSERT INTO ai_models (provider_id, model_id, display_name, model_type, credit_cost_per_use, is_enabled, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'image', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            display_name = ${rate.name},
            credit_cost_per_use = ${rate.credits},
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
          INSERT INTO ai_models (provider_id, model_id, display_name, model_type, credit_cost_per_use, is_enabled, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'video', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            display_name = ${rate.name},
            credit_cost_per_use = ${rate.credits},
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
          INSERT INTO ai_models (provider_id, model_id, display_name, model_type, credit_cost_per_use, is_enabled, is_default)
          VALUES (${providerId}, ${modelId}, ${rate.name}, 'audio', ${rate.credits}, true, false)
          ON CONFLICT (provider_id, model_id) DO UPDATE SET
            display_name = ${rate.name},
            credit_cost_per_use = ${rate.credits},
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
        model_type,
        COUNT(*) as count,
        SUM(CASE WHEN is_enabled THEN 1 ELSE 0 END) as enabled_count,
        SUM(CASE WHEN is_default THEN 1 ELSE 0 END) as default_count
      FROM ai_models
      GROUP BY model_type
    `;

    const providers = await sql`
      SELECT 
        p.name,
        p.display_name,
        CASE WHEN p.api_key IS NOT NULL AND p.api_key != '' THEN true ELSE false END as has_api_key,
        COUNT(m.id) as models_count
      FROM ai_providers p
      LEFT JOIN ai_models m ON m.provider_id = p.id
      GROUP BY p.id, p.name, p.display_name, p.api_key
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
