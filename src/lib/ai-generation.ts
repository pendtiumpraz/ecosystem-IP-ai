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
  moodboard_key_actions: "text",
  script: "text",
  dialogue: "text",
  sceneplot: "text",  // NEW: Sceneplot generation
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
  premise: 2, // Generate premise/logline from project + characters
  synopsis: 3,
  story_structure: 10,
  character_profile: 8,
  character_image: 12,
  characters_from_story: 15, // Generate multiple characters
  universe: 10,
  universe_from_story: 12, // Generate universe from story
  moodboard_prompt: 3,
  moodboard_key_actions: 5, // Generate key actions for a beat
  moodboard_all_prompts: 10, // Generate all moodboard prompts
  moodboard_image: 12,
  animate_all_prompts: 10, // Generate all animation prompts
  animation_preview: 50,
  script: 25,
  sceneplot: 5, // NEW: Generate scene and shot breakdown
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
  console.log(`[CREDITS] Deducting ${amount} from user ${userId}`);

  // Get current balance first
  const before = await sql`SELECT credit_balance FROM users WHERE id = ${userId}`;
  console.log(`[CREDITS] Before: ${before[0]?.credit_balance}`);

  // Update balance - use explicit subtraction
  await sql`
    UPDATE users 
    SET credit_balance = COALESCE(credit_balance, 100) - ${amount}, 
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  // Get new balance after update
  const after = await sql`SELECT credit_balance FROM users WHERE id = ${userId}`;
  const newBalance = after[0]?.credit_balance ?? 0;
  console.log(`[CREDITS] After: ${newBalance}`);

  // Create transaction record
  await sql`
    INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
    VALUES (${userId}, 'usage', ${-amount}, ${newBalance}, ${referenceType}, ${referenceId}, ${description})
  `;

  console.log(`[CREDITS] Transaction created, balance now: ${newBalance}`);
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
  console.log(`[CREDITS] Refunding ${amount} to user ${userId}`);

  await sql`
    UPDATE users 
    SET credit_balance = COALESCE(credit_balance, 0) + ${amount}, 
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  const after = await sql`SELECT credit_balance FROM users WHERE id = ${userId}`;
  const newBalance = after[0]?.credit_balance ?? 0;

  await sql`
    INSERT INTO credit_transactions (user_id, type, amount, balance_after, reference_type, reference_id, description)
    VALUES (${userId}, 'refund', ${amount}, ${newBalance}, 'generation', ${referenceId}, ${reason})
  `;

  console.log(`[CREDITS] Refund complete, balance now: ${newBalance}`);
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

    // Determine maxTokens based on generation type
    // Story structure needs more tokens to generate all beats + Want/Need Matrix
    // Max API limit is 8192
    const getMaxTokens = (type: string) => {
      switch (type) {
        case 'story_structure':
          return 8000; // Max allowed
        case 'synopsis':
          return 8000; // Max allowed
        case 'character':
        case 'universe':
          return 6000;
        default:
          return 4000;
      }
    };

    // Build options based on generation type
    // Include userId and tier for enterprise users with own API keys
    const options: Record<string, any> = {
      ...inputParams,
      systemPrompt: getSystemPrompt(generationType),
      tier: userTier,
      userId: userId, // For enterprise users to use their own API keys
      maxTokens: getMaxTokens(generationType), // Dynamic token limit
    };

    // Check if reference image is provided - use image-to-image instead of text-to-image
    // This supports characterRefUrl from GenerateCharacterImageModalV2
    console.log(`[AI Generation] aiType: ${aiType}, inputParams keys:`, Object.keys(inputParams || {}));
    console.log(`[AI Generation] characterRefUrl:`, inputParams?.characterRefUrl);

    let finalAiType: "text" | "image" | "image-to-image" | "video" | "audio" = aiType;
    if (aiType === "image" && inputParams?.characterRefUrl) {
      finalAiType = "image-to-image";
      // Pass the reference URL as referenceImage for the provider
      options.referenceImage = inputParams.characterRefUrl;
      console.log(`[AI] Switching to image-to-image with reference: ${inputParams.characterRefUrl}`);
    } else {
      console.log(`[AI] Using ${finalAiType} (no characterRefUrl provided)`);
    }

    // Call unified AI function (handles tier-based model selection and delays)
    const aiResult = await callAI(finalAiType, prompt, options);

    if (!aiResult.success) {
      throw new Error(aiResult.error || "AI generation failed");
    }

    // Handle result based on type (image-to-image returns image URL too)
    if (aiType === "image" || finalAiType === "image-to-image") {
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
    // Dynamic token limit based on generation type
    const tokenLimits: Record<string, number> = {
      characters_from_story: 8000, // Characters have 30+ fields each
      story_structure: 6000,
      universe_from_story: 6000,
      character_profile: 4000,
      synopsis: 3000
    };
    const maxTokens = tokenLimits[generationType] || 4096;

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
        max_tokens: maxTokens,
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
  const baseRule = `PENTING: 
1. WAJIB response dalam bahasa Indonesia
2. WAJIB output dalam format JSON valid (tanpa markdown code block)
3. Jangan tambahkan teks apapun di luar JSON
4. JANGAN gunakan tanda kutip curly/smart ("" atau '') di dalam nilai string. Gunakan tanda kutip tunggal biasa (') jika perlu mengutip kata.
   Contoh SALAH: "Kata informan: "Kebenaran itu pahit""
   Contoh BENAR: "Kata informan: 'Kebenaran itu pahit'"`;

  const prompts: Record<string, string> = {
    premise: `${baseRule}

Kamu adalah penulis profesional. Generate premise/logline yang compelling dari deskripsi proyek dan karakter.

Output JSON format:
{
  "premise": "Logline satu kalimat yang menarik (30-50 kata), memperkenalkan protagonis, goal, dan konflik utama",
  "genre": "pilih SATU (lowercase): drama, horror, comedy, action, romance, thriller, fantasy, sci-fi, mystery, adventure",
  "tone": "pilih SATU (lowercase dengan dash): light-hearted, dramatic, dark, comedic, suspenseful, romantic",
  "theme": "pilih SATU (lowercase): love, family, friendship, revenge, redemption, justice, power, identity, survival, sacrifice"
}`,

    synopsis: `${baseRule}

Kamu adalah penulis skenario profesional Indonesia. Generate synopsis lengkap dengan semua field.

SANGAT PENTING: 
- Gunakan EXACT value LOWERCASE dari pilihan (JANGAN kapital, JANGAN spasi, harus persis seperti contoh)
- Contoh BENAR: "epic" bukan "Epic", "man-vs-self" bukan "Man vs Self"
- Jika ada PREFERENCE dari user, ikuti petunjuk tersebut untuk menyesuaikan style dan tone

Output JSON format:
{
  "synopsis": "sinopsis singkat 100-150 kata dalam bahasa Indonesia",
  "globalSynopsis": "sinopsis detail 300-500 kata dengan konflik utama, perjalanan protagonis, dan taruhan emosional",
  "genre": "pilih SATU (lowercase): drama, horror, comedy, action, romance, thriller, fantasy, sci-fi, mystery, adventure, crime, documentary, family, historical, musical, sports, slice-of-life, supernatural, war, western",
  "subGenre": "sub-genre spesifik dalam bahasa Indonesia",
  "format": "pilih SATU (lowercase dengan dash): feature-film, short-film, series-episodic, series-serial, limited-series, web-series, anime, documentary",
  "duration": "perkiraan durasi (contoh: 90-120 menit, atau 45 menit/episode)",
  "tone": "pilih SATU (lowercase dengan dash): light-hearted, dramatic, dark, comedic, suspenseful, romantic, action-packed, inspirational, melancholic, satirical",
  "theme": "pilih SATU (lowercase): love, family, friendship, revenge, redemption, justice, power, identity, survival, sacrifice, hope, loss, coming-of-age, good-vs-evil",
  "conflict": "pilih SATU (lowercase dengan dash): man-vs-man, man-vs-nature, man-vs-self, man-vs-society, man-vs-technology, man-vs-supernatural, man-vs-fate",
  "targetAudience": "pilih SATU (lowercase dengan dash): children, teens, young-adults, adults, mature, family",
  "endingType": "pilih SATU (lowercase dengan underscore): happy, sad, bitter_sweet, ambiguous, cliffhanger, twisted",
  "wantStages": {
    "menginginkan": "Keinginan eksternal awal protagonis",
    "memastikan": "Bagaimana protagonis berkomitmen",
    "mengejar": "Aksi yang dilakukan untuk mengejar",
    "tercapai": true atau false
  },
  "needStages": {
    "membutuhkan": "Kebutuhan internal yang tidak disadari",
    "menemukan": "Bagaimana protagonis menyadari kebutuhannya",
    "menerima": "Bagaimana protagonis menerima perubahan",
    "terpenuhi": true atau false
  }
}`,

    story_structure: `${baseRule}

Kamu adalah ahli struktur cerita profesional. Buat beat sheet detail dengan Want/Need Matrix V2.

SANGAT PENTING:
- Baca BEATS dari prompt user, gunakan EXACT key names tersebut
- Isi SEMUA beats yang diminta dengan deskripsi 50-100 kata bahasa Indonesia
- JANGAN ubah nama beat, gunakan PERSIS seperti yang diberikan
- JANGAN gunakan tanda kutip curly/smart di dalam nilai. Jika perlu mengutip dialog, gunakan tanda kutip tunggal biasa (').
  Contoh BENAR: "Dia berbisik, 'Kebenaran itu pahit.'"
  Contoh SALAH: "Dia berbisik, "Kebenaran itu pahit."" (JANGAN seperti ini!)

Output JSON format:
{
  "beats": {
    "[nama beat 1]": "deskripsi lengkap beat ini dalam bahasa Indonesia",
    "[nama beat 2]": "deskripsi lengkap beat ini dalam bahasa Indonesia",
    ... (isi SEMUA beats yang diminta)
  },
  "keyActions": {
    "[nama beat 1]": "aksi kunci yang terjadi di beat ini",
    "[nama beat 2]": "aksi kunci yang terjadi di beat ini",
    ... (isi SEMUA beats)
  },
  "wantStages": {
    "menginginkan": "Apa yang karakter INGINKAN di awal cerita? (keinginan eksternal awal)",
    "memastikan": "Bagaimana karakter MEMASTIKAN/berkomitmen untuk mengejar keinginan ini?",
    "mengejar": "Aksi apa yang karakter lakukan untuk MENGEJAR keinginan ini?",
    "tercapai": true atau false
  },
  "needStages": {
    "membutuhkan": "Apa yang karakter sebenarnya BUTUHKAN secara internal? (kebutuhan yang tidak disadari)",
    "menemukan": "Bagaimana karakter MENEMUKAN/menyadari kebutuhan sejati ini?",
    "menerima": "Bagaimana karakter MENERIMA dan memeluk perubahan internal ini?",
    "terpenuhi": true atau false
  },
  "endingType": "pilih SATU: happy, sad, bitter_sweet, ambiguous, cliffhanger, twisted"
}`,

    character_profile: `${baseRule}

Kamu adalah ahli pengembangan karakter. Buat profil karakter komprehensif.

Output JSON format:
{
  "name": "nama karakter",
  "role": "pilih: protagonist|antagonist|sidekick|mentor|love_interest|comic_relief",
  "archetype": "pilih: hero|mentor|threshold_guardian|herald|shapeshifter|shadow|trickster|ally",
  "physiological": {
    "gender": "pilih: male|female|non_binary",
    "age": "umur dalam angka",
    "ethnicity": "etnis/suku",
    "skinTone": "pilih: fair|light|medium|olive|tan|brown|dark",
    "bodyType": "pilih: slim|athletic|average|muscular|curvy|plus_size",
    "height": "pilih: short|average|tall|very_tall",
    "faceShape": "pilih: oval|round|square|heart|oblong|diamond",
    "hairStyle": "gaya rambut",
    "hairColor": "warna rambut",
    "eyeColor": "warna mata",
    "distinguishingFeatures": "ciri khas fisik"
  },
  "psychological": {
    "mbpiType": "pilih: INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP",
    "coreDesire": "keinginan inti",
    "biggestFear": "ketakutan terbesar",
    "strengths": ["kekuatan 1", "kekuatan 2", "kekuatan 3"],
    "weaknesses": ["kelemahan 1", "kelemahan 2"],
    "quirks": ["kebiasaan unik 1", "kebiasaan unik 2"]
  },
  "backstory": "latar belakang karakter 100-200 kata",
  "motivation": "motivasi utama",
  "characterArc": "perjalanan transformasi karakter",
  "clothingStyle": "gaya berpakaian khas"
}`,

    universe: `${baseRule}

Kamu adalah ahli world-building. Buat deskripsi universe/setting detail.

Output JSON format:
{
  "name": "nama universe/dunia",
  "period": "pilih: ancient|medieval|renaissance|industrial|modern|future|timeless",
  "era": "era spesifik (contoh: 1990s, Victorian, dll)",
  "location": "lokasi utama",
  "worldType": "pilih: real_world|alternate_history|fantasy|scifi|post_apocalyptic|dystopia|utopia",
  "technologyLevel": "pilih: primitive|medieval|industrial|modern|advanced|futuristic|magical",
  "magicSystem": "sistem magic/supernatural jika ada, atau 'none'",
  "society": "deskripsi struktur masyarakat",
  "government": "sistem pemerintahan",
  "economy": "sistem ekonomi",
  "culture": "budaya dan tradisi unik",
  "privateLife": "kehidupan sehari-hari penduduk",
  "uniqueElements": ["elemen unik 1", "elemen unik 2", "elemen unik 3"]
}`,

    moodboard_prompt: `${baseRule}

Kamu adalah visual development artist. Buat prompt untuk image generation.

Output JSON format:
{
  "prompt": "detailed image generation prompt in English for best AI image results",
  "style": "pilih: realistic|anime|cartoon|painterly|cinematic|concept_art|illustration",
  "mood": "mood/atmosphere",
  "lighting": "tipe pencahayaan",
  "colorPalette": ["warna 1", "warna 2", "warna 3"],
  "composition": "deskripsi komposisi"
}`,

    characters_from_story: `${baseRule}

Kamu adalah ahli pengembangan karakter profesional. Berdasarkan cerita yang diberikan, generate karakter-karakter lengkap dengan semua detail.

CRITICAL - JUMLAH KARAKTER:
- Baca dengan TELITI berapa karakter yang diminta di prompt user
- Kamu WAJIB menghasilkan PERSIS sejumlah karakter yang diminta
- Jika diminta 2 karakter, buat TEPAT 2 karakter berbeda
- Jika diminta 3 karakter, buat TEPAT 3 karakter berbeda
- JANGAN berhenti sebelum semua karakter selesai dibuat
- Setiap karakter harus LENGKAP dengan semua field

PENTING:
- Buat karakter yang RELEVAN dan PENTING untuk cerita
- Setiap karakter harus UNIK dengan personality BERBEDA
- JANGAN buat karakter yang sama atau mirip
- Role harus bervariasi jika memungkinkan
- Gunakan EXACT values lowercase untuk dropdown fields

Output JSON format (ARRAY dengan jumlah karakter SESUAI PERMINTAAN):
{
  "characters": [
    {
      "name": "nama lengkap karakter UNIK",
      "role": "pilih SATU lowercase: protagonist, antagonist, sidekick, mentor, love-interest, comic-relief, supporting, extra",
      "age": "pilih SATU lowercase: child, teen, young-adult, adult, middle-aged, elderly",
      "castReference": "referensi artis/aktor yang mirip (opsional)",
      "gender": "pilih: male, female, non-binary",
      "ethnicity": "pilih: asian-east, asian-southeast, asian-south, middle-eastern, african, caucasian, latino, mixed, fantasy",
      "skinTone": "pilih: very-fair, fair, light, medium, tan, olive, brown, dark-brown, dark",
      "faceShape": "pilih: oval, round, square, heart, oblong, diamond, triangle",
      "eyeShape": "pilih: almond, round, hooded, monolid, upturned, downturned, deep-set",
      "eyeColor": "pilih: brown, dark-brown, black, hazel, green, blue, gray, amber, heterochromia",
      "noseShape": "pilih: straight, button, roman, wide, narrow, upturned, flat",
      "lipsShape": "pilih: full, thin, heart, wide, bow, round",
      "hairStyle": "pilih: straight-short, straight-medium, straight-long, wavy-short, wavy-medium, wavy-long, curly-short, curly-medium, curly-long, afro, braids, dreadlocks, bald, buzz-cut, mohawk, pompadour, undercut, man-bun, ponytail, pigtails, bun, bob-cut",
      "hairColor": "pilih: black, dark-brown, brown, auburn, blonde, red, gray, white, blue, purple, pink, green, ombre, highlights",
      "hijab": "pilih: none, simple, pashmina, turban, khimar, niqab, sport",
      "bodyType": "pilih: slim, athletic, average, muscular, curvy, plus-size",
      "height": "pilih: short, average, tall, very-tall",
      "uniqueness": "ciri fisik unik",
      "archetype": "pilih: hero, mentor, threshold-guardian, herald, shapeshifter, shadow, trickster, ally",
      "fears": "ketakutan terbesar",
      "wants": "keinginan eksternal",
      "needs": "kebutuhan internal",
      "alterEgo": "sisi tersembunyi",
      "traumatic": "pengalaman traumatis",
      "personalityType": "pilih MBTI: INTJ, INTP, ENTJ, ENTP, INFJ, INFP, ENFJ, ENFP, ISTJ, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, ESFP",
      "strength": "kekuatan utama",
      "weakness": "kelemahan utama",
      "opportunity": "peluang berkembang",
      "threat": "ancaman eksternal",
      "clothingStyle": "gaya berpakaian",
      "personalityTraits": ["trait 1", "trait 2", "trait 3"],
      "logos": "logika/rasionalitas",
      "ethos": "kredibilitas moral",
      "pathos": "emosi dominan",
      "emotionalTone": "tone emosional",
      "emotionalStyle": "cara ekspresi emosi",
      "emotionalMode": "mode emosi default",
      "spouse": "pasangan (nama + deskripsi, atau -)",
      "children": "anak-anak (nama + umur, atau -)",
      "parents": "orang tua (ayah & ibu, atau -)",
      "affiliation": "afiliasi organisasi",
      "groupRelationshipLevel": "level hubungan kelompok",
      "cultureTradition": "budaya tradisi",
      "language": "bahasa",
      "tribe": "suku/etnis",
      "economicClass": "kelas ekonomi",
      "faith": "keyakinan spiritual",
      "religionSpirituality": "agama/spiritualitas",
      "trustworthy": "tingkat kepercayaan",
      "willingness": "kesediaan membantu",
      "vulnerability": "kerentanan emosional",
      "commitments": "komitmen hidup",
      "integrity": "integritas moral",
      "graduate": "pendidikan terakhir",
      "achievement": "pencapaian akademik",
      "fellowship": "fellowship/organisasi",
      "partyId": "afiliasi politik",
      "nationalism": "tingkat nasionalisme",
      "citizenship": "kewarganegaraan"
    }
  ]
}

INGAT: Hasilkan PERSIS jumlah karakter yang diminta. Jangan kurang, jangan lebih.`,

    universe_from_story: `${baseRule}

Kamu adalah ahli world-building profesional. Berdasarkan cerita yang diberikan, bangun universe/setting detail.

CRITICAL: SEMUA 18 field WAJIB diisi dengan detail lengkap (2-3 kalimat per field). Jangan skip field manapun!

Output JSON format:
{
  "universeName": "nama universe/dunia yang memorable (1-3 kata)",
  "period": "era/periode waktu (contoh: 2045, Medieval Era, Kerajaan Majapahit 1350)",
  
  "roomCave": "deskripsi ruangan/kamar pribadi karakter utama, suasana, dekorasi - WAJIB 2-3 kalimat",
  "houseCastle": "deskripsi rumah/istana/tempat tinggal utama, arsitektur, kondisi - WAJIB 2-3 kalimat",
  "privateInterior": "suasana interior privat, pencahayaan, aroma, nuansa emosional - WAJIB 2-3 kalimat",
  
  "familyInnerCircle": "struktur keluarga atau lingkaran dalam protagonis, hubungan penting - WAJIB 2-3 kalimat",
  
  "neighborhoodEnvironment": "lingkungan sekitar tempat tinggal, tetangga, aktivitas harian - WAJIB 2-3 kalimat",
  
  "townDistrictCity": "kota/distrik/desa tempat cerita berlangsung, karakteristik, landmark - WAJIB 2-3 kalimat",
  "workingOfficeSchool": "tempat kerja/sekolah/aktivitas utama karakter, suasana, aturan - WAJIB 2-3 kalimat",
  
  "country": "negara/kerajaan/wilayah besar, geografis, hubungan dengan wilayah lain - WAJIB 2-3 kalimat",
  "governmentSystem": "sistem pemerintahan, struktur kekuasaan, pemimpin - WAJIB 2-3 kalimat",
  
  "laborLaw": "hukum ketenagakerjaan/aturan kerja formal, hak pekerja, jam kerja - WAJIB 2-3 kalimat",
  "rulesOfWork": "norma kerja tidak tertulis, kebiasaan, etika profesi - WAJIB 2-3 kalimat",
  
  "societyAndSystem": "struktur sosial, kelas/kasta, mobilitas sosial - WAJIB 2-3 kalimat",
  "socioculturalSystem": "budaya, tradisi, festival, kepercayaan yang mempengaruhi karakter - WAJIB 2-3 kalimat",
  
  "environmentLandscape": "pemandangan alam, cuaca, flora fauna, kondisi geografis - WAJIB 2-3 kalimat",
  "sociopoliticEconomy": "kondisi politik-ekonomi, mata uang, perdagangan, konflik ekonomi - WAJIB 2-3 kalimat",
  "kingdomTribeCommunal": "kerajaan/suku/komunitas besar yang berpengaruh, aliansi, rivalitas - WAJIB 2-3 kalimat"
}`,

    moodboard_all_prompts: `${baseRule}

Kamu adalah visual development artist profesional. Berdasarkan story structure (beat sheet) yang diberikan, generate prompt untuk SETIAP beat.

PENTING:
- Baca BEATS dari prompt user, gunakan EXACT beat names tersebut
- Buat prompt dalam BAHASA INGGRIS untuk hasil AI image terbaik
- Setiap prompt harus menggambarkan VISUAL KEY MOMENT dari beat tersebut
- Masukkan detail setting, karakter, lighting, mood, dan atmosphere
- Format prompt untuk Midjourney/DALL-E style

Output JSON format:
{
  "prompts": {
    "[beat_name_1]": "detailed english prompt for this beat - describe visual scene, characters, action, setting, atmosphere...",
    "[beat_name_2]": "detailed english prompt for this beat...",
    "[beat_name_3]": "detailed english prompt for this beat...",
    ... (generate prompt for EVERY beat provided)
  },
  "style": "consistent visual style for all images (e.g., cinematic, anime, painterly)",
  "colorPalette": ["primary color", "secondary color", "accent color"],
  "overallMood": "overall mood/atmosphere"
}

INGAT: Hasilkan prompt untuk SETIAP beat yang diberikan. Jangan skip beat manapun.`,

    animate_all_prompts: `${baseRule}

Kamu adalah animation director profesional. Berdasarkan story structure (beat sheet) yang diberikan, generate prompt untuk ANIMASI setiap beat.

PENTING:
- Baca BEATS dari prompt user, gunakan EXACT beat names tersebut
- Buat prompt dalam BAHASA INGGRIS untuk hasil AI video/animation terbaik
- Setiap prompt harus menggambarkan SCENE ANIMATION dari beat tersebut
- Masukkan detail movement, camera angle, timing, dan transisi
- Format prompt untuk video generation AI

Output JSON format:
{
  "prompts": {
    "[beat_name_1]": "animation prompt: [character] doing [action] in [setting], camera [movement], mood [atmosphere], duration 5-10 seconds...",
    "[beat_name_2]": "animation prompt for this beat...",
    "[beat_name_3]": "animation prompt for this beat...",
    ... (generate prompt for EVERY beat provided)
  },
  "style": "consistent animation style (e.g., 2D, 3D, anime, realistic)",
  "transitionType": "transition between scenes (e.g., fade, cut, dissolve)",
  "pacing": "overall pacing (e.g., slow, medium, fast)"
}

INGAT: Hasilkan animation prompt untuk SETIAP beat yang diberikan. Jangan skip beat manapun.`,

    script: `${baseRule}

Kamu adalah penulis skenario berpengalaman. Tulis scene screenplay.

Output JSON format:
{
  "scene": "konten scene dalam format screenplay Indonesia",
  "slugline": "INT./EXT. LOKASI - WAKTU",
  "duration": "estimasi durasi dalam menit",
  "characters": ["karakter 1", "karakter 2"],
  "emotionalBeat": "beat emosional scene ini"
}`,
  };

  return prompts[generationType] || `${baseRule}\n\nKamu adalah asisten kreatif. Response dalam JSON format yang sesuai dengan konteks request.`;
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
