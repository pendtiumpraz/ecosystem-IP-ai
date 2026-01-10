/**
 * Activate ModelsLab Models Script
 * Sets ModelsLab models as the default active models for various subcategories
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

// Default active models mapping: subcategory -> model_id pattern
const defaultActiveModels: Record<string, string> = {
    // Image Generation
    "text-to-image": "v6/images/text2img",
    "image-to-image": "v6/images/img2img",
    "inpainting": "v6/image_editing/inpaint",
    "outpainting": "v6/image_editing/outpaint",
    "upscaling": "v6/image_editing/super_resolution",
    "controlnet": "canny",

    // Video Generation
    "text-to-video": "v6/video/text2video_ultra",
    "image-to-video": "v6/video/img2video_ultra",
    "video-to-video": "v7/video-fusion/video-to-video",
    "lip-sync": "v7/video-fusion/lip-sync",

    // Face/Avatar
    "face-swap": "v6/deepfake/face_swap",
    "face-swap-video": "v6/deepfake/video_swap",

    // Audio
    "text-to-speech": "v7/voice/text-to-speech",
    "speech-to-text": "v7/voice/speech-to-text",
    "voice-cloning": "v7/voice/speech-to-speech",
    "text-to-music": "v7/voice/music-gen",
    "text-to-sfx": "v7/voice/sound-generation",
    "song-edit": "v7/voice/song-extender",
    "dubbing": "v7/voice/create-dubbing",

    // 3D
    "text-to-3d": "v6/3d/text_to_3d",
    "image-to-3d": "v6/3d/image_to_3d",

    // Other
    "interior": "v6/interior/room",
    "virtual-try-on": "v6/fashion/tryon",
    "image-to-text": "v6/describe/image",
    "training": "v6/trainer/lora",
};

async function activateModels() {
    console.log("🔧 Setting default active ModelsLab models...\n");

    let success = 0;
    let failed = 0;

    for (const [subcategory, modelIdPattern] of Object.entries(defaultActiveModels)) {
        console.log(`👉 Setting active model for ${subcategory}...`);

        // Find the model by model_id
        const modelResult = await sql`
      SELECT id, name FROM ai_models 
      WHERE model_id = ${modelIdPattern}
      LIMIT 1
    `;

        if (modelResult.length === 0) {
            console.log(`   ⚠️ Model not found: ${modelIdPattern}`);
            failed++;
            continue;
        }

        const model = modelResult[0];

        // Upsert into ai_active_models
        try {
            await sql`
        INSERT INTO ai_active_models (subcategory, model_id)
        VALUES (${subcategory}, ${model.id})
        ON CONFLICT (subcategory) 
        DO UPDATE SET model_id = ${model.id}, updated_at = NOW()
      `;
            console.log(`   ✅ Set [${subcategory}] to "${model.name}"`);
            success++;
        } catch (error: any) {
            console.log(`   ❌ Failed to set ${subcategory}:`, error.message);
            failed++;
        }
    }

    console.log("\n✨ Activation Complete!");
    console.log(`   ✅ Success: ${success}`);
    console.log(`   ❌ Failed: ${failed}`);
}

activateModels();
