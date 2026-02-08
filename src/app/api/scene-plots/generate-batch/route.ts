import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import { ScenePlot, CreateScenePlotRequest } from '@/types/storyboard';

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SCENE_PLOT_SYSTEM = `Kamu adalah penulis skenario profesional Indonesia. Tugasmu adalah membuat plot scene detail yang menjaga kontinuitas cerita dan alur naratif.

PENTING: SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA!

KONTEKS IP PROJECT (WAJIB DIIKUTI):
- GENRE yang diberikan harus menentukan gaya penulisan scene (action, drama, romance, thriller, dll)
- TONE yang diberikan harus menentukan suasana dan emosi scene (dark, light, comedic, serious, dll)
- VISUAL STYLE yang diberikan harus menentukan bagaimana lokasi dan adegan digambarkan

Untuk setiap scene, kamu akan membuat:
1. Judul yang menarik (singkat, deskriptif) - BAHASA INDONESIA, sesuai GENRE
2. Sinopsis detail (apa yang terjadi di scene) - BAHASA INDONESIA, gaya penulisan sesuai TONE
3. Emotional beat (apa yang penonton harus rasakan) - BAHASA INDONESIA
4. Detail lokasi - BAHASA INDONESIA, sesuai VISUAL STYLE
5. Waktu (siang/malam)
6. Karakter yang terlibat (HANYA karakter yang relevan di scene INI, max 4-5)
7. Props atau elemen penting

ATURAN KRITIS - WAJIB DIIKUTI:
1. IKUTI IP PROJECT: Gaya penulisan HARUS sesuai dengan GENRE, TONE, dan VISUAL STYLE yang diberikan
2. KONTINUITAS CERITA: Setiap scene harus mengikuti logis dari scene sebelumnya
3. TIDAK ADA DUPLIKAT: Setiap scene HARUS UNIK. Jangan pernah mengulang atau memparafrase konten dari scene sebelumnya
4. PROGRESI: Setiap scene harus memajukan plot atau pengembangan karakter
5. KONTEKS SPESIFIK: Gunakan deskripsi story beat untuk memandu tujuan setiap scene
6. KARAKTER - SANGAT PENTING: 
   - JANGAN masukkan SEMUA karakter!
   - Pilih HANYA 2-4 karakter yang AKTIF dan RELEVAN di scene tersebut
   - Karakter yang tidak punya dialog atau aksi TIDAK boleh dimasukkan
   - Setiap scene harus punya fokus karakter yang berbeda

Ketika scene sebelumnya diberikan, baca dengan teliti dan pastikan scene baru:
- Melanjutkan cerita secara natural
- Memperkenalkan event, konflik, atau perkembangan BARU
- Gunakan lokasi BERBEDA jika sesuai untuk variasi
- Tunjukkan PERTUMBUHAN atau perubahan karakter dari scene sebelumnya

PENTING: Output HANYA JSON array valid, tanpa markdown, tanpa penjelasan.

Struktur JSON (array of scenes):
[
  {
    "sceneNumber": <number>,
    "title": "<judul singkat deskriptif dalam BAHASA INDONESIA - sesuai GENRE>",
    "synopsis": "<deskripsi detail 2-3 paragraf dalam BAHASA INDONESIA - gaya penulisan sesuai TONE dari IP Project>",
    "emotionalBeat": "<apa yang penonton harus rasakan - BAHASA INDONESIA>",
    "location": "<di mana scene berlangsung - BAHASA INDONESIA, sesuai VISUAL STYLE>",
    "locationDescription": "<deskripsi visual singkat lokasi sesuai VISUAL STYLE - BAHASA INDONESIA>",
    "timeOfDay": "day" | "night" | "dawn" | "dusk",
    "characters": ["HANYA 2-4 nama karakter yang AKTIF di scene ini - JANGAN semua karakter!"],
    "props": ["<props atau elemen penting>"],
    "estimatedDuration": <detik, biasanya 30-90>
  }
]`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            userId,
            storyVersionId, // Add this to be passed from client
            sceneNumbers, // Array of scene numbers to generate
            synopsis,
            storyBeats, // Map of sceneNumber -> { beatId, beatName, beatDescription }
            previousScenesSummary, // Summary of scenes before the first in this batch
            characters, // Array of { id, name, imageUrl, personality, role }
            locations, // Array of { name, description, imageUrl }
            genre,
            tone,
            visualStyle,
            wantNeedMatrix, // { want: {...}, need: {...} }
            endingType // happy, tragic, bittersweet, etc
        } = body;

        if (!projectId || !sceneNumbers || sceneNumbers.length === 0) {
            return NextResponse.json(
                { error: 'projectId and sceneNumbers are required' },
                { status: 400 }
            );
        }

        // Use story synopsis for context, or fallback to generic prompt
        const storySynopsis = synopsis || 'Generate scene based on the story beat and character context provided.';

        // Get user tier
        const tier = await getUserTier(userId);
        const creditCost = 3 * Math.ceil(sceneNumbers.length / 3); // Scale by batch size

        // Check credits if userId provided
        if (userId) {
            const hasCredits = await checkCredits(userId, creditCost);
            if (!hasCredits) {
                return NextResponse.json(
                    { error: 'Insufficient credits', required: creditCost },
                    { status: 402 }
                );
            }
        }

        // Build character context with selection instruction
        const characterContext = characters?.length > 0
            ? `\nAVAILABLE CHARACTERS (PILIH HANYA 2-4 yang relevan untuk setiap scene!):\n${characters.map((c: { name: string; role?: string; personality?: string }) =>
                `- ${c.name}${c.role ? ` (${c.role})` : ''}${c.personality ? `: ${c.personality}` : ''}`
            ).join('\n')}\n\n⚠️ JANGAN MASUKKAN SEMUA KARAKTER! Setiap scene HANYA butuh 1-4 karakter yang AKTIF di scene tersebut.`
            : '';

        // Build location context
        const locationContext = locations?.length > 0
            ? `\nAVAILABLE LOCATIONS:\n${locations.map((l: { name: string; description?: string }) =>
                `- ${l.name}${l.description ? `: ${l.description}` : ''}`
            ).join('\n')}`
            : '';

        // Build story beat assignments
        const beatAssignments = sceneNumbers.map((num: number) => {
            const beat = storyBeats?.[num];
            return beat
                ? `Scene ${num}: Part of "${beat.beatName}" - ${beat.beatDescription || ''}`
                : `Scene ${num}: General story progression`;
        }).join('\n');

        // Build want/need context (V2 structure - journey-based)
        const wantNeedContext = wantNeedMatrix ? `
CHARACTER ARC - WANT vs NEED JOURNEY (SANGAT PENTING untuk story progression):

WANT JOURNEY (Keinginan Eksternal yang DISADARI):
${wantNeedMatrix.wantStages ? `1. MENGINGINKAN: ${wantNeedMatrix.wantStages.menginginkan || '-'}
2. MEMASTIKAN: ${wantNeedMatrix.wantStages.memastikan || '-'}
3. MENGEJAR: ${wantNeedMatrix.wantStages.mengejar || '-'}
4. TERCAPAI: ${wantNeedMatrix.wantStages.tercapai === true ? 'YA ✓' : wantNeedMatrix.wantStages.tercapai === false ? 'TIDAK ✗' : 'Belum ditentukan'}` : 'Tidak ada data WANT stages'}

NEED JOURNEY (Kebutuhan Internal yang TIDAK DISADARI):
${wantNeedMatrix.needStages ? `1. MEMBUTUHKAN: ${wantNeedMatrix.needStages.membutuhkan || '-'}
2. MENEMUKAN: ${wantNeedMatrix.needStages.menemukan || '-'}
3. MENERIMA: ${wantNeedMatrix.needStages.menerima || '-'}
4. TERPENUHI: ${wantNeedMatrix.needStages.terpenuhi === true ? 'YA ✓' : wantNeedMatrix.needStages.terpenuhi === false ? 'TIDAK ✗' : 'Belum ditentukan'}` : 'Tidak ada data NEED stages'}

⚠️ SETIAP SCENE HARUS menunjukkan progres journey ini:
- Scene awal: Karakter fokus pada WANT (menginginkan/memastikan)
- Scene tengah: Karakter mengejar WANT tapi mulai aware tentang NEED
- Scene akhir: Karakter menemukan/menerima NEED, dan WANT resolved sesuai ending` : '';

        const endingContext = endingType ? `
ENDING TYPE: ${endingType}
${endingType === 'happy' ? '- Happy Ending: Want tercapai DAN Need terpenuhi' : ''}
${endingType === 'bittersweet' ? '- Bittersweet: Want TIDAK tercapai tapi Need terpenuhi (karakter bertumbuh)' : ''}
${endingType === 'hollow' ? '- Hollow Victory: Want tercapai tapi Need TIDAK terpenuhi (kemenangan kosong)' : ''}
${endingType === 'tragic' ? '- Tragic: Want TIDAK tercapai DAN Need TIDAK terpenuhi' : ''}
- Semua scene harus membangun menuju ending type ini` : '';

        const userPrompt = `Generate detailed scene plots for scenes ${sceneNumbers.join(', ')}.

STORY SYNOPSIS:
${storySynopsis}

GENRE: ${genre || 'Not specified'}
TONE: ${tone || 'Not specified'}
VISUAL STYLE: ${visualStyle || 'Not specified'}
${endingContext}
${wantNeedContext}
${characterContext}
${locationContext}

SCENE ASSIGNMENTS (story beat each scene belongs to):
${beatAssignments}

${previousScenesSummary ? `PREVIOUS SCENES SUMMARY (for continuity):
${previousScenesSummary}` : 'This is the beginning of the story.'}

Generate ${sceneNumbers.length} scene(s) with scene numbers: ${sceneNumbers.join(', ')}.

MANDATORY REQUIREMENTS:
1. Each scene MUST be completely UNIQUE - no repeated content from previous scenes
2. Each scene MUST advance the plot - something NEW must happen
3. Flow naturally from previous scenes (if any) - continue the story, don't restart it
4. Match the story beat purpose for each scene
5. ⚠️ KARAKTER: PILIH HANYA 2-4 karakter per scene! JANGAN copy semua karakter! Hanya yang punya dialog/aksi di scene itu.
6. Use variety in locations - don't repeat the same location for every scene
7. SEMUA output dalam BAHASA INDONESIA
8. Scene harus menunjukkan karakter mengejar WANT sambil perlahan menemukan NEED
9. Scene harus konsisten dengan ENDING TYPE yang dipilih`;

        // Call AI via unified provider system
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: SCENE_PLOT_SYSTEM,
            maxTokens: 4000,
            temperature: 0.8,
            tier,
        });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'Failed to generate scene plots' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let scenePlots: Array<{
            sceneNumber: number;
            title: string;
            synopsis: string;
            emotionalBeat: string;
            location: string;
            locationDescription?: string;
            timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
            characters: string[];
            props?: string[];
            estimatedDuration: number;
        }>;

        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            scenePlots = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Insert scenes into database
        const createdScenes: ScenePlot[] = [];

        for (const plot of scenePlots) {
            const beat = storyBeats?.[plot.sceneNumber];

            // Map character names to character objects if available
            const charactersInvolved = plot.characters?.map((name: string) => {
                const char = characters?.find((c: { name: string }) =>
                    c.name.toLowerCase() === name.toLowerCase()
                );
                return char
                    ? { id: char.id, name: char.name, imageUrl: char.imageUrl, role: char.role }
                    : { name };
            }) || [];

            const sceneData: CreateScenePlotRequest = {
                project_id: projectId,
                scene_number: plot.sceneNumber,
                title: plot.title,
                synopsis: plot.synopsis,
                emotional_beat: plot.emotionalBeat,
                story_beat_id: beat?.beatId,
                story_beat_name: beat?.beatName,
                location: plot.location,
                time_of_day: plot.timeOfDay || 'day',
                characters_involved: charactersInvolved,
                estimated_duration: plot.estimatedDuration || 60
            };

            // Get story_version_id for this project
            let versionId = storyVersionId;
            if (!versionId) {
                const versionResult = await sql`
                    SELECT sv.id FROM story_versions sv
                    JOIN stories s ON sv.story_id = s.id
                    WHERE s.project_id = ${projectId}
                    ORDER BY sv.created_at DESC
                    LIMIT 1
                `;
                versionId = versionResult[0]?.id;
            }

            if (!versionId) {
                console.error('No story_version_id found for project:', projectId);
                continue;
            }

            console.log('[Scene Plots Generate] UPDATE params:', {
                versionId,
                versionIdType: typeof versionId,
                sceneNumber: plot.sceneNumber,
                title: plot.title
            });

            // UPDATE existing scene with generated plot data
            const updateResult = await sql`
                UPDATE scene_plots SET
                    scene_title = ${plot.title || null},
                    scene_description = ${plot.synopsis || null},
                    scene_location = ${plot.location || null},
                    scene_time = ${plot.timeOfDay || 'day'},
                    emotional_beat = ${plot.emotionalBeat || null},
                    characters_present = ${plot.characters || []}::text[],
                    updated_at = NOW()
                WHERE story_version_id = CAST(${versionId} AS uuid)
                AND scene_number = ${plot.sceneNumber}
                RETURNING *
            `;

            if (updateResult[0]) {
                createdScenes.push(updateResult[0] as ScenePlot);
            }
        }

        // Update project storyboard_config status
        await sql`
            UPDATE projects
            SET storyboard_config = COALESCE(storyboard_config, '{}'::jsonb) || 
                '{"generationStatus": "generating_plots"}'::jsonb,
                updated_at = NOW()
            WHERE id = ${projectId}
        `;

        // Deduct credits if userId provided
        if (userId) {
            await deductCredits(
                userId,
                creditCost,
                "text_generation",
                `scene_batch_${Date.now()}`,
                `Scene plot batch generation`
            );
        }

        return NextResponse.json({
            success: true,
            scenes: createdScenes,
            count: createdScenes.length,
            creditsUsed: creditCost,
            provider: aiResult.provider
        });
    } catch (error: any) {
        console.error('Error generating scene plots:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate scene plots',
                details: error?.message || String(error),
                stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
            },
            { status: 500 }
        );
    }
}
