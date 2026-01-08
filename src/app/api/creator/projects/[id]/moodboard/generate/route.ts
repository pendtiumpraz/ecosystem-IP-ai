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
        p.title as project_title,
        p.synopsis as project_synopsis,
        p.universe
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

        // Get characters if linked
        let characters: any[] = [];
        if (moodboard.character_ids && moodboard.character_ids.length > 0) {
            characters = await sql`
        SELECT id, name, role, archetype, gender, ethnicity,
               hair_color, hair_style, eye_color, body_type,
               clothing_style, uniqueness, brief as description
        FROM characters
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
                // Generate key actions for this beat
                const keyActions = await generateKeyActions({
                    userId,
                    projectId,
                    projectTitle: moodboard.project_title,
                    projectSynopsis: moodboard.project_synopsis,
                    beatLabel: beatData.beatLabel,
                    beatContent: beatData.beatContent,
                    keyActionCount,
                    characters,
                    universe: moodboard.universe,
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
                    universe: moodboard.universe,
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
        return NextResponse.json(
            { error: "Failed to generate content" },
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
    const characterList = params.characters
        .map((c) => `- ${c.name} (${c.role}): ${c.archetype || ""}`)
        .join("\n");

    const universeLocations = `
- room_cave: Ruangan privat karakter
- house_castle: Rumah/tempat tinggal utama
- private_interior: Interior ruangan
- private_exterior: Halaman/exterior privat
- village_kingdom: Area publik lingkungan
- city_galaxy: Kota/dunia luas
- nature_cosmos: Alam bebas/kosmos
  `.trim();

    const prompt = `Kamu adalah ahli visual storytelling cinematik.

Berdasarkan story beat berikut, breakdown menjadi ${params.keyActionCount} key actions visual yang filmik.

PROJECT: ${params.projectTitle}
SYNOPSIS: ${params.projectSynopsis || "N/A"}

BEAT: ${params.beatLabel}
BEAT DESCRIPTION: ${params.beatContent || "N/A"}

AVAILABLE CHARACTERS:
${characterList || "Tidak ada karakter yang terhubung"}

UNIVERSE LOCATIONS (pilih yang sesuai untuk setiap aksi):
${universeLocations}

Setiap key action harus:
1. Spesifik dan visual (bisa dijadikan gambar)
2. Melibatkan minimal 1 karakter dari list (jika ada)
3. Sesuai dengan universe location
4. Meneruskan alur beat secara dramatis

Output JSON:
{
  "keyActions": [
    {
      "index": 1,
      "description": "Aksi visual spesifik dalam 1-2 kalimat bahasa Indonesia",
      "characterIds": ["id1", "id2"],
      "universeLevel": "room_cave"
    }
  ]
}`;

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
        return parsed.keyActions || [];
    } catch (error) {
        console.error("Error generating key actions:", error);
        // Return empty array with placeholder descriptions
        return Array.from({ length: params.keyActionCount }, (_, i) => ({
            description: `Key action ${i + 1} for ${params.beatLabel}`,
            characterIds: [],
            universeLevel: "room_cave",
        }));
    }
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
    const characterDescriptions = params.characters
        .map((c) => {
            const details = [
                c.name,
                c.gender,
                c.ethnicity,
                c.hair_style && c.hair_color ? `${c.hair_style} ${c.hair_color} hair` : null,
                c.eye_color ? `${c.eye_color} eyes` : null,
                c.body_type ? `${c.body_type} build` : null,
                c.clothing_style ? `wearing ${c.clothing_style}` : null,
                c.uniqueness,
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

    const prompt = `Kamu adalah visual development artist profesional.

Buat image generation prompt DALAM BAHASA INGGRIS untuk AI image generation.

KEY ACTION: ${params.keyActionDescription}

CHARACTERS INVOLVED:
${characterDescriptions || "No specific characters"}

SETTING: ${params.universeLevel || "unspecified location"}

ART STYLE: ${params.artStyle} (${styleDescription})

IMPORTANT:
- Focus on the ACTION and EMOTION
- Include character appearance details for consistency
- Describe lighting, camera angle, and mood
- Keep prompt under 150 words
- Use English only

Output JSON:
{
  "prompt": "A detailed image generation prompt in English...",
  "negativePrompt": "blurry, low quality, distorted, text, watermark"
}`;

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
        return {
            prompt: parsed.prompt || params.keyActionDescription,
            negativePrompt: parsed.negativePrompt || "blurry, low quality, distorted, text, watermark",
        };
    } catch (error) {
        console.error("Error generating image prompt:", error);
        return {
            prompt: `${params.keyActionDescription}, ${styleDescription}`,
            negativePrompt: "blurry, low quality, distorted, text, watermark",
        };
    }
}
