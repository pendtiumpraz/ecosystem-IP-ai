import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { STRUCTURE_PROMPTS } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { synopsis, structure = "hero", modelId, customBeats } = body;

    if (!synopsis) {
      return NextResponse.json(
        { error: "Synopsis is required" },
        { status: 400 }
      );
    }

    const validStructures = ["hero", "cat", "harmon", "threeAct", "freytag", "custom"] as const;
    if (!validStructures.includes(structure)) {
      return NextResponse.json(
        { error: "Invalid structure type. Valid types: hero, cat, harmon, threeAct, freytag, custom" },
        { status: 400 }
      );
    }

    // Custom structure requires customBeats
    if (structure === "custom" && (!customBeats || customBeats.length === 0)) {
      return NextResponse.json(
        { error: "customBeats array is required for custom structure" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.structure) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    const promptTemplate = STRUCTURE_PROMPTS[structure as keyof typeof STRUCTURE_PROMPTS];
    let prompt = promptTemplate.replace("{synopsis}", synopsis);

    // For custom structure, inject the beat definitions
    if (structure === "custom" && customBeats) {
      const beatsDescription = customBeats.map((b: any, i: number) =>
        `${i + 1}. ${b.label} (Act ${b.act}) - ${b.desc || 'Description not provided'} [key: ${b.key}]`
      ).join('\n');
      prompt = prompt.replace("{customBeats}", beatsDescription);
    }

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
