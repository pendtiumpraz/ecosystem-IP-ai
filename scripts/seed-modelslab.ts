/**
 * ModelsLab AI Provider Seeder
 * Seeds ModelsLab API endpoints based on official documentation
 * @see https://docs.modelslab.com
 * 
 * NOTE: Uses existing DB enum types (text, image, video, audio, multimodal)
 * until migration adds new types. The admin UI shows detailed categories.
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
    // All endpoints with PROPER categorization
    // Based on official ModelsLab documentation
    // @see https://docs.modelslab.com
    // 
    // NOTE: Using existing enum types until migration adds new ones
    // ========================================

    // ========== TEXT-TO-IMAGE ==========
    console.log("🖼️ Creating Text-to-Image APIs...");
    const textToImageApis = [
        { id: 'ml_t2i_sd', name: 'Stable Diffusion Text to Image', model_id: 'text-to-image' },
        { id: 'ml_t2i_flux', name: 'FLUX Text to Image', model_id: 'flux-text-to-image' },
    ];

    for (const api of textToImageApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'image', 3, 100)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${textToImageApis.length} Text-to-Image APIs\n`);

    // ========== IMAGE-TO-IMAGE ==========
    console.log("🖼️➡️🖼️ Creating Image-to-Image APIs...");
    const imageToImageApis = [
        { id: 'ml_i2i_sd', name: 'Stable Diffusion Image to Image', model_id: 'image-to-image' },
        { id: 'ml_i2i_controlnet', name: 'ControlNet', model_id: 'controlnet' },
    ];

    for (const api of imageToImageApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'image', 3, 110)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${imageToImageApis.length} Image-to-Image APIs\n`);

    // ========== INPAINTING ==========
    console.log("🎨 Creating Inpainting APIs...");
    const inpaintingApis = [
        { id: 'ml_inpaint', name: 'Inpainting', model_id: 'inpainting' },
    ];

    for (const api of inpaintingApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'image', 4, 120)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${inpaintingApis.length} Inpainting APIs\n`);

    // ========== TEXT-TO-VIDEO ==========
    console.log("📹 Creating Text-to-Video APIs...");
    const textToVideoApis = [
        { id: 'ml_t2v_std', name: 'Text to Video', model_id: 'text-to-video' },
        { id: 'ml_t2v_ultra', name: 'Text to Video Ultra (HD)', model_id: 'text-to-video-ultra' },
    ];

    for (const api of textToVideoApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'video', 15, 200)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${textToVideoApis.length} Text-to-Video APIs\n`);

    // ========== IMAGE-TO-VIDEO ==========
    console.log("🖼️➡️📹 Creating Image-to-Video APIs...");
    const imageToVideoApis = [
        { id: 'ml_i2v_std', name: 'Image to Video', model_id: 'image-to-video' },
        { id: 'ml_i2v_ultra', name: 'Image to Video Ultra (HD)', model_id: 'image-to-video-ultra' },
        { id: 'ml_scene_maker', name: 'Scene Maker', model_id: 'scene-maker' },
    ];

    for (const api of imageToVideoApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'video', 12, 210)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${imageToVideoApis.length} Image-to-Video APIs\n`);

    // ========== VIDEO-TO-VIDEO ==========
    console.log("📹➡️📹 Creating Video Editing APIs...");
    const videoEditApis = [
        { id: 'ml_v2v_watermark', name: 'Watermark Remover', model_id: 'watermark-remover' },
    ];

    for (const api of videoEditApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'video', 8, 220)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${videoEditApis.length} Video Editing APIs\n`);

    // ========== FACE SWAP (Image) ==========
    console.log("😊 Creating Face Swap (Image) APIs...");
    const faceSwapApis = [
        { id: 'ml_fs_specific', name: 'Specific Face Swap', model_id: 'specific-face-swap' },
        { id: 'ml_fs_multiple', name: 'Multiple Face Swap', model_id: 'multiple-face-swap' },
    ];

    for (const api of faceSwapApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'image', 6, 300)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${faceSwapApis.length} Face Swap APIs\n`);

    // ========== FACE SWAP (Video) ==========
    console.log("🎭 Creating Face Swap (Video) APIs...");
    const faceSwapVideoApis = [
        { id: 'ml_fsv_single', name: 'Single Video Face Swap', model_id: 'single-video-swap' },
        { id: 'ml_fsv_specific', name: 'Specific Video Face Swap', model_id: 'specific-video-swap' },
    ];

    for (const api of faceSwapVideoApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'video', 18, 310)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${faceSwapVideoApis.length} Face Swap Video APIs\n`);

    // ========== TEXT-TO-3D ==========
    console.log("🎮 Creating Text-to-3D APIs...");
    const textTo3dApis = [
        { id: 'ml_t23d', name: 'Text to 3D', model_id: 'text-to-3d' },
    ];

    for (const api of textTo3dApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'multimodal', 10, 400)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${textTo3dApis.length} Text-to-3D APIs\n`);

    // ========== IMAGE-TO-3D ==========
    console.log("🖼️➡️🎮 Creating Image-to-3D APIs...");
    const imageTo3dApis = [
        { id: 'ml_i23d', name: 'Image to 3D', model_id: 'image-to-3d' },
    ];

    for (const api of imageTo3dApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'multimodal', 8, 410)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${imageTo3dApis.length} Image-to-3D APIs\n`);

    // ========== LLM/CHAT ==========
    console.log("💬 Creating LLM/Chat APIs...");
    const chatApis = [
        { id: 'ml_chat', name: 'Chat Completions', model_id: 'chat-completions' },
        { id: 'ml_uncensored', name: 'Uncensored Chat', model_id: 'uncensored-chat' },
    ];

    for (const api of chatApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'text', 2, 50)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${chatApis.length} LLM/Chat APIs\n`);

    // ========== INTERIOR ==========
    console.log("🏠 Creating Interior APIs...");
    const interiorApis = [
        { id: 'ml_int_design', name: 'Interior Design', model_id: 'interior' },
        { id: 'ml_int_floor', name: 'Floor Planning', model_id: 'floor-planning' },
        { id: 'ml_int_room', name: 'Room Decorator', model_id: 'room-decorator' },
        { id: 'ml_int_exterior', name: 'Exterior Restorer', model_id: 'exterior-restorer' },
        { id: 'ml_int_scenario', name: 'Scenario Changer', model_id: 'scenario-changer' },
        { id: 'ml_int_sketch', name: 'Sketch Rendering', model_id: 'sketch-rendering' },
        { id: 'ml_int_remove', name: 'Object Removal', model_id: 'object-removal' },
        { id: 'ml_int_mixer', name: 'Interior Mixer', model_id: 'interior-mixer' },
    ];

    for (const api of interiorApis) {
        await sql`
          INSERT INTO ai_models (id, provider_id, name, model_id, type, credit_cost, sort_order)
          VALUES (${api.id}, 'prov_modelslab', ${api.name}, ${api.model_id}, 'image', 5, 600)
          ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, model_id = EXCLUDED.model_id
        `;
    }
    console.log(`  ✅ Created ${interiorApis.length} Interior APIs\n`);

    // Summary
    const total = textToImageApis.length + imageToImageApis.length + inpaintingApis.length +
        textToVideoApis.length + imageToVideoApis.length + videoEditApis.length +
        faceSwapApis.length + faceSwapVideoApis.length +
        textTo3dApis.length + imageTo3dApis.length +
        chatApis.length + interiorApis.length;

    console.log("═══════════════════════════════════════════════════");
    console.log(`✨ ModelsLab Seed Complete!`);
    console.log(`   Total API Endpoints: ${total}`);
    console.log(`   Categories:`);
    console.log(`   - Text-to-Image:    ${textToImageApis.length}`);
    console.log(`   - Image-to-Image:   ${imageToImageApis.length}`);
    console.log(`   - Inpainting:       ${inpaintingApis.length}`);
    console.log(`   - Text-to-Video:    ${textToVideoApis.length}`);
    console.log(`   - Image-to-Video:   ${imageToVideoApis.length}`);
    console.log(`   - Video Editing:    ${videoEditApis.length}`);
    console.log(`   - Face Swap:        ${faceSwapApis.length}`);
    console.log(`   - Face Swap Video:  ${faceSwapVideoApis.length}`);
    console.log(`   - Text-to-3D:       ${textTo3dApis.length}`);
    console.log(`   - Image-to-3D:      ${imageTo3dApis.length}`);
    console.log(`   - LLM/Chat:         ${chatApis.length}`);
    console.log(`   - Interior:         ${interiorApis.length}`);
    console.log("═══════════════════════════════════════════════════\n");
    console.log("📝 Note: Models use existing DB types (text, image, video, audio, multimodal)");
    console.log("   The admin UI shows detailed categorization based on model_id.\n");
}

seedModelsLab()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seed failed:", err);
        process.exit(1);
    });
