/**
 * ModelsLab Seeder - Complete Models from Website
 * Based on actual models from modelslab.com/models
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

// All models extracted from ModelsLab website
const MODELS = [
    // ========== TEXT TO IMAGE (42) ==========
    { name: "FLUX.2 Dev", model_id: "flux-2-dev", type: "text-to-image", cost: 5 },
    { name: "FLUX.2 Pro", model_id: "flux-2-pro", type: "text-to-image", cost: 8 },
    { name: "FLUX.2 Max", model_id: "flux-2-max", type: "text-to-image", cost: 10 },
    { name: "FLUX Pro 1.1", model_id: "flux-pro-1.1", type: "text-to-image", cost: 8 },
    { name: "FLUX Pro 1.1 Ultra", model_id: "flux-pro-1.1-ultra", type: "text-to-image", cost: 10 },
    { name: "Seedream 3.0", model_id: "seedream-3.0", type: "text-to-image", cost: 5 },
    { name: "Seedream 4.0", model_id: "seedream-4.0", type: "text-to-image", cost: 6 },
    { name: "Seedream 4.5", model_id: "seedream-4.5", type: "text-to-image", cost: 7 },
    { name: "Stable Diffusion 3.5 Large", model_id: "sd-3.5-large", type: "text-to-image", cost: 5 },
    { name: "Stable Diffusion 3.5 Turbo", model_id: "sd-3.5-turbo", type: "text-to-image", cost: 3 },
    { name: "Ideogram 2.0", model_id: "ideogram-2.0", type: "text-to-image", cost: 8 },
    { name: "Ideogram 3.0", model_id: "ideogram-3.0", type: "text-to-image", cost: 10 },
    { name: "Midjourney", model_id: "midjourney", type: "text-to-image", cost: 10 },
    { name: "DALL-E 3", model_id: "dall-e-3", type: "text-to-image", cost: 8 },
    { name: "Ghibli-Art Style", model_id: "ghibli-art-style", type: "text-to-image", cost: 5 },
    { name: "Qwen Text to Image", model_id: "qwen-text-to-image", type: "text-to-image", cost: 5 },
    { name: "Recraft V3", model_id: "recraft-v3", type: "text-to-image", cost: 6 },
    { name: "Gen 4 Image Turbo", model_id: "gen-4-image-turbo", type: "text-to-image", cost: 8 },
    { name: "Nano Banana Pro", model_id: "nano-banana-pro", type: "text-to-image", cost: 5 },
    { name: "Playground v2.5", model_id: "playground-v2.5", type: "text-to-image", cost: 5 },
    { name: "SDXL", model_id: "sdxl", type: "text-to-image", cost: 3 },
    { name: "SDXL Turbo", model_id: "sdxl-turbo", type: "text-to-image", cost: 2 },
    { name: "SDXL Lightning", model_id: "sdxl-lightning", type: "text-to-image", cost: 2 },
    { name: "Realtime Text to Image", model_id: "v6/realtime/text2img", type: "text-to-image", cost: 1 },
    { name: "Text to Image Ultra", model_id: "v6/images/text2img", type: "text-to-image", cost: 5 },

    // ========== TEXT TO VIDEO (20) ==========
    { name: "LTX 2 Pro Text To Video", model_id: "ltx-2-pro-text2video", type: "text-to-video", cost: 20 },
    { name: "Seedance 1.5 Pro Text to Video", model_id: "seedance-1.5-pro-t2v", type: "text-to-video", cost: 25 },
    { name: "Wan 2.6 Text to Video", model_id: "wan-2.6-t2v", type: "text-to-video", cost: 20 },
    { name: "MiniMax Hailuo0.2 Text To Video", model_id: "minimax-hailuo-0.2-t2v", type: "text-to-video", cost: 20 },
    { name: "MiniMax Hailuo2.3 Text To Video", model_id: "minimax-hailuo-2.3-t2v", type: "text-to-video", cost: 22 },
    { name: "Kling V2 Master Text To Video", model_id: "kling-v2-master-t2v", type: "text-to-video", cost: 25 },
    { name: "Kling V2.1 Master Text To Video", model_id: "kling-v2.1-master-t2v", type: "text-to-video", cost: 25 },
    { name: "Kling V2.5 Turbo Text To Video", model_id: "kling-v2.5-turbo-t2v", type: "text-to-video", cost: 18 },
    { name: "Seedance 1.0 Pro Fast Text To Video", model_id: "seedance-1.0-pro-fast-t2v", type: "text-to-video", cost: 15 },
    { name: "Veo 3.1", model_id: "veo-3.1", type: "text-to-video", cost: 30 },
    { name: "Veo 3.1 Fast", model_id: "veo-3.1-fast", type: "text-to-video", cost: 22 },
    { name: "OpenAI Sora 2 Text to Video", model_id: "sora-2-t2v", type: "text-to-video", cost: 30 },
    { name: "Wan 2.5 Text to Video", model_id: "wan-2.5-t2v", type: "text-to-video", cost: 18 },
    { name: "Google Veo 3 Fast Preview", model_id: "veo-3-fast-preview", type: "text-to-video", cost: 25 },
    { name: "Google Veo 3 Fast", model_id: "veo-3-fast", type: "text-to-video", cost: 25 },
    { name: "Wan2.2 Text to Video", model_id: "wan-2.2-t2v", type: "text-to-video", cost: 15 },
    { name: "Google Veo 3", model_id: "veo-3", type: "text-to-video", cost: 30 },
    { name: "Seedance Text to video", model_id: "seedance-t2v", type: "text-to-video", cost: 15 },
    { name: "Google Veo 2", model_id: "veo-2", type: "text-to-video", cost: 22 },
    { name: "Text to Video Ultra", model_id: "v6/video/text2video_ultra", type: "text-to-video", cost: 20 },

    // ========== IMAGE TO VIDEO (26) ==========
    { name: "LTX 2 Pro Image To Video", model_id: "ltx-2-pro-i2v", type: "image-to-video", cost: 20 },
    { name: "Seedance 1.5 Pro Image to Video", model_id: "seedance-1.5-pro-i2v", type: "image-to-video", cost: 25 },
    { name: "Wan 2.6 Image to Video", model_id: "wan-2.6-i2v", type: "image-to-video", cost: 20 },
    { name: "Kling V1.6 Multi Image To Video", model_id: "kling-v1.6-multi-i2v", type: "image-to-video", cost: 22 },
    { name: "MiniMax Hailuo0.2 Image To Video", model_id: "minimax-hailuo-0.2-i2v", type: "image-to-video", cost: 20 },
    { name: "MiniMax Hailuo-2.3 Fast Image To Video", model_id: "minimax-hailuo-2.3-fast-i2v", type: "image-to-video", cost: 18 },
    { name: "MiniMax Hailuo2.3 Image To Video", model_id: "minimax-hailuo-2.3-i2v", type: "image-to-video", cost: 22 },
    { name: "Kling V2.1 Image To Video", model_id: "kling-v2.1-i2v", type: "image-to-video", cost: 25 },
    { name: "Kling V2 Master Image To Video", model_id: "kling-v2-master-i2v", type: "image-to-video", cost: 25 },
    { name: "Kling V2.1 Master Image To Video", model_id: "kling-v2.1-master-i2v", type: "image-to-video", cost: 25 },
    { name: "Kling V2.5 Turbo Image To Video", model_id: "kling-v2.5-turbo-i2v", type: "image-to-video", cost: 18 },
    { name: "Seedance 1.0 Pro Fast Image to Video", model_id: "seedance-1.0-pro-fast-i2v", type: "image-to-video", cost: 15 },
    { name: "Omnihuman 1.5", model_id: "omnihuman-1.5", type: "image-to-video", cost: 20 },
    { name: "Veo 3.1 Fast Image to Video", model_id: "veo-3.1-fast-i2v", type: "image-to-video", cost: 22 },
    { name: "Veo 3.1 Image to Video", model_id: "veo-3.1-i2v", type: "image-to-video", cost: 28 },
    { name: "Seedance 1.0 Pro Image to Video", model_id: "seedance-1.0-pro-i2v", type: "image-to-video", cost: 18 },
    { name: "Wan 2.5 Image to Video", model_id: "wan-2.5-i2v", type: "image-to-video", cost: 18 },
    { name: "Omnihuman Image + Audio to Video", model_id: "omnihuman-audio-i2v", type: "image-to-video", cost: 25 },
    { name: "Wan2.2 Image to Video", model_id: "wan-2.2-i2v", type: "image-to-video", cost: 15 },
    { name: "Veo 2 Image to Video", model_id: "veo-2-i2v", type: "image-to-video", cost: 22 },
    { name: "Seedance Image to Video", model_id: "seedance-i2v", type: "image-to-video", cost: 15 },
    { name: "Runway Gen 4 Turbo", model_id: "runway-gen4-turbo", type: "image-to-video", cost: 25 },
    { name: "Image to Video Ultra", model_id: "v6/video/img2video_ultra", type: "image-to-video", cost: 20 },
    { name: "AnimateDiff", model_id: "animate-diff", type: "image-to-video", cost: 12 },
    { name: "Stable Video Diffusion", model_id: "svd", type: "image-to-video", cost: 12 },
    { name: "Luma Dream Machine", model_id: "luma-dream-machine", type: "image-to-video", cost: 20 },

    // ========== IMAGE TO IMAGE (17) ==========
    { name: "FLUX.2 Max Image Editing", model_id: "flux-2-max-img-edit", type: "image-to-image", cost: 10 },
    { name: "Flux Pro 1.1 Ultra", model_id: "flux-pro-1.1-ultra-i2i", type: "image-to-image", cost: 10 },
    { name: "Flux Pro 1.1", model_id: "flux-pro-1.1-i2i", type: "image-to-image", cost: 8 },
    { name: "Seedream 4.5 Image to Image", model_id: "seedream-4.5-i2i", type: "image-to-image", cost: 7 },
    { name: "Flux.2 Dev Image To Image", model_id: "flux-2-dev-i2i", type: "image-to-image", cost: 5 },
    { name: "Flux.2 Pro Image Editing", model_id: "flux-2-pro-img-edit", type: "image-to-image", cost: 8 },
    { name: "Qwen Image To Image", model_id: "qwen-i2i", type: "image-to-image", cost: 5 },
    { name: "Qwen Image Edit", model_id: "qwen-img-edit", type: "image-to-image", cost: 5 },
    { name: "Seedream 4.0 Image to image", model_id: "seedream-4.0-i2i", type: "image-to-image", cost: 6 },
    { name: "Gen 4 Image Turbo", model_id: "gen4-img-turbo-i2i", type: "image-to-image", cost: 8 },
    { name: "Nano Banana Image Edit", model_id: "nano-banana-img-edit", type: "image-to-image", cost: 5 },
    { name: "Seededit 3.0 Image to image", model_id: "seededit-3.0-i2i", type: "image-to-image", cost: 5 },
    { name: "Flux Kontext Dev", model_id: "flux-kontext-dev", type: "image-to-image", cost: 6 },
    { name: "Flux Kontext Pro", model_id: "flux-kontext-pro", type: "image-to-image", cost: 8 },
    { name: "ControlNet Image to Image", model_id: "v6/images/controlnet_img2img", type: "image-to-image", cost: 5 },
    { name: "Image to Image Ultra", model_id: "v6/images/img2img", type: "image-to-image", cost: 5 },
    { name: "Realtime Img2Img", model_id: "v6/realtime/img2img", type: "image-to-image", cost: 1 },

    // ========== AI IMAGE EDITING (23) ==========
    { name: "Interior Mixer", model_id: "interior-mixer", type: "inpainting", cost: 8 },
    { name: "Object Removal", model_id: "v6/image_editing/object_removal", type: "inpainting", cost: 3 },
    { name: "Sketch Renderer", model_id: "sketch-renderer", type: "inpainting", cost: 5 },
    { name: "Image Enhancer", model_id: "v6/image_editing/enhance", type: "upscaling", cost: 3 },
    { name: "Replace Object (Inpaint)", model_id: "v6/image_editing/inpaint", type: "inpainting", cost: 5 },
    { name: "Object Remover", model_id: "object-remover", type: "inpainting", cost: 3 },
    { name: "OutPainting", model_id: "v6/image_editing/outpaint", type: "outpainting", cost: 5 },
    { name: "Image Upscaler", model_id: "v6/image_editing/super_resolution", type: "upscaling", cost: 3 },
    { name: "Remove Background", model_id: "v6/image_editing/removebg", type: "image-to-image", cost: 2 },
    { name: "Replace Background", model_id: "v6/image_editing/replace_bg", type: "image-to-image", cost: 3 },
    { name: "Relighting", model_id: "v6/image_editing/relighting", type: "image-to-image", cost: 3 },
    { name: "Face Restore", model_id: "v6/image_editing/face_restore", type: "upscaling", cost: 3 },
    { name: "Colorize", model_id: "v6/image_editing/colorize", type: "image-to-image", cost: 3 },

    // ========== TEXT TO SPEECH (4) ==========
    { name: "Text to Speech V7", model_id: "v7/voice/text-to-speech", type: "text-to-speech", cost: 3 },
    { name: "Text to Audio V6", model_id: "v6/voice/text_to_audio", type: "text-to-speech", cost: 3 },
    { name: "ElevenLabs TTS", model_id: "v6/voice/eleven_labs_tts", type: "text-to-speech", cost: 5 },
    { name: "OpenAI TTS", model_id: "openai-tts", type: "text-to-speech", cost: 5 },

    // ========== VIDEO TO VIDEO (2) ==========
    { name: "Video to Video V7", model_id: "v7/video-fusion/video-to-video", type: "video-to-video", cost: 15 },
    { name: "Vid2Vid Style Transfer", model_id: "v6/video/vid2vid", type: "video-to-video", cost: 15 },

    // ========== VOICE CHANGER (2) ==========
    { name: "Voice Changer V7", model_id: "v7/voice/speech-to-speech", type: "voice-cloning", cost: 5 },
    { name: "Voice to Voice V6", model_id: "v6/voice/voice_to_voice", type: "voice-cloning", cost: 5 },

    // ========== SOUND EFFECT (3) ==========
    { name: "Sound Effects V7", model_id: "v7/voice/sound-generation", type: "text-to-sfx", cost: 5 },
    { name: "Sound Effects V6", model_id: "v6/voice/sfx", type: "text-to-sfx", cost: 5 },
    { name: "Foley Sound Gen", model_id: "foley-sound-gen", type: "text-to-sfx", cost: 5 },

    // ========== MUSIC GENERATION (7) ==========
    { name: "Music Generator V7", model_id: "v7/voice/music-gen", type: "text-to-music", cost: 10 },
    { name: "Music Generator V6", model_id: "v6/voice/music_gen", type: "text-to-music", cost: 10 },
    { name: "Suno Music", model_id: "suno", type: "text-to-music", cost: 15 },
    { name: "Udio Music", model_id: "udio", type: "text-to-music", cost: 15 },
    { name: "ACE Step Music", model_id: "ace-step-music", type: "text-to-music", cost: 10 },
    { name: "Instrumental Gen", model_id: "instrumental-gen", type: "text-to-music", cost: 8 },
    { name: "Jukebox", model_id: "jukebox", type: "text-to-music", cost: 8 },

    // ========== LIPS SYNC (1) ==========
    { name: "Lip Sync V7", model_id: "v7/video-fusion/lip-sync", type: "lip-sync", cost: 15 },

    // ========== AI AVATAR/HEADSHOT (4) ==========
    { name: "AI Headshot", model_id: "v6/headshot/generate", type: "face-swap", cost: 10 },
    { name: "Corporate Headshot", model_id: "v6/headshot/corporate", type: "face-swap", cost: 10 },
    { name: "LinkedIn Headshot", model_id: "v6/headshot/linkedin", type: "face-swap", cost: 10 },
    { name: "AI Avatar Gen", model_id: "ai-avatar-gen", type: "face-swap", cost: 10 },

    // ========== 3D GENERATIONS (2) ==========
    { name: "Text to 3D", model_id: "v6/3d/text_to_3d", type: "text-to-3d", cost: 15 },
    { name: "Image to 3D", model_id: "v6/3d/image_to_3d", type: "image-to-3d", cost: 15 },

    // ========== VIRTUAL TRY-ON (4) ==========
    { name: "Virtual Try-On", model_id: "v6/fashion/tryon", type: "virtual-try-on", cost: 8 },
    { name: "Clothes Swap", model_id: "v6/fashion/clothes_swap", type: "virtual-try-on", cost: 8 },
    { name: "Fashion Model Gen", model_id: "fashion-model-gen", type: "virtual-try-on", cost: 10 },
    { name: "Outfit Generator", model_id: "outfit-gen", type: "virtual-try-on", cost: 8 },

    // ========== DEEPFAKE (4) ==========
    { name: "Face Swap (Image)", model_id: "v6/deepfake/face_swap", type: "face-swap", cost: 5 },
    { name: "Multi Face Swap", model_id: "v6/deepfake/multi_face_swap", type: "face-swap", cost: 8 },
    { name: "Face Swap (Video)", model_id: "v6/deepfake/video_swap", type: "face-swap-video", cost: 15 },
    { name: "Face Gen", model_id: "v6/deepfake/face_gen", type: "face-swap", cost: 5 },

    // ========== AI INTERIOR (8) ==========
    { name: "Room Interior Design", model_id: "v6/interior/room", type: "interior", cost: 8 },
    { name: "Exterior Design", model_id: "v6/interior/exterior", type: "interior", cost: 8 },
    { name: "Floor Plan", model_id: "v6/interior/floor_plan", type: "interior", cost: 8 },
    { name: "Virtual Staging", model_id: "v6/interior/staging", type: "interior", cost: 8 },
    { name: "Renovation Design", model_id: "v6/interior/renovation", type: "interior", cost: 8 },
    { name: "Kitchen Design", model_id: "v6/interior/kitchen", type: "interior", cost: 8 },
    { name: "Bathroom Design", model_id: "v6/interior/bathroom", type: "interior", cost: 8 },
    { name: "Living Room Design", model_id: "v6/interior/living_room", type: "interior", cost: 8 },

    // ========== SPEECH TO TEXT (2) ==========
    { name: "Speech to Text V7", model_id: "v7/voice/speech-to-text", type: "speech-to-text", cost: 2 },
    { name: "Whisper Transcription", model_id: "v6/voice/whisper", type: "speech-to-text", cost: 2 },

    // ========== DUBBING (2) ==========
    { name: "AI Dubbing V7", model_id: "v7/voice/create-dubbing", type: "dubbing", cost: 10 },
    { name: "AI Dubbing V6", model_id: "v6/voice/dubbing", type: "dubbing", cost: 10 },

    // ========== IMAGE TO TEXT (3) ==========
    { name: "Image Description", model_id: "v6/describe/image", type: "image-to-text", cost: 2 },
    { name: "OCR Text Extract", model_id: "v6/ocr/read", type: "image-to-text", cost: 2 },
    { name: "Image Caption", model_id: "v6/caption/generate", type: "image-to-text", cost: 2 },

    // ========== SONG EDIT (7) ==========
    { name: "Song Extender", model_id: "v7/voice/song-extender", type: "song-edit", cost: 8 },
    { name: "Song Inpaint", model_id: "v7/voice/song-inpaint", type: "song-edit", cost: 8 },
    { name: "Vocal Isolation", model_id: "v6/voice/vocals_isolate", type: "song-edit", cost: 5 },
    { name: "Stem Separation", model_id: "v6/voice/stems", type: "song-edit", cost: 5 },
    { name: "Remix Generator", model_id: "remix-gen", type: "song-edit", cost: 8 },
    { name: "Pitch Shift", model_id: "pitch-shift", type: "song-edit", cost: 3 },
    { name: "Tempo Changer", model_id: "tempo-changer", type: "song-edit", cost: 3 },

    // ========== CONTROLNET (7) ==========
    { name: "ControlNet Canny", model_id: "canny", type: "controlnet", cost: 5 },
    { name: "ControlNet Depth", model_id: "depth", type: "controlnet", cost: 5 },
    { name: "ControlNet OpenPose", model_id: "openpose", type: "controlnet", cost: 5 },
    { name: "ControlNet Scribble", model_id: "scribble", type: "controlnet", cost: 5 },
    { name: "ControlNet SoftEdge", model_id: "softedge", type: "controlnet", cost: 5 },
    { name: "ControlNet LineArt", model_id: "lineart", type: "controlnet", cost: 5 },
    { name: "ControlNet HED", model_id: "hed", type: "controlnet", cost: 5 },
];

async function seed() {
    console.log("🚀 ModelsLab Complete Seeder\n");
    console.log(`📦 Total models to seed: ${MODELS.length}\n`);

    try {
        const [{ id: providerId }] = await sql`SELECT id FROM ai_providers WHERE slug = 'modelslab'`;
        console.log("✅ Provider:", providerId);

        // Clear existing
        await sql`DELETE FROM ai_active_models WHERE model_id IN (SELECT id FROM ai_models WHERE provider_id = ${providerId})`;
        await sql`DELETE FROM ai_models WHERE provider_id = ${providerId}`;
        console.log("✅ Cleared existing\n");

        console.log("📥 Inserting models...\n");

        const stats: Record<string, number> = {};
        let inserted = 0;
        let failed = 0;

        for (const model of MODELS) {
            try {
                await sql`
          INSERT INTO ai_models (provider_id, name, model_id, type, credit_cost, is_active)
          VALUES (${providerId}, ${model.name}, ${model.model_id}, ${model.type}, ${model.cost}, true)
        `;
                inserted++;
                stats[model.type] = (stats[model.type] || 0) + 1;
                if (inserted % 30 === 0) console.log(`  ... ${inserted}/${MODELS.length}`);
            } catch (e: any) {
                failed++;
                console.error(`  ❌ ${model.name}: ${e.message?.substring(0, 40)}`);
            }
        }

        console.log(`\n✅ Done! Inserted: ${inserted}, Failed: ${failed}`);
        console.log(`\n📊 Models by Type:`);
        Object.entries(stats).sort((a, b) => b[1] - a[1]).forEach(([t, c]) => console.log(`   ${t}: ${c}`));

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

seed();
