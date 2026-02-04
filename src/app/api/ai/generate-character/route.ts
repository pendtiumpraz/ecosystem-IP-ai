import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-providers";
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
    } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

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

    // Use callAI which reads active model from database (DeepSeek, etc)
    const result = await callAI("text", prompt, {
      tier: "creator",
      maxTokens: 2000,
      temperature: 0.8,
      systemPrompt: "You are a creative character designer for IP development. Always respond in valid JSON format.",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate character" },
        { status: 500 }
      );
    }

    // Parse JSON from response
    let character: Record<string, unknown> = {};
    try {
      const jsonMatch = result.result?.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        character = JSON.parse(jsonMatch[0]);
      }
    } catch {
      character = { raw: result.result };
    }

    return NextResponse.json({
      character,
      isNameOnly: generateNameOnly || !name,
      model: result.provider,
      creditCost: result.creditCost || 0,
    });
  } catch (error) {
    console.error("Character generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate character: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
