import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { WANT_NEED_MATRIX_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { synopsis, character, modelId } = body;

    if (!synopsis) {
      return NextResponse.json(
        { error: "Synopsis is required" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.general) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    const prompt = WANT_NEED_MATRIX_PROMPT
      .replace("{synopsis}", synopsis)
      .replace("{character}", character || "the protagonist");

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    // Parse JSON from response
    let wantNeedMatrix: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        wantNeedMatrix = JSON.parse(jsonMatch[0]);
      }
    } catch {
      wantNeedMatrix = { raw: text };
    }

    return NextResponse.json({
      wantNeedMatrix,
      model: selectedModel,
      creditCost,
    });
  } catch (error) {
    console.error("Want/Need generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate Want/Need matrix" },
      { status: 500 }
    );
  }
}
