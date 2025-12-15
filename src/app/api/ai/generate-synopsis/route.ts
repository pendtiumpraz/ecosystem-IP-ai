import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { SYNOPSIS_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { premise, genre, format, modelId } = body;

    if (!premise) {
      return NextResponse.json(
        { error: "Premise is required" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.synopsis) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    // TODO: Check user credits before generation
    // TODO: Deduct credits after successful generation

    const prompt = SYNOPSIS_PROMPT
      .replace("{premise}", premise)
      .replace("{genre}", genre || "Drama")
      .replace("{format}", format || "Feature Film");

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1000,
      temperature: 0.7,
    });

    return NextResponse.json({
      synopsis: text,
      model: selectedModel,
      creditCost,
    });
  } catch (error) {
    console.error("Synopsis generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate synopsis" },
      { status: 500 }
    );
  }
}
