import { NextResponse } from "next/server";
import { generateWithAI, getGenerationHistory, CREDIT_COSTS } from "@/lib/ai-generation";

// POST - Generate content with AI
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      userId, 
      projectId, 
      projectName,
      generationType, 
      prompt, 
      inputParams,
      modelId,
      modelProvider 
    } = body;

    if (!userId || !generationType || !prompt) {
      return NextResponse.json(
        { success: false, error: "userId, generationType, and prompt are required" },
        { status: 400 }
      );
    }

    // Validate generation type
    if (!CREDIT_COSTS[generationType]) {
      return NextResponse.json(
        { success: false, error: `Invalid generation type: ${generationType}` },
        { status: 400 }
      );
    }

    // Generate
    const result = await generateWithAI({
      userId,
      projectId,
      projectName,
      generationType,
      prompt,
      inputParams,
      modelId,
      modelProvider,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      generationId: result.generationId,
      result: result.resultText || result.resultUrl,
      resultType: result.resultUrl ? "url" : "text",
      creditCost: result.creditCost,
    });
  } catch (error: any) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Generation failed" },
      { status: 500 }
    );
  }
}

// GET - Get generation history
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const projectId = searchParams.get("projectId");
    const generationType = searchParams.get("generationType");
    const accepted = searchParams.get("accepted");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId required" },
        { status: 400 }
      );
    }

    const history = await getGenerationHistory(
      userId,
      projectId || undefined,
      generationType || undefined,
      limit,
      accepted === "true"
    );

    return NextResponse.json({
      success: true,
      generations: history,
    });
  } catch (error: any) {
    console.error("Get generation history error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to get history" },
      { status: 500 }
    );
  }
}
