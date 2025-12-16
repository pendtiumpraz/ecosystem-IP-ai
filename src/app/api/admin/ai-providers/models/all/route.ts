import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List ALL models across ALL providers with provider info
export async function GET() {
  try {
    const models = await sql`
      SELECT 
        m.*,
        p.slug as provider_slug,
        p.name as provider_name,
        p.api_base_url as provider_base_url,
        p.is_active as provider_enabled,
        CASE WHEN pk.id IS NOT NULL THEN true ELSE false END as has_api_key
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      LEFT JOIN platform_api_keys pk ON pk.provider_id = p.id AND pk.is_active = TRUE
      ORDER BY m.type, m.is_default DESC, m.name
    `;

    return NextResponse.json({
      success: true,
      models: models.map((m) => ({
        id: m.id,
        providerId: m.provider_id,
        providerName: m.provider_name,
        providerSlug: m.provider_slug,
        providerEnabled: m.provider_enabled,
        hasApiKey: m.has_api_key,
        modelId: m.model_id,
        displayName: m.name,
        modelType: m.type,
        creditCostPerUse: m.credit_cost,
        isEnabled: m.is_active,
        isDefault: m.is_default,
        createdAt: m.created_at,
      })),
    });
  } catch (error) {
    console.error("List all models error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
