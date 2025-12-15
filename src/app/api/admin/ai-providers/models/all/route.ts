import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List ALL models across ALL providers with provider info
export async function GET() {
  try {
    const models = await sql`
      SELECT 
        m.*,
        p.name as provider_name,
        p.display_name as provider_display_name,
        p.base_url as provider_base_url,
        p.is_enabled as provider_enabled,
        CASE WHEN p.api_key IS NOT NULL AND p.api_key != '' THEN true ELSE false END as has_api_key
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      ORDER BY m.model_type, m.is_default DESC, m.display_name
    `;

    return NextResponse.json({
      success: true,
      models: models.map((m) => ({
        id: m.id,
        providerId: m.provider_id,
        providerName: m.provider_display_name || m.provider_name,
        providerSlug: m.provider_name,
        providerEnabled: m.provider_enabled,
        hasApiKey: m.has_api_key,
        modelId: m.model_id,
        displayName: m.display_name,
        modelType: m.model_type,
        creditCostPerUse: m.credit_cost_per_use,
        isEnabled: m.is_enabled,
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
