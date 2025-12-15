import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { STRUCTURE_PROMPTS } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { synopsis, structure = "hero", modelId } = body;

    if (!synopsis) {
      return NextResponse.json(
        { error: "Synopsis is required" },
        { status: 400 }
      );
    }

    const validStructures = ["hero", "cat", "harmon"] as const;
    if (!validStructures.includes(structure)) {
      return NextResponse.json(
        { error: "Invalid structure type" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.structure) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    const promptTemplate = STRUCTURE_PROMPTS[structure as keyof typeof STRUCTURE_PROMPTS];
    const prompt = promptTemplate.replace("{synopsis}", synopsis);

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Parse JSON from response
    let structureBeats: Record<string, string> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        structureBeats = JSON.parse(jsonMatch[0]);
      }
    } catch {
      // If JSON parsing fails, return raw text
      structureBeats = { raw: text };
    }

    return NextResponse.json({
      structureBeats,
      structureType: structure,
      model: selectedModel,
      creditCost,
    });
  } catch (error) {
    console.error("Structure generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate structure" },
      { status: 500 }
    );
  }
}
