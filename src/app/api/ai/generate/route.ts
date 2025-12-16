import { NextResponse } from "next/server";
import { generateWithAI, getGenerationHistory, CREDIT_COSTS } from "@/lib/ai-generation";
import { addToQueue, getQueueStatus, TIER_PRIORITIES } from "@/lib/ai-queue";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// Tiers that use queue system (trial always queued, others can choose)
const QUEUE_TIERS = ["trial"];

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
      modelProvider,
      useQueue // Force queue mode (optional)
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

    // Get user tier
    const userResult = await sql`
      SELECT subscription_tier, credit_balance FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;
    
    if (userResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }
    
    const userTier = userResult[0].subscription_tier || "trial";
    
    // Trial tier always uses queue system
    // Other tiers process directly (faster)
    const shouldQueue = QUEUE_TIERS.includes(userTier) || useQueue === true;
    
    if (shouldQueue) {
      // Add to queue and return queue info
      const queueResult = await addToQueue(userId, userTier, generationType, prompt, {
        projectId,
        projectName,
        inputParams,
      });
      
      // Calculate estimated wait
      const avgProcessTime = 35; // ~35 seconds per trial generation
      const estimatedWaitSeconds = queueResult.position * avgProcessTime;
      
      return NextResponse.json({
        success: true,
        queued: true,
        queueId: queueResult.queueId,
        position: queueResult.position,
        totalInQueue: queueResult.totalInQueue,
        estimatedWaitSeconds,
        priority: TIER_PRIORITIES[userTier],
        message: queueResult.position === 1 
          ? "You're next! Processing will start shortly."
          : `You are #${queueResult.position} in queue. Upgrade for instant processing!`,
      });
    }
    
    // Direct processing for paid tiers
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
      queued: false,
      generationId: result.generationId,
      resultText: result.resultText,
      resultUrl: result.resultUrl,
      result: result.resultText || result.resultUrl, // backwards compat
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
