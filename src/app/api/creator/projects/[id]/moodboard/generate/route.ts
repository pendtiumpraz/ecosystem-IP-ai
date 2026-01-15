import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { generateWithAI, GenerationRequest } from "@/lib/ai-generation";

// POST /api/creator/projects/[id]/moodboard/generate
// Generate key actions or prompts for moodboard items

interface GenerateRequestBody {
    moodboardId: string;
    type: "key_actions" | "prompts" | "all_prompts";
    userId: string;
    beatKey?: string; // Optional: generate for specific beat only
    itemId?: string; // Optional: generate for specific item only
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const body: GenerateRequestBody = await request.json();

        const { moodboardId, type, userId, beatKey, itemId } = body;

        if (!moodboardId || !type || !userId) {
            return NextResponse.json(
                { error: "moodboardId, type, and userId are required" },
                { status: 400 }
            );
        }

        // Verify moodboard exists and get related data
        const moodboardData = await sql`
      SELECT 
        m.*,
        sv.structure,
        sv.structure_type,
        sv.premise,
        sv.character_ids,
        sv.hero_beats,
        sv.cat_beats,
        sv.harmon_beats,
        p.title as project_title,
        p.description as project_synopsis
      FROM moodboards m
      JOIN story_versions sv ON sv.id = m.story_version_id
      JOIN projects p ON p.id = m.project_id
      WHERE m.id = ${moodboardId}
        AND m.project_id = ${projectId}
        AND m.deleted_at IS NULL
    `;

        if (moodboardData.length === 0) {
            return NextResponse.json(
                { error: "Moodboard not found" },
                { status: 404 }
            );
        }

        const moodboard = moodboardData[0];
        const keyActionCount = moodboard.key_action_count;

        // Get universe data from universe_versions
        const universeData = await sql`
      SELECT * FROM universe_versions 
      WHERE story_version_id = ${moodboard.story_version_id}
      LIMIT 1
    `;
        const universe = universeData.length > 0 ? universeData[0] : null;

        // Get characters if linked
        let characters: any[] = [];
        if (moodboard.character_ids && moodboard.character_ids.length > 0) {
            characters = await sql`
        SELECT * FROM characters
        WHERE id = ANY(${moodboard.character_ids}::text[])
          AND deleted_at IS NULL
      `;
        }

        // Get items to generate for
        let items: any[];
        if (itemId) {
            items = await sql`
        SELECT * FROM moodboard_items
        WHERE id = ${itemId} AND moodboard_id = ${moodboardId}
      `;
        } else if (beatKey) {
            items = await sql`
        SELECT * FROM moodboard_items
        WHERE moodboard_id = ${moodboardId} AND beat_key = ${beatKey}
        ORDER BY key_action_index ASC
      `;
        } else {
            items = await sql`
        SELECT * FROM moodboard_items
        WHERE moodboard_id = ${moodboardId}
        ORDER BY beat_index ASC, key_action_index ASC
      `;
        }

        if (items.length === 0) {
            return NextResponse.json(
                { error: "No items found to generate" },
                { status: 404 }
            );
        }

        let generatedCount = 0;
        const results: any[] = [];

        if (type === "key_actions") {
            // Generate key actions for beats
            // Group items by beat
            const beatGroups = items.reduce((acc, item) => {
                if (!acc[item.beat_key]) {
                    acc[item.beat_key] = {
                        beatLabel: item.beat_label,
                        beatContent: item.beat_content,
                        items: [],
                    };
                }
                acc[item.beat_key].items.push(item);
                return acc;
            }, {} as Record<string, any>);

            for (const [key, beatData] of Object.entries(beatGroups) as any) {
                // Get beat content from hero_beats/cat_beats/harmon_beats based on structure type
                const structureType = moodboard.structure_type || 'harmon';
                let storyBeats: Record<string, any> = {};
                if (structureType.includes('hero')) storyBeats = moodboard.hero_beats || {};
                else if (structureType.includes('cat') || structureType.includes('save')) storyBeats = moodboard.cat_beats || {};
                else storyBeats = moodboard.harmon_beats || {};

                // Use beat content from moodboard_items or fallback to story beats
                const beatContent = beatData.beatContent || storyBeats[key] || '';

                // Generate key actions for this beat
                const keyActions = await generateKeyActions({
                    userId,
                    projectId,
                    projectTitle: moodboard.project_title,
                    projectSynopsis: moodboard.project_synopsis || moodboard.premise,
                    beatLabel: beatData.beatLabel,
                    beatContent,
                    keyActionCount,
                    characters,
                    universe,
                });

                // Update items with generated key actions
                for (let i = 0; i < beatData.items.length && i < keyActions.length; i++) {
                    const item = beatData.items[i];
                    const keyAction = keyActions[i];

                    await sql`
            UPDATE moodboard_items
            SET 
              key_action_description = ${keyAction.description},
              characters_involved = ${keyAction.characterIds || []},
              universe_level = ${keyAction.universeLevel},
              status = 'has_description',
              updated_at = NOW()
            WHERE id = ${item.id}
          `;

                    generatedCount++;
                    results.push({
                        itemId: item.id,
                        beatKey: key,
                        keyActionIndex: item.key_action_index,
                        description: keyAction.description,
                    });
                }
            }
        } else if (type === "prompts" || type === "all_prompts") {
            // Generate image prompts for items that have key action descriptions
            const itemsWithDescriptions = items.filter(
                (item) => item.key_action_description
            );

            for (const item of itemsWithDescriptions) {
                // Get characters involved in this action
                const involvedCharacters = characters.filter(
                    (c) => item.characters_involved?.includes(c.id)
                );

                const promptResult = await generateImagePrompt({
                    userId,
                    projectId,
                    keyActionDescription: item.key_action_description,
                    characters: involvedCharacters,
                    universeLevel: item.universe_level,
                    universe,
                    artStyle: moodboard.art_style,
                });

                await sql`
          UPDATE moodboard_items
          SET 
            prompt = ${promptResult.prompt},
            negative_prompt = ${promptResult.negativePrompt},
            status = 'has_prompt',
            updated_at = NOW()
          WHERE id = ${item.id}
        `;

                generatedCount++;
                results.push({
                    itemId: item.id,
                    beatKey: item.beat_key,
                    keyActionIndex: item.key_action_index,
                    prompt: promptResult.prompt,
                });
            }
        }

        return NextResponse.json({
            success: true,
            generatedCount,
            results,
            message: `Generated ${generatedCount} ${type}`,
        });
    } catch (error) {
        console.error("Error generating moodboard content:", error);
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
            { error: `Failed to generate content: ${errorMessage}` },
            { status: 500 }
        );
    }
}

// Generate key actions for a beat
async function generateKeyActions(params: {
    userId: string;
    projectId: string;
    projectTitle: string;
    projectSynopsis: string;
    beatLabel: string;
    beatContent: string;
    keyActionCount: number;
    characters: any[];
    universe: any;
}): Promise<{ description: string; characterIds: string[]; universeLevel: string }[]> {
    // Build detailed character list with full info
    // Note: Show ID separately so AI doesn't include it in description text
    const characterList = params.characters
        .map((c) => {
            const details = [
                `Name: ${c.name}`,
                `Role: ${c.role || 'unknown'}`,
                c.gender ? `Gender: ${c.gender}` : null,
                c.ethnicity ? `Ethnicity: ${c.ethnicity}` : null,
                c.description ? `Background: ${c.description}` : null,
            ].filter(Boolean).join(', ');
            return `- ${details} [internal_id: ${c.id}]`;
        })
        .join("\n");

    // Build universe context from actual data
    let universeContext = '';
    if (params.universe) {
        const u = params.universe;
        universeContext = `
UNIVERSE SETTING:
- Name: ${u.universe_name || 'Unknown'}
- Period: ${u.period || 'Unspecified'}

LOCATIONS (use these for universeLevel):
1. room_cave: ${u.room_cave || 'Ruangan privat karakter (kamar tidur, gua rahasia)'}
2. house_castle: ${u.house_castle || 'Rumah/tempat tinggal utama (istana, rumah)'}
3. private_interior: ${u.private_interior || 'Interior ruangan pribadi'}
4. family_circle: ${u.family_inner_circle || 'Lingkaran keluarga/teman dekat'}
5. neighborhood: ${u.neighborhood_environment || 'Lingkungan sekitar tempat tinggal'}
6. town_city: ${u.town_district_city || 'Kota/distrik utama'}
7. workplace: ${u.working_office_school || 'Tempat kerja/sekolah'}
8. country: ${u.country || 'Negara/kerajaan'}
9. government: ${u.government_system || 'Sistem pemerintahan'}
10. society: ${u.society_and_system || 'Struktur masyarakat'}
11. nature_world: ${u.environment_landscape || 'Alam/lanskap'}`;
    } else {
        universeContext = `
UNIVERSE SETTING: Not specified

DEFAULT LOCATIONS (use these for universeLevel):
- room_cave: Ruangan privat karakter
- house_castle: Rumah/tempat tinggal utama
- private_interior: Interior ruangan
- neighborhood: Lingkungan sekitar
- town_city: Kota/area publik
- nature_world: Alam/lanskap`;
    }

    const prompt = `Kamu adalah ahli visual storytelling cinematik profesional.

Berdasarkan story beat berikut, breakdown menjadi TEPAT ${params.keyActionCount} key actions visual yang filmik dan spesifik.

=== PROJECT INFO ===
Title: ${params.projectTitle}
Synopsis: ${params.projectSynopsis || "Belum ada synopsis"}

=== STORY BEAT ===
Beat: ${params.beatLabel}
Description: ${params.beatContent || "Belum ada deskripsi beat"}

=== AVAILABLE CHARACTERS ===
${characterList || "Tidak ada karakter yang terhubung - buat karakter generik"}
${universeContext}

=== REQUIREMENTS ===
Setiap key action HARUS:
1. SPESIFIK dan VISUAL - bisa langsung dijadikan gambar/shot film
2. MELIBATKAN karakter dari list (gunakan NAMA karakter di description, gunakan internal_id untuk characterIds)
3. PILIH universeLevel yang sesuai dari locations di atas
4. DRAMATIS dan meneruskan alur beat
5. Dalam BAHASA INDONESIA
6. 1-2 kalimat yang jelas mendeskripsikan AKSI dan EKSPRESI
7. JANGAN masukkan ID/UUID di dalam description - hanya gunakan NAMA karakter

=== OUTPUT FORMAT (JSON ONLY) ===
{
  "keyActions": [
    {
      "index": 1,
      "description": "Gatotkaca berdiri tegap di atas benteng istana, matanya menatap horizon dengan penuh kekhawatiran saat awan gelap mendekat.",
      "characterIds": ["internal_id dari karakter yang terlibat"],
      "universeLevel": "house_castle"
    }
  ]
}

PENTING: 
- Output HANYA JSON valid, tanpa penjelasan lain
- description: HANYA nama karakter, JANGAN sertakan ID/UUID
- characterIds: gunakan internal_id dari list characters
- Jika tidak ada karakter, gunakan array kosong []
- universeLevel HARUS salah satu dari: room_cave, house_castle, private_interior, neighborhood, town_city, nature_world`;

    const MAX_RETRIES = 2; // Reduced to prevent rate limiting
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genRequest: GenerationRequest = {
                userId: params.userId,
                projectId: params.projectId,
                generationType: "moodboard_key_actions",
                prompt,
            };

            const result = await generateWithAI(genRequest);

            if (!result.success || !result.resultText) {
                throw new Error(result.error || "Generation failed");
            }

            // Parse JSON from result
            let jsonText = result.resultText;

            // Remove markdown code blocks if present
            if (jsonText.includes("```")) {
                const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (match) {
                    jsonText = match[1].trim();
                }
            }

            const parsed = JSON.parse(jsonText);
            console.log(`Key actions generated for ${params.beatLabel} on attempt ${attempt}`);
            return parsed.keyActions || [];
        } catch (error: any) {
            lastError = error;
            console.error(`Attempt ${attempt}/${MAX_RETRIES} failed for ${params.beatLabel}:`, error.message);

            if (attempt < MAX_RETRIES) {
                // Longer wait before retry (3s, 6s) to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
            }
        }
    }

    // All retries failed - return fallback with error indicator
    console.error(`All ${MAX_RETRIES} attempts failed for ${params.beatLabel}. Using fallback.`);
    return Array.from({ length: params.keyActionCount }, (_, i) => ({
        description: `[GENERATION FAILED - Retry needed] Key action ${i + 1} for ${params.beatLabel}`,
        characterIds: [],
        universeLevel: "room_cave",
        error: lastError?.message || "Unknown error",
    }));
}

// Generate image prompt for a key action
async function generateImagePrompt(params: {
    userId: string;
    projectId: string;
    keyActionDescription: string;
    characters: any[];
    universeLevel: string | null;
    universe: any;
    artStyle: string;
}): Promise<{ prompt: string; negativePrompt: string }> {
    // Build character descriptions from physiological JSONB data
    const characterDescriptions = params.characters
        .map((c) => {
            // Get physiological data (stored as JSONB)
            const phys = c.physiological || {};

            const details = [
                c.name,
                c.role ? `(${c.role})` : null,
                // From physiological JSONB: head, face, body, attribute, outfit, hairStyle, uniqueness
                phys.body,
                phys.face,
                phys.hairStyle,
                phys.head,
                phys.outfit ? `wearing ${phys.outfit}` : null,
                phys.attribute,
                phys.uniqueness,
            ].filter(Boolean);
            return `- ${details.join(", ")}`;
        })
        .join("\n");

    const artStyleDescriptions: Record<string, string> = {
        realistic: "cinematic movie still, photorealistic, high detail, dramatic lighting",
        anime: "Japanese anime style, vibrant colors, clean line art, expressive",
        ghibli: "Studio Ghibli watercolor style, soft colors, dreamlike atmosphere",
        disney: "3D Pixar/Disney style, polished, colorful, family-friendly",
        comic: "Comic book style, bold lines, dynamic composition, action-oriented",
        noir: "Film noir style, high contrast, black and white, moody shadows",
    };

    const styleDescription = artStyleDescriptions[params.artStyle] || artStyleDescriptions.realistic;

    // Get location description from universe if available
    let locationDescription = params.universeLevel || "unspecified location";
    if (params.universe && params.universeLevel) {
        const u = params.universe;
        const locationMap: Record<string, string> = {
            room_cave: u.room_cave,
            house_castle: u.house_castle,
            private_interior: u.private_interior,
            neighborhood: u.neighborhood_environment,
            town_city: u.town_district_city,
            workplace: u.working_office_school,
            nature_world: u.environment_landscape,
        };
        locationDescription = locationMap[params.universeLevel] || params.universeLevel;
    }

    const prompt = `Kamu adalah visual development artist profesional untuk film dan animasi.

Buat image generation prompt dalam format YAML yang detail untuk AI image generation.

=== INSTRUKSI UTAMA ===
***PENTING: Prompt yang dihasilkan WAJIB menggambarkan aksi spesifik ini:***
"${params.keyActionDescription}"

Scene, karakter, pose, dan aksi dalam prompt HARUS sesuai dengan key action di atas. JANGAN membuat scene yang berbeda!

=== CHARACTERS INVOLVED ===
${characterDescriptions || "No specific characters - use generic figures"}

=== LOCATION/SETTING (sebagai referensi, sesuaikan dengan key action) ===
${locationDescription}
${params.universe ? `
Period: ${params.universe.period || 'Not specified'}
Environment: ${params.universe.environment_landscape || 'Not specified'}
` : ''}

=== TARGET ART STYLE ===
${params.artStyle}: ${styleDescription}

=== OUTPUT FORMAT ===
{
  "prompt": "YAML format dengan struktur berikut:
scene: [lokasi SESUAI dengan key action, bukan lokasi random]
characters:
  - name: [nama]
    appearance: [deskripsi fisik lengkap: gender, ethnicity, rambut, mata, pakaian]
    expression: [ekspresi wajah SESUAI key action]
    pose: [posisi/gerakan SESUAI dengan aksi di key action]
action: [aksi PERSIS seperti yang disebutkan di key action]
mood: [suasana/atmosfer]
lighting: [tipe pencahayaan]
camera: [sudut kamera: wide shot, medium shot, close-up, dll]
style: ${styleDescription}",
  "negativePrompt": "blurry, low quality, distorted proportions, extra limbs, text, watermark, signature, cropped, bad anatomy"
}

PENTING:
- Prompt HARUS dalam BAHASA INGGRIS
- Scene harus SESUAI dengan key action "${params.keyActionDescription.substring(0, 50)}..."
- Include semua detail visual karakter untuk konsistensi
- Format YAML untuk memudahkan parsing
- Keep under 200 words
- Output HANYA JSON valid`;

    const MAX_RETRIES = 2; // Reduced to prevent rate limiting
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            const genRequest: GenerationRequest = {
                userId: params.userId,
                projectId: params.projectId,
                generationType: "moodboard_prompt",
                prompt,
            };

            const result = await generateWithAI(genRequest);

            if (!result.success || !result.resultText) {
                throw new Error(result.error || "Generation failed");
            }

            // Parse JSON from result
            let jsonText = result.resultText;

            // Remove markdown code blocks if present
            if (jsonText.includes("```")) {
                const match = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
                if (match) {
                    jsonText = match[1].trim();
                }
            }

            const parsed = JSON.parse(jsonText);
            console.log(`Image prompt generated on attempt ${attempt}`);
            return {
                prompt: parsed.prompt || params.keyActionDescription,
                negativePrompt: parsed.negativePrompt || "blurry, low quality, distorted, text, watermark",
            };
        } catch (error: any) {
            lastError = error;
            console.error(`Image prompt attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

            if (attempt < MAX_RETRIES) {
                // Longer wait before retry to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 3000 * attempt));
            }
        }
    }

    // All retries failed
    console.error(`All ${MAX_RETRIES} attempts failed for image prompt. Using fallback.`);
    return {
        prompt: `[GENERATION FAILED] ${params.keyActionDescription}, ${styleDescription}`,
        negativePrompt: "blurry, low quality, distorted, text, watermark",
    };
}
