/**
 * AI Generation Queue API
 * POST - Add to queue
 * GET - Get queue status
 */

import { NextResponse } from "next/server";
import { 
  addToQueue, 
  getQueueStatus, 
  getQueueStats,
  TIER_PRIORITIES 
} from "@/lib/ai-queue";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// POST - Add generation request to queue
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, generationType, prompt, projectId, projectName, inputParams } = body;
    
    if (!userId || !generationType || !prompt) {
      return NextResponse.json(
        { success: false, error: "userId, generationType, and prompt are required" },
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
    const creditBalance = userResult[0].credit_balance || 0;
    
    // Check minimum credits (basic check, detailed check happens during processing)
    if (creditBalance < 1 && userTier !== "enterprise") {
      return NextResponse.json(
        { success: false, error: "Insufficient credits" },
        { status: 402 }
      );
    }
    
    // Add to queue
    const result = await addToQueue(userId, userTier, generationType, prompt, {
      projectId,
      projectName,
      inputParams,
    });
    
    // Calculate estimated wait time based on position and tier
    const avgProcessTime = userTier === "trial" ? 35 : userTier === "creator" ? 10 : 5;
    const estimatedWaitSeconds = result.position * avgProcessTime;
    
    return NextResponse.json({
      success: true,
      queueId: result.queueId,
      position: result.position,
      totalInQueue: result.totalInQueue,
      estimatedWaitSeconds,
      priority: TIER_PRIORITIES[userTier],
      message: result.position === 1 
        ? "You're next! Processing will start shortly."
        : `You are #${result.position} in queue. Higher tier = faster processing.`,
    });
  } catch (error) {
    console.error("Queue add error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add to queue" },
      { status: 500 }
    );
  }
}

// GET - Get queue status or stats
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queueId = searchParams.get("queueId");
    const statsOnly = searchParams.get("stats");
    
    // Return queue stats
    if (statsOnly === "true") {
      const stats = await getQueueStats();
      return NextResponse.json({ success: true, stats });
    }
    
    // Return specific queue item status
    if (queueId) {
      const status = await getQueueStatus(queueId);
      
      if (!status) {
        return NextResponse.json(
          { success: false, error: "Queue item not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, ...status });
    }
    
    return NextResponse.json(
      { success: false, error: "queueId or stats parameter required" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Queue status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get queue status" },
      { status: 500 }
    );
  }
}
