/**
 * AI Generation Service
 * - Manages credit deduction
 * - Calls AI APIs via unified provider system
 * - Saves results to database
 * - Uploads media to Google Drive
 */

import { neon } from "@neondatabase/serverless";
import { 
  getOrCreateModoFolder, 
  getOrCreateProjectFolder, 
  uploadImageFromUrl,
  refreshAccessToken,
  getDirectUrl 
} from "./google-drive";
import { callAI, getActiveModelForTier, TIER_DELAYS, type SubscriptionTier } from "./ai-providers";

const sql = neon(process.env.DATABASE_URL!);

// Generation type to AI type mapping
const GENERATION_TYPE_MAP: Record<string, "text" | "image" | "video" | "audio"> = {
  synopsis: "text",
  story_structure: "text",
  character_profile: "text",
  character_backstory: "text",
  character_dialogue: "text",
  universe: "text",
  world_building: "text",
  moodboard_prompt: "text",
  script: "text",
  dialogue: "text",
  // Image types
  character_image: "image",
  moodboard_image: "image",
  concept_art: "image",
  poster: "image",
  // Video types
  animation_preview: "video",
  video: "video",
  trailer: "video",
  // Audio types
  voice: "audio",
  voiceover: "audio",
  music: "audio",
  soundtrack: "audio",
};

// Fallback credit costs (used if no active model configured)
export const CREDIT_COSTS: Record<string, number> = {
  synopsis: 3,
  story_structure: 10,
  character_profile: 8,
  character_image: 12,
  universe: 10,
  moodboard_prompt: 3,
  moodboard_image: 12,
  script: 25,
  animation_preview: 50,
  video: 100,
  voice: 20,
  music: 30,
};

export interface GenerationRequest {
  userId: string;
  projectId?: string;
  projectName?: string;
  generationType: string;
  prompt: string;
  inputParams?: Record<string, any>;
  modelId?: string;
  modelProvider?: string;
}

export interface GenerationResult {
  success: boolean;
  generationId: string;
  resultText?: string;
  resultUrl?: string;
  creditCost: number;
  error?: string;
}

/**
 * Check if user has enough credits
 */
export async function checkCredits(userId: string, cost: number): Promise<boolean> {
  const result = await sql`
    SELECT credit_balance FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  
  if (result.length === 0) return false;
  return result[0].credit_balance >= cost;
}

/**
 * Deduct credits and create transaction
 */
export async function deductCredits(
  userId: string, 
  amount: number, 
  referenceType: string,
  referenceId: string,
  description: string
): Promise<number> {
  // Update balance and get new balance
  const result = await sql`
    UPDATE users 
    SET credit_balance = credit_balance - ${amount}, updated_at = NOW()
    WHERE id = ${userId} AND deleted_at IS NULL
    RETURNING credit_balance
  `;
  
  const newBalance = result[0]?.credit_balance || 0;
  
  // Create transaction record
  await sql`
    INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
    VALUES (${userId}, 'debit', ${-amount}, ${newBalance}, ${referenceType}, ${referenceId}, ${description})
  `;
  
  return newBalance;
}

/**
 * Refund credits (if generation fails)
 */
export async function refundCredits(
  userId: string,
  amount: number,
  referenceId: string,
  reason: string
): Promise<void> {
  const result = await sql`
    UPDATE users 
    SET credit_balance = credit_balance + ${amount}, updated_at = NOW()
    WHERE id = ${userId} AND deleted_at IS NULL
    RETURNING credit_balance
  `;
  
  const newBalance = result[0]?.credit_balance || 0;
  
  await sql`
    INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
    VALUES (${userId}, 'refund', ${amount}, ${newBalance}, 'generation', ${referenceId}, ${reason})
  `;
}

/**
 * Get user's Google Drive access token (refresh if needed)
 */
async function getGoogleAccessToken(userId: string): Promise<string | null> {
  const tokens = await sql`
    SELECT * FROM user_google_tokens WHERE user_id = ${userId}
  `;
  
  if (tokens.length === 0) return null;
  
  const token = tokens[0];
  
  // Check if token is expired
  if (new Date(token.expires_at) <= new Date()) {
    if (!token.refresh_token) return null;
    
    try {
      const newTokens = await refreshAccessToken(token.refresh_token);
      
      // Update in database
      await sql`
        UPDATE user_google_tokens 
        SET access_token = ${newTokens.accessToken}, 
            expires_at = ${new Date(newTokens.expiresAt).toISOString()},
            updated_at = NOW()
        WHERE user_id = ${userId}
      `;
      
      return newTokens.accessToken;
    } catch (e) {
      console.error("Failed to refresh Google token:", e);
      return null;
    }
  }
  
  return token.access_token;
}

/**
 * Upload generated image to Google Drive
 */
async function uploadToGoogleDrive(
  userId: string,
  imageUrl: string,
  fileName: string,
  projectName?: string
): Promise<{ driveId: string; url: string } | null> {
  const accessToken = await getGoogleAccessToken(userId);
  if (!accessToken) return null;
  
  try {
    // Get or create MODO folder
    const modoFolderId = await getOrCreateModoFolder(accessToken);
    
    // Get or create project folder if project name provided
    let targetFolderId = modoFolderId;
    if (projectName) {
      targetFolderId = await getOrCreateProjectFolder(accessToken, modoFolderId, projectName);
    }
    
    // Upload file
    const file = await uploadImageFromUrl(accessToken, targetFolderId, imageUrl, fileName);
    
    return {
      driveId: file.id,
      url: getDirectUrl(file.id),
    };
  } catch (e) {
    console.error("Failed to upload to Google Drive:", e);
    return null;
  }
}

/**
 * Get user's subscription tier
 */
async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  return (result[0]?.subscription_tier as SubscriptionTier) || "trial";
}

/**
 * Main generation function - uses unified AI provider system
 * Now tier-aware: different models and delays per subscription tier
 */
export async function generateWithAI(request: GenerationRequest): Promise<GenerationResult & { delayApplied?: number }> {
  const { userId, projectId, projectName, generationType, prompt, inputParams } = request;
  
  // Get user's subscription tier
  const userTier = await getUserTier(userId);
  const expectedDelay = TIER_DELAYS[userTier] || 0;
  
  // Determine AI type from generation type
  const aiType = GENERATION_TYPE_MAP[generationType] || "text";
  
  // Get active model for this tier (admin configured per tier)
  const activeModel = await getActiveModelForTier(aiType, userTier);
  
  // Use model's credit cost or fallback (free models = 0 credits)
  const creditCost = activeModel?.creditCost || CREDIT_COSTS[generationType] || 5;
  
  // 1. Check credits (skip for free models with 0 cost)
  if (creditCost > 0) {
    const hasCredits = await checkCredits(userId, creditCost);
    if (!hasCredits) {
      return {
        success: false,
        generationId: "",
        creditCost: 0,
        error: "Insufficient credits. Anda butuh " + creditCost + " credits.",
      };
    }
  }
  
  // Check if model is configured
  if (!activeModel) {
    return {
      success: false,
      generationId: "",
      creditCost: 0,
      error: `No active ${aiType} model configured for ${userTier} tier. Admin perlu set model di AI Providers.`,
    };
  }
  
  // 2. Create generation log (pending)
  const logResult = await sql`
    INSERT INTO ai_generation_logs (
      user_id, project_id, generation_type, model_id, model_provider, 
      prompt, input_params, credit_cost, status, started_at
    )
    VALUES (
      ${userId}, ${projectId || null}, ${generationType}, ${activeModel.modelId}, ${activeModel.providerName},
      ${prompt}, ${JSON.stringify(inputParams || {})}, ${creditCost}, 'processing', NOW()
    )
    RETURNING id
  `;
  
  const generationId = logResult[0].id;
  
  // 3. Deduct credits
  await deductCredits(
    userId, 
    creditCost, 
    "generation", 
    generationId, 
    `AI ${generationType} generation`
  );
  
  try {
    // 4. Call AI API via unified provider system
    let resultText: string | undefined;
    let resultUrl: string | undefined;
    let resultDriveId: string | undefined;
    let resultMetadata: Record<string, any> = {};
    
    // Build options based on generation type
    // Include userId and tier for enterprise users with own API keys
    const options: Record<string, any> = {
      ...inputParams,
      systemPrompt: getSystemPrompt(generationType),
      tier: userTier,
      userId: userId, // For enterprise users to use their own API keys
    };
    
    // Call unified AI function (handles tier-based model selection and delays)
    const aiResult = await callAI(aiType, prompt, options);
    
    if (!aiResult.success) {
      throw new Error(aiResult.error || "AI generation failed");
    }
    
    // Handle result based on type
    if (aiType === "image") {
      if (aiResult.result) {
        // Try to upload to Google Drive
        const timestamp = Date.now();
        const fileName = `${generationType}_${timestamp}.png`;
        const driveResult = await uploadToGoogleDrive(userId, aiResult.result, fileName, projectName);
        
        if (driveResult) {
          resultUrl = driveResult.url;
          resultDriveId = driveResult.driveId;
        } else {
          resultUrl = aiResult.result;
        }
        
        resultMetadata = { 
          originalUrl: aiResult.result, 
          provider: aiResult.provider,
          creditCost: aiResult.creditCost,
        };
      }
    } else if (aiType === "video") {
      if (aiResult.result) {
        resultUrl = aiResult.result;
        resultMetadata = { 
          provider: aiResult.provider,
          creditCost: aiResult.creditCost,
        };
      }
    } else if (aiType === "audio") {
      if (aiResult.result) {
        resultUrl = aiResult.result;
        resultMetadata = { 
          provider: aiResult.provider,
          creditCost: aiResult.creditCost,
        };
      }
    } else {
      // Text generation
      resultText = aiResult.result;
      resultMetadata = { 
        provider: aiResult.provider,
        creditCost: aiResult.creditCost,
      };
    }
    
    // 5. Update generation log with result
    await sql`
      UPDATE ai_generation_logs
      SET 
        status = 'completed',
        result_text = ${resultText || null},
        result_url = ${resultUrl || null},
        result_drive_id = ${resultDriveId || null},
        result_metadata = ${JSON.stringify(resultMetadata)},
        token_input = ${resultMetadata.tokenInput || null},
        token_output = ${resultMetadata.tokenOutput || null},
        completed_at = NOW()
      WHERE id = ${generationId}
    `;
    
    return {
      success: true,
      generationId,
      resultText,
      resultUrl,
      creditCost,
    };
    
  } catch (error: any) {
    // 6. If failed, update log and refund credits
    await sql`
      UPDATE ai_generation_logs
      SET status = 'failed', error_message = ${error.message}, completed_at = NOW()
      WHERE id = ${generationId}
    `;
    
    await refundCredits(userId, creditCost, generationId, `Generation failed: ${error.message}`);
    
    return {
      success: false,
      generationId,
      creditCost: 0,
      error: error.message,
    };
  }
}

/**
 * Call text generation API
 */
async function callTextGenerationAPI(
  prompt: string,
  generationType: string,
  provider: string,
  modelId?: string
): Promise<{ text: string; tokenInput?: number; tokenOutput?: number }> {
  // TODO: Implement actual API calls
  // For now, return placeholder
  
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId || "gpt-4o-mini",
        messages: [
          { role: "system", content: getSystemPrompt(generationType) },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return {
      text: data.choices[0].message.content,
      tokenInput: data.usage?.prompt_tokens,
      tokenOutput: data.usage?.completion_tokens,
    };
  }
  
  throw new Error(`Provider ${provider} not implemented`);
}

/**
 * Call image generation API
 */
async function callImageGenerationAPI(
  prompt: string,
  provider: string,
  modelId?: string
): Promise<{ imageUrl: string; metadata?: Record<string, any> }> {
  if (provider === "fal" || provider === "replicate") {
    // Using fal.ai for image generation
    const response = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        image_size: "landscape_16_9",
        num_images: 1,
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      imageUrl: data.images[0].url,
      metadata: { seed: data.seed },
    };
  }
  
  if (provider === "openai") {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: modelId || "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return {
      imageUrl: data.data[0].url,
      metadata: { revisedPrompt: data.data[0].revised_prompt },
    };
  }
  
  throw new Error(`Image provider ${provider} not implemented`);
}

/**
 * Call video generation API
 */
async function callVideoGenerationAPI(
  prompt: string,
  provider: string,
  modelId?: string
): Promise<{ videoUrl: string; metadata?: Record<string, any> }> {
  if (provider === "fal") {
    const response = await fetch("https://fal.run/fal-ai/kling-video/v1/standard/text-to-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${process.env.FAL_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        duration: "5",
        aspect_ratio: "16:9",
      }),
    });
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      videoUrl: data.video.url,
      metadata: { duration: data.video.duration },
    };
  }
  
  throw new Error(`Video provider ${provider} not implemented`);
}

/**
 * Get system prompt based on generation type
 */
function getSystemPrompt(generationType: string): string {
  const prompts: Record<string, string> = {
    synopsis: "You are a professional screenwriter. Generate a compelling synopsis for the given story concept. Include the main conflict, protagonist's journey, and emotional stakes. Write in present tense, 200-300 words.",
    
    story_structure: "You are a story structure expert. Create a detailed beat sheet following the Hero's Journey or Save the Cat structure. Include all major beats with brief descriptions. Format as a structured list.",
    
    character_profile: "You are a character development expert. Create a comprehensive character profile including: physical appearance, personality traits (using MBTI), backstory, goals, fears, strengths, weaknesses, and character arc. Be specific and creative.",
    
    universe: "You are a world-building expert. Create a detailed universe/setting description including: geography, culture, technology level, political systems, history, and unique elements. Make it immersive and consistent.",
    
    moodboard_prompt: "You are a visual development artist. Based on the description, create a detailed prompt for image generation that captures the mood, style, lighting, and composition. Be specific about visual elements.",
    
    script: "You are an experienced screenwriter. Write a screenplay scene following proper format (sluglines, action, dialogue). Make dialogue natural and subtext-rich. Include visual storytelling elements.",
  };
  
  return prompts[generationType] || "You are a helpful creative assistant.";
}

/**
 * Get generation history for a user/project
 */
export async function getGenerationHistory(
  userId: string,
  projectId?: string,
  generationType?: string,
  limit: number = 20,
  acceptedOnly: boolean = false
): Promise<any[]> {
  let logs;
  
  if (projectId && generationType && acceptedOnly) {
    logs = await sql`
      SELECT * FROM ai_generation_logs
      WHERE user_id = ${userId} AND project_id = ${projectId} AND generation_type = ${generationType}
        AND deleted_at IS NULL AND is_accepted = TRUE
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } else if (projectId && generationType) {
    logs = await sql`
      SELECT * FROM ai_generation_logs
      WHERE user_id = ${userId} AND project_id = ${projectId} AND generation_type = ${generationType}
        AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } else if (projectId) {
    logs = await sql`
      SELECT * FROM ai_generation_logs
      WHERE user_id = ${userId} AND project_id = ${projectId} AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  } else {
    logs = await sql`
      SELECT * FROM ai_generation_logs
      WHERE user_id = ${userId} AND deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }
  
  return logs.map(log => ({
    id: log.id,
    projectId: log.project_id,
    generationType: log.generation_type,
    modelId: log.model_id,
    prompt: log.prompt,
    resultText: log.result_text,
    resultUrl: log.result_url,
    creditCost: log.credit_cost,
    status: log.status,
    isAccepted: log.is_accepted,
    errorMessage: log.error_message,
    createdAt: log.created_at,
    completedAt: log.completed_at,
  }));
}
