/**
 * Queue Processor API
 * POST - Process next items in queue
 * Can be called by Vercel Cron or manually
 */

import { NextResponse } from "next/server";
import { 
  getNextToProcess, 
  markProcessing, 
  markCompleted, 
  markFailed,
  cleanupStaleItems,
  getQueueStats
} from "@/lib/ai-queue";
import { generateWithAI } from "@/lib/ai-generation";

// Vercel Cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET || "cron-secret-key";

// POST - Process queue items
export async function POST(request: Request) {
  try {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get("authorization");
    const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || 
                         process.env.NODE_ENV === "development";
    
    if (!isAuthorized) {
      // Allow without auth for now, but log warning
      console.warn("Queue processor called without auth");
    }
    
    const body = await request.json().catch(() => ({}));
    const batchSize = body.batchSize || 5;
    
    // Clean up stale items first (older than 1 hour)
    const staleRemoved = await cleanupStaleItems(3600000);
    if (staleRemoved > 0) {
      console.log(`[Queue] Cleaned up ${staleRemoved} stale items`);
    }
    
    // Get next items to process
    const items = await getNextToProcess(batchSize);
    
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No items to process",
        processed: 0,
      });
    }
    
    console.log(`[Queue] Processing ${items.length} items`);
    
    const results: Array<{ queueId: string; success: boolean; error?: string }> = [];
    
    // Process items in parallel (respecting concurrency limits already checked)
    await Promise.all(items.map(async (item) => {
      try {
        // Mark as processing
        await markProcessing(item.id, item);
        
        console.log(`[Queue] Processing ${item.id} for user ${item.userId} (${item.userTier})`);
        
        // Call the actual AI generation
        const result = await generateWithAI({
          userId: item.userId,
          projectId: item.projectId,
          projectName: item.projectName,
          generationType: item.generationType,
          prompt: item.prompt,
          inputParams: item.inputParams,
        });
        
        if (result.success) {
          await markCompleted(item.id, item.userId, result);
          results.push({ queueId: item.id, success: true });
          console.log(`[Queue] Completed ${item.id}`);
        } else {
          await markFailed(item.id, item.userId, result.error || "Generation failed");
          results.push({ queueId: item.id, success: false, error: result.error });
          console.log(`[Queue] Failed ${item.id}: ${result.error}`);
        }
      } catch (error: any) {
        await markFailed(item.id, item.userId, error.message || "Processing error");
        results.push({ queueId: item.id, success: false, error: error.message });
        console.error(`[Queue] Error processing ${item.id}:`, error);
      }
    }));
    
    const stats = await getQueueStats();
    
    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
      queueStats: stats,
    });
  } catch (error) {
    console.error("Queue processor error:", error);
    return NextResponse.json(
      { success: false, error: "Queue processing failed" },
      { status: 500 }
    );
  }
}

// GET - Get processor status (for monitoring)
export async function GET() {
  try {
    const stats = await getQueueStats();
    
    return NextResponse.json({
      success: true,
      stats,
      message: stats.totalQueued > 0 
        ? `${stats.totalQueued} items waiting, ${stats.totalProcessing} processing`
        : "Queue is empty",
    });
  } catch (error) {
    console.error("Queue stats error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get queue stats" },
      { status: 500 }
    );
  }
}
