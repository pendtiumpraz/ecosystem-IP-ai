import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { CHARACTER_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, role, context, modelId } = body;

    if (!name || !role) {
      return NextResponse.json(
        { error: "Name and role are required" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.character) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    const prompt = CHARACTER_PROMPT
      .replace("{name}", name)
      .replace("{role}", role)
      .replace("{context}", context || "A dramatic story");

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 2000,
      temperature: 0.8,
    });

    // Parse JSON from response
    let characterProfile: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        characterProfile = JSON.parse(jsonMatch[0]);
      }
    } catch {
      characterProfile = { raw: text };
    }

    return NextResponse.json({
      character: characterProfile,
      model: selectedModel,
      creditCost,
    });
  } catch (error) {
    console.error("Character generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate character" },
      { status: 500 }
    );
  }
}
