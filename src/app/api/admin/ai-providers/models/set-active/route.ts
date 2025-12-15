import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Set a model as the active/default for its type
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { modelId, modelType } = body;

    if (!modelId || !modelType) {
      return NextResponse.json(
        { success: false, error: "modelId and modelType required" },
        { status: 400 }
      );
    }

    // Verify model exists and get its info
    const model = await sql`
      SELECT 
        m.*, 
        p.name as provider_name,
        p.is_active as provider_active,
        (SELECT encrypted_key FROM platform_api_keys WHERE provider_id = p.id AND is_active = TRUE LIMIT 1) as api_key
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.id = ${modelId}
    `;

    if (model.length === 0) {
      return NextResponse.json(
        { success: false, error: "Model not found" },
        { status: 404 }
      );
    }

    // Check if provider has API key (skip for FREE models like Routeway)
    const isFreeModel = model[0].credit_cost === 0;
    if (!model[0].api_key && !isFreeModel) {
      return NextResponse.json(
        { success: false, error: `Provider ${model[0].provider_name} belum punya API key. Set API key dulu.` },
        { status: 400 }
      );
    }

    // Check if provider is active
    if (!model[0].provider_active) {
      return NextResponse.json(
        { success: false, error: `Provider ${model[0].provider_name} disabled. Enable provider dulu.` },
        { status: 400 }
      );
    }

    // Unset default for ALL models of the same type
    await sql`
      UPDATE ai_models 
      SET is_default = FALSE, updated_at = NOW()
      WHERE type = ${modelType}
    `;

    // Set this model as default
    await sql`
      UPDATE ai_models 
      SET is_default = TRUE, is_active = TRUE, updated_at = NOW()
      WHERE id = ${modelId}
    `;

    return NextResponse.json({
      success: true,
      message: `${model[0].name} is now the active ${modelType} model`,
      activeModel: {
        id: model[0].id,
        modelId: model[0].model_id,
        name: model[0].name,
        type: model[0].type,
        providerName: model[0].provider_name,
        creditCost: model[0].credit_cost,
      },
    });
  } catch (error) {
    console.error("Set active model error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to set active model" },
      { status: 500 }
    );
  }
}

// GET - Get current active/default models for each type
export async function GET() {
  try {
    const activeModels = await sql`
      SELECT 
        m.*,
        p.name as provider_name
      FROM ai_models m
      JOIN ai_providers p ON m.provider_id = p.id
      WHERE m.is_default = TRUE AND m.is_active = TRUE
      ORDER BY m.type
    `;

    const result: Record<string, any> = {
      text: null,
      image: null,
      video: null,
      audio: null,
      multimodal: null,
    };

    activeModels.forEach((m) => {
      if (m.type in result) {
        result[m.type] = {
          id: m.id,
          modelId: m.model_id,
          name: m.name,
          providerName: m.provider_name,
          creditCost: m.credit_cost,
        };
      }
    });

    return NextResponse.json({
      success: true,
      activeModels: result,
    });
  } catch (error) {
    console.error("Get active models error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get active models" },
      { status: 500 }
    );
  }
}
