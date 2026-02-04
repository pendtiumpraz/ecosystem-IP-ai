import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from "@/lib/ai/providers";
import { CHARACTER_DETAILS_PROMPT, CHARACTER_NAME_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      role,
      projectTitle,
      projectDescription,
      projectGenre,
      projectTheme,
      projectTone,
      existingCharacters,
      generateNameOnly,
      modelId
    } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const selectedModel = (modelId || DEFAULT_MODELS.character) as TextModelId;
    const model = getTextModel(selectedModel);
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    let prompt: string;

    // If generateNameOnly OR no name provided, generate name first
    if (generateNameOnly || !name) {
      prompt = CHARACTER_NAME_PROMPT
        .replace("{projectTitle}", projectTitle || "Untitled Project")
        .replace("{projectDescription}", projectDescription || "No description")
        .replace("{projectGenre}", projectGenre || "Drama")
        .replace("{projectTheme}", projectTheme || "Not specified")
        .replace("{projectTone}", projectTone || "Not specified")
        .replace("{role}", role)
        .replace("{existingCharacters}", existingCharacters || "None");
    } else {
      // Generate details (name already provided)
      prompt = CHARACTER_DETAILS_PROMPT
        .replace("{projectTitle}", projectTitle || "Untitled Project")
        .replace("{projectDescription}", projectDescription || "No description")
        .replace("{projectGenre}", projectGenre || "Drama")
        .replace("{projectTheme}", projectTheme || "Not specified")
        .replace("{projectTone}", projectTone || "Not specified")
        .replace("{name}", name)
        .replace("{role}", role)
        .replace("{existingCharacters}", existingCharacters || "None");
    }

    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 2000,
      temperature: 0.8,
    });

    // Parse JSON from response
    let result: Record<string, unknown> = {};
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    } catch {
      result = { raw: text };
    }

    return NextResponse.json({
      character: result,
      isNameOnly: generateNameOnly || !name,
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
