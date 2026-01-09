/**
 * ModelsLab AI Provider Seeder
 * Seeds ModelsLab API endpoints based on official documentation
 * @see https://docs.modelslab.com
 * 
 * IMPORTANT: This seeds API TYPES/ENDPOINTS, not specific models.
 * ModelsLab provides unified API endpoints that support various underlying models.
 * 
 * Database enum types: text, image, video, audio, multimodal
 */

import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function seedModelsLab() {
    console.log("🌱 Seeding ModelsLab AI Provider...\n");

    // ========== 1. CREATE MODELSLAB PROVIDER ==========
    console.log("🏢 Creating ModelsLab provider...");

    await sql`
    INSERT INTO ai_providers (id, name, slug, type, logo_url, website_url, api_base_url)
    VALUES (
      'prov_modelslab',
      'ModelsLab',
      'modelslab',
      'multimodal',
      '/logos/modelslab.svg',
      'https://modelslab.com',
      'https://modelslab.com/api'
    )
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      api_base_url = EXCLUDED.api_base_url
  `;
    console.log("  ✅ ModelsLab provider created\n");

    // ========================================
    // IMPORTANT: ModelsLab provides API ENDPOINTS, not specific model IDs
    // The endpoints support multiple models internally
    // Below are the EXACT endpoints from official documentation
    // @see https://docs.modelslab.com
    // 
    // Using valid enum types: text, image, video, audio, multimodal
    // ========================================

    // ========== 2. IMAGE GENERATION API ==========
    // @see https://docs.modelslab.com/image-generation/overview
    console.log("🖼️ Creating Image Generation APIs...");

    const imageGenApis = [
        // Realtime Stable Diffusion endpoints
        { id: 'ml_text_to_image', name: 'Text to Image', model_id: 'text-to-image', credit_cost: 2 },
        { id: 'ml_image_to_image', name: 'Image to Image', model_id: 'image-to-image', credit_cost: 2 },
        { id: 'ml_inpainting', name: 'Inpainting', model_id: 'inpainting', credit_cost: 3 },

        // FLUX endpoints - @see https://docs.modelslab.com/image-generation/flux/overview
        { id: 'ml_flux_text_to_image', name: 'FLUX Text to Image', model_id: 'flux-text-to-image', credit_cost: 4 },

        // ControlNet endpoints - @see https://docs.modelslab.com/image-generation/controlnet/overview
        { id: 'ml_controlnet', name: 'ControlNet', model_id: 'controlnet', credit_cost: 3 },
    ];

    for (const api of imageGenApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'image',
        ${api.credit_cost},
        100
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${imageGenApis.length} Image Generation APIs\n`);

    // ========== 3. VIDEO API ==========
    // @see https://docs.modelslab.com/video-api/overview
    console.log("🎬 Creating Video APIs...");

    const videoApis = [
        { id: 'ml_text_to_video', name: 'Text to Video', model_id: 'text-to-video', credit_cost: 10 },
        { id: 'ml_image_to_video', name: 'Image to Video', model_id: 'image-to-video', credit_cost: 8 },
        { id: 'ml_text_to_video_ultra', name: 'Text to Video Ultra', model_id: 'text-to-video-ultra', credit_cost: 20 },
        { id: 'ml_image_to_video_ultra', name: 'Image to Video Ultra', model_id: 'image-to-video-ultra', credit_cost: 15 },
        { id: 'ml_scene_maker', name: 'Scene Maker', model_id: 'scene-maker', credit_cost: 12 },
        { id: 'ml_watermark_remover', name: 'Watermark Remover', model_id: 'watermark-remover', credit_cost: 5 },
    ];

    for (const api of videoApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'video',
        ${api.credit_cost},
        200
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${videoApis.length} Video APIs\n`);

    // ========== 4. DEEPFAKE API ==========
    // @see https://docs.modelslab.com/deepfake-api/overview
    console.log("🎭 Creating Deepfake APIs...");

    const deepfakeApis = [
        { id: 'ml_specific_face_swap', name: 'Specific Face Swap', model_id: 'specific-face-swap', credit_cost: 5 },
        { id: 'ml_multiple_face_swap', name: 'Multiple Face Swap', model_id: 'multiple-face-swap', credit_cost: 8 },
        { id: 'ml_single_video_swap', name: 'Single Video Swap', model_id: 'single-video-swap', credit_cost: 15 },
        { id: 'ml_specific_video_swap', name: 'Specific Video Swap', model_id: 'specific-video-swap', credit_cost: 20 },
    ];

    for (const api of deepfakeApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'video',
        ${api.credit_cost},
        300
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${deepfakeApis.length} Deepfake APIs\n`);

    // ========== 5. 3D API ==========
    // @see https://docs.modelslab.com/3d-api/overview
    console.log("🎮 Creating 3D APIs...");

    const threeApis = [
        { id: 'ml_text_to_3d', name: 'Text to 3D', model_id: 'text-to-3d', credit_cost: 10 },
        { id: 'ml_image_to_3d', name: 'Image to 3D', model_id: 'image-to-3d', credit_cost: 8 },
    ];

    for (const api of threeApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'multimodal',
        ${api.credit_cost},
        400
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${threeApis.length} 3D APIs\n`);

    // ========== 6. UNCENSORED CHAT API ==========  
    // @see https://docs.modelslab.com/uncensored-chat-api/overview
    console.log("💬 Creating Uncensored Chat APIs...");

    const chatApis = [
        { id: 'ml_chat_completions', name: 'Chat Completions', model_id: 'chat-completions', credit_cost: 2 },
        { id: 'ml_uncensored_chat', name: 'Uncensored Chat', model_id: 'uncensored-chat', credit_cost: 2 },
    ];

    for (const api of chatApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'text',
        ${api.credit_cost},
        500
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${chatApis.length} Chat APIs\n`);

    // ========== 7. INTERIOR API ==========
    // @see https://docs.modelslab.com/interior-api/overview
    console.log("🏠 Creating Interior APIs...");

    const interiorApis = [
        { id: 'ml_interior', name: 'Interior Design', model_id: 'interior', credit_cost: 5 },
        { id: 'ml_floor_planning', name: 'Floor Planning', model_id: 'floor-planning', credit_cost: 5 },
        { id: 'ml_room_decorator', name: 'Room Decorator', model_id: 'room-decorator', credit_cost: 4 },
        { id: 'ml_exterior_restorer', name: 'Exterior Restorer', model_id: 'exterior-restorer', credit_cost: 4 },
        { id: 'ml_scenario_changer', name: 'Scenario Changer', model_id: 'scenario-changer', credit_cost: 4 },
        { id: 'ml_sketch_rendering', name: 'Sketch Rendering', model_id: 'sketch-rendering', credit_cost: 5 },
        { id: 'ml_object_removal', name: 'Object Removal', model_id: 'object-removal', credit_cost: 3 },
        { id: 'ml_interior_mixer', name: 'Interior Mixer', model_id: 'interior-mixer', credit_cost: 5 },
    ];

    for (const api of interiorApis) {
        await sql`
      INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
      VALUES (
        ${api.id},
        'prov_modelslab',
        ${api.name},
        ${api.model_id},
        'image',
        ${api.credit_cost},
        600
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        model_id = EXCLUDED.model_id,
        credit_cost = EXCLUDED.credit_cost
    `;
    }
    console.log(`  ✅ Created ${interiorApis.length} Interior APIs\n`);

    // Summary
    const totalApis = imageGenApis.length + videoApis.length + deepfakeApis.length +
        threeApis.length + chatApis.length + interiorApis.length;

    console.log("═══════════════════════════════════════════════════");
    console.log(`✨ ModelsLab Seed Complete!`);
    console.log(`   Total API Endpoints: ${totalApis}`);
    console.log(`   - Image Generation: ${imageGenApis.length}`);
    console.log(`   - Video:            ${videoApis.length}`);
    console.log(`   - Deepfake:         ${deepfakeApis.length}`);
    console.log(`   - 3D:               ${threeApis.length}`);
    console.log(`   - Chat:             ${chatApis.length}`);
    console.log(`   - Interior:         ${interiorApis.length}`);
    console.log("═══════════════════════════════════════════════════\n");
    console.log("📝 Note: These are API endpoints from ModelsLab documentation.");
    console.log("   Each endpoint may support multiple underlying models internally.");
    console.log("   @see https://docs.modelslab.com for full API reference.\n");
}

seedModelsLab()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    });
