import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { MOODBOARD_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { beat, description, genre, style = "cinematic", modelId } = body;

    if (!beat || !description) {
      return NextResponse.json(
        { error: "Beat and description are required" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.general) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    const prompt = MOODBOARD_PROMPT
      .replace("{beat}", beat)
      .replace("{description}", description)
      .replace("{genre}", genre || "Drama")
      .replace("{style}", style);

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 500,
      temperature: 0.8,
    });

    return NextResponse.json({
      imagePrompt: text.trim(),
      model: selectedModel,
      creditCost,
    });
  } catch (error) {
    console.error("Moodboard prompt generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate moodboard prompt" },
      { status: 500 }
    );
  }
}
