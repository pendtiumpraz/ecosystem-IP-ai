/**
 * AI Generation Queue System
 * Priority-based queue using Upstash Redis
 * 
 * Priority Levels (higher = processed first):
 * - Enterprise: 100
 * - Studio: 75
 * - Creator: 50
 * - Trial: 25
 */

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL?.replace("rediss://", "https://").replace(":6379", "") || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.REDIS_URL?.split(":")[2]?.split("@")[0] || "",
});

// Queue keys
const QUEUE_KEY = "ai:generation:queue";
const PROCESSING_KEY = "ai:generation:processing";
const RESULTS_KEY = "ai:generation:results";

// Priority scores (higher = processed first)
export const TIER_PRIORITIES: Record<string, number> = {
  enterprise: 100,
  studio: 75,
  creator: 50,
  trial: 25,
};

// Concurrent processing limits per tier
export const TIER_CONCURRENCY: Record<string, number> = {
  enterprise: 10, // Can process 10 at once
  studio: 5,
  creator: 3,
  trial: 1, // Only 1 at a time
};

export interface QueueItem {
  id: string;
  userId: string;
  userTier: string;
  generationType: string;
  projectId?: string;
  projectName?: string;
  prompt: string;
  inputParams?: Record<string, any>;
  priority: number;
  createdAt: number;
  status: "queued" | "processing" | "completed" | "failed";
}

export interface QueueStatus {
  queueId: string;
  position: number;
  totalInQueue: number;
  estimatedWaitSeconds: number;
  status: "queued" | "processing" | "completed" | "failed";
  result?: any;
  error?: string;
}

/**
 * Add generation request to queue
 */
export async function addToQueue(
  userId: string,
  userTier: string,
  generationType: string,
  prompt: string,
  options: {
    projectId?: string;
    projectName?: string;
    inputParams?: Record<string, any>;
  } = {}
): Promise<{ queueId: string; position: number; totalInQueue: number }> {
  const queueId = `gen_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const priority = TIER_PRIORITIES[userTier] || TIER_PRIORITIES.trial;
  
  // Create queue item
  const item: QueueItem = {
    id: queueId,
    userId,
    userTier,
    generationType,
    projectId: options.projectId,
    projectName: options.projectName,
    prompt,
    inputParams: options.inputParams,
    priority,
    createdAt: Date.now(),
    status: "queued",
  };
  
  // Calculate score: priority * 1e12 - timestamp (so higher priority + earlier time = higher score)
  const score = priority * 1e12 - item.createdAt;
  
  // Add to sorted set (higher score = processed first)
  await redis.zadd(QUEUE_KEY, { score, member: JSON.stringify(item) });
  
  // Store item data separately for quick lookup
  await redis.hset(`${RESULTS_KEY}:${queueId}`, {
    status: "queued",
    item: JSON.stringify(item),
  });
  
  // Get position in queue
  const position = await getQueuePosition(queueId);
  const totalInQueue = await redis.zcard(QUEUE_KEY);
  
  return { queueId, position, totalInQueue: totalInQueue || 0 };
}

/**
 * Get queue position for a specific item
 */
export async function getQueuePosition(queueId: string): Promise<number> {
  // Get all items in queue (sorted by score descending = highest priority first)
  const allItems = await redis.zrange(QUEUE_KEY, 0, -1, { rev: true }) as string[];
  
  for (let i = 0; i < allItems.length; i++) {
    try {
      const rawItem = allItems[i];
      const item = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      if (item.id === queueId) {
        return i + 1; // 1-indexed position
      }
    } catch (e) {
      continue;
    }
  }
  
  return 0; // Not found in queue (might be processing or completed)
}

/**
 * Get queue status for a specific request
 */
export async function getQueueStatus(queueId: string): Promise<QueueStatus | null> {
  // Check results/status store
  const stored = await redis.hgetall(`${RESULTS_KEY}:${queueId}`);
  
  if (!stored || Object.keys(stored).length === 0) {
    return null;
  }
  
  const status = stored.status as string;
  const position = status === "queued" ? await getQueuePosition(queueId) : 0;
  const totalInQueue = await redis.zcard(QUEUE_KEY);
  
  // Estimate wait time: ~30 seconds per item for trial, less for higher tiers
  const estimatedWaitSeconds = position * 30;
  
  const result: QueueStatus = {
    queueId,
    position,
    totalInQueue: totalInQueue || 0,
    estimatedWaitSeconds,
    status: status as QueueStatus["status"],
  };
  
  if (status === "completed" && stored.result) {
    result.result = typeof stored.result === 'string' ? JSON.parse(stored.result) : stored.result;
  }
  
  if (status === "failed" && stored.error) {
    result.error = stored.error as string;
  }
  
  return result;
}

/**
 * Get next items to process from queue
 * Respects concurrency limits per tier
 */
export async function getNextToProcess(limit: number = 5): Promise<QueueItem[]> {
  // Get items sorted by priority (highest first)
  const items = await redis.zrange(QUEUE_KEY, 0, limit - 1, { rev: true }) as string[];
  
  const toProcess: QueueItem[] = [];
  
  for (const rawItem of items) {
    try {
      const item: QueueItem = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      
      // Check if user already has max concurrent processing
      const userProcessing = await redis.scard(`${PROCESSING_KEY}:user:${item.userId}`);
      const maxConcurrent = TIER_CONCURRENCY[item.userTier] || 1;
      
      if ((userProcessing || 0) < maxConcurrent) {
        toProcess.push(item);
      }
    } catch (e) {
      continue;
    }
  }
  
  return toProcess;
}

/**
 * Mark item as processing
 */
export async function markProcessing(queueId: string, item: QueueItem): Promise<void> {
  // Remove from queue
  await redis.zrem(QUEUE_KEY, JSON.stringify(item));
  
  // Add to processing set
  await redis.sadd(`${PROCESSING_KEY}:user:${item.userId}`, queueId);
  await redis.sadd(PROCESSING_KEY, queueId);
  
  // Update status
  await redis.hset(`${RESULTS_KEY}:${queueId}`, {
    status: "processing",
  });
}

/**
 * Mark item as completed
 */
export async function markCompleted(queueId: string, userId: string, result: any): Promise<void> {
  // Remove from processing
  await redis.srem(`${PROCESSING_KEY}:user:${userId}`, queueId);
  await redis.srem(PROCESSING_KEY, queueId);
  
  // Update status with result
  await redis.hset(`${RESULTS_KEY}:${queueId}`, {
    status: "completed",
    result: JSON.stringify(result),
    completedAt: Date.now().toString(),
  });
  
  // Set expiry for results (24 hours)
  await redis.expire(`${RESULTS_KEY}:${queueId}`, 86400);
}

/**
 * Mark item as failed
 */
export async function markFailed(queueId: string, userId: string, error: string): Promise<void> {
  // Remove from processing
  await redis.srem(`${PROCESSING_KEY}:user:${userId}`, queueId);
  await redis.srem(PROCESSING_KEY, queueId);
  
  // Update status with error
  await redis.hset(`${RESULTS_KEY}:${queueId}`, {
    status: "failed",
    error,
    failedAt: Date.now().toString(),
  });
  
  // Set expiry (24 hours)
  await redis.expire(`${RESULTS_KEY}:${queueId}`, 86400);
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  totalQueued: number;
  totalProcessing: number;
  queueByTier: Record<string, number>;
}> {
  const totalQueued = await redis.zcard(QUEUE_KEY) || 0;
  const totalProcessing = await redis.scard(PROCESSING_KEY) || 0;
  
  // Count by tier
  const allItems = await redis.zrange(QUEUE_KEY, 0, -1) as string[];
  const queueByTier: Record<string, number> = {
    enterprise: 0,
    studio: 0,
    creator: 0,
    trial: 0,
  };
  
  for (const rawItem of allItems) {
    try {
      const item: QueueItem = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      queueByTier[item.userTier] = (queueByTier[item.userTier] || 0) + 1;
    } catch (e) {
      continue;
    }
  }
  
  return { totalQueued, totalProcessing, queueByTier };
}

/**
 * Clean up old/stale items
 */
export async function cleanupStaleItems(maxAgeMs: number = 3600000): Promise<number> {
  const now = Date.now();
  const allItems = await redis.zrange(QUEUE_KEY, 0, -1) as string[];
  let removed = 0;
  
  for (const rawItem of allItems) {
    try {
      const item: QueueItem = typeof rawItem === 'string' ? JSON.parse(rawItem) : rawItem;
      if (now - item.createdAt > maxAgeMs) {
        await redis.zrem(QUEUE_KEY, JSON.stringify(item));
        await markFailed(item.id, item.userId, "Request timed out in queue");
        removed++;
      }
    } catch (e) {
      continue;
    }
  }
  
  return removed;
}
