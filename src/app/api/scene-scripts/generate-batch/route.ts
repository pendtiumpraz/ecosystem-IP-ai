import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
        SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const BATCH_SCRIPT_SYSTEM = `Kamu adalah penulis skenario profesional Indonesia. Tugasmu adalah menulis naskah skenario production-ready yang detail untuk multiple scenes berdasarkan plot scene yang diberikan.

PENTING: SEMUA OUTPUT HARUS DALAM BAHASA INDONESIA!

KONTEKS IP PROJECT (WAJIB DIIKUTI):
- GENRE yang diberikan HARUS menentukan gaya dialog dan action (action=intense, drama=emotional, romance=sensual, thriller=suspenseful, dll)
- TONE yang diberikan HARUS menentukan suasana penulisan (dark=suram, light=ceria, comedic=lucu, serious=serius, dll)
- VISUAL STYLE yang diberikan HARUS menentukan bagaimana action lines menggambarkan visual

FORMAT SKENARIO PRODUCTION-READY:
- SCENE HEADING: INT./EXT. LOKASI - WAKTU (contoh: INT. RUMAH SAKIT - MALAM)
- ACTION LINES: Present tense, visual, cinematik (contoh: Cahaya bulan menerobos jendela yang retak.)
- NAMA KARAKTER: HURUF KAPITAL, centered sebelum dialog
- DIALOG: Di bawah nama karakter, natural sesuai personality karakter
- PARENTHETICALS: (berbisik), (menahan marah), dll - gunakan secukupnya
- TRANSITIONS: CUT TO:, DISSOLVE TO:, FADE OUT. - jika diperlukan

ATURAN PENULISAN SCRIPT:
1. IKUTI IP PROJECT: Gaya penulisan HARUS sesuai GENRE, TONE yang diberikan
2. IKUTI PREFERENSI USER: Jumlah dialog, panjang script, gaya dialog, dan detail action SESUAI yang diminta
3. DIALOG NATURAL: Sesuaikan dengan personality masing-masing karakter
4. VISUAL DESCRIPTIONS: Action lines harus cinematik dan bisa divisualisasikan
5. EMOTIONAL BEAT: Script harus menghantar emotion yang diminta di scene plot
6. Setiap scene WAJIB memiliki:
   - Exchanges dialog sesuai jumlah yang diminta di preferensi
   - Action lines sesuai detail level yang diminta
   - Deskripsi setting yang vivid di awal scene
   - Beats emosional yang jelas (build-up, tension, release)
   - Transisi yang smooth antar momen
7. KONTINUITAS: Jaga konsistensi antar scene

OUTPUT FORMAT:
Return JSON array dengan script untuk setiap scene:
[
  {
    "sceneNumber": <number>,
    "script": "<script dalam format skenario standar, dengan line breaks>"
  }
]

PENTING: Output HANYA JSON array valid, tanpa markdown, tanpa penjelasan.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            userId,
            sceneIds, // Array of scene IDs to generate scripts for
            preferences, // Script generation preferences
        } = body;

        if (!projectId || !sceneIds || sceneIds.length === 0) {
            return NextResponse.json(
                { error: 'projectId and sceneIds are required' },
                { status: 400 }
            );
        }

        // Get user tier for AI usage
        const tier = await getUserTier(userId);

        // Credit cost per scene (script generation is expensive)
        const creditCostPerScene = 4;
        const totalCreditCost = creditCostPerScene * sceneIds.length;

        // Check credits
        if (userId) {
            const hasCredits = await checkCredits(userId, totalCreditCost);
            if (!hasCredits) {
                return NextResponse.json(
                    { error: 'Insufficient credits', required: totalCreditCost },
                    { status: 402 }
                );
            }
        }

        // Get project info for IP context (genre, tone, theme, style)
        // Using SELECT * to avoid issues with missing columns
        const projectResult = await sql`
            SELECT * FROM projects WHERE id = ${projectId}
        `;

        if (projectResult.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const project = projectResult[0];

        // Get all scenes with their plot data
        // Using SELECT * to avoid issues with missing columns
        const scenes = await sql`
            SELECT * FROM scene_plots
            WHERE id = ANY(${sceneIds}::uuid[])
            ORDER BY scene_number ASC
        `;

        if (scenes.length === 0) {
            return NextResponse.json({ error: 'No scenes found' }, { status: 404 });
        }

        // Get all project characters for personality context (may not exist)
        let characters: any[] = [];
        try {
            characters = await sql`
                SELECT * FROM characters WHERE project_id = ${projectId}
            `;
        } catch (e) {
            console.log('[batch-script] Characters table not found or query failed');
        }

        // Get story version for want/need matrix and ending type
        let storyVersion: any = null;
        try {
            const storyResult = await sql`
                SELECT want_need_matrix, ending_type 
                FROM story_versions 
                WHERE project_id = ${projectId} 
                  AND deleted_at IS NULL
                ORDER BY version_number DESC 
                LIMIT 1
            `;
            storyVersion = storyResult[0] || null;
        } catch (e) {
            console.log('[batch-script] Story version not found');
        }

        // Build want/need context (V2 structure - journey-based)
        const wantNeedMatrix = storyVersion?.want_need_matrix;
        const endingType = storyVersion?.ending_type;

        const wantNeedContext = wantNeedMatrix ? `
CHARACTER ARC - WANT vs NEED JOURNEY:

WANT (Keinginan Eksternal yang DISADARI):
${wantNeedMatrix.wantStages ? `- MENGINGINKAN: ${wantNeedMatrix.wantStages.menginginkan || '-'}
- MEMASTIKAN: ${wantNeedMatrix.wantStages.memastikan || '-'}
- MENGEJAR: ${wantNeedMatrix.wantStages.mengejar || '-'}
- TERCAPAI: ${wantNeedMatrix.wantStages.tercapai === true ? 'YA' : wantNeedMatrix.wantStages.tercapai === false ? 'TIDAK' : '?'}` : ''}

NEED (Kebutuhan Internal yang TIDAK DISADARI):
${wantNeedMatrix.needStages ? `- MEMBUTUHKAN: ${wantNeedMatrix.needStages.membutuhkan || '-'}
- MENEMUKAN: ${wantNeedMatrix.needStages.menemukan || '-'}
- MENERIMA: ${wantNeedMatrix.needStages.menerima || '-'}
- TERPENUHI: ${wantNeedMatrix.needStages.terpenuhi === true ? 'YA' : wantNeedMatrix.needStages.terpenuhi === false ? 'TIDAK' : '?'}` : ''}

Dialog harus menunjukkan journey ini: karakter mengejar WANT sambil perlahan menemukan NEED.` : '';

        const endingContext = endingType ? `
ENDING TYPE: ${endingType}
- Script harus konsisten dengan ending type ini` : '';

        // Build character context
        const characterContext = characters.length > 0
            ? characters.map((c: any) =>
                `${c.name}${c.role ? ` (${c.role})` : ''}:
  Personality: ${c.personality || 'Tidak ditentukan'}
  Deskripsi: ${c.description || 'Tidak ada'}`
            ).join('\n\n')
            : 'Tidak ada detail karakter';

        // Build scenes context for AI
        const scenesForAI = scenes.map((scene: any) => ({
            sceneNumber: scene.scene_number,
            title: scene.scene_title || `Scene ${scene.scene_number}`,
            synopsis: scene.scene_description || 'Tidak ada sinopsis',
            location: scene.scene_location || 'Lokasi tidak ditentukan',
            timeOfDay: scene.scene_time || 'DAY',
            emotionalBeat: scene.emotional_beat || 'Tidak ditentukan',
            characters: scene.characters_present || [],
        }));

        // CHUNK PROCESSING: Process 5 scenes at a time to avoid token limits
        const CHUNK_SIZE = 5;
        const savedScripts: any[] = [];
        const chunks: any[][] = [];

        for (let i = 0; i < scenesForAI.length; i += CHUNK_SIZE) {
            chunks.push(scenesForAI.slice(i, i + CHUNK_SIZE));
        }

        console.log(`[batch-script] Processing ${scenesForAI.length} scenes in ${chunks.length} chunks of ${CHUNK_SIZE}`);

        for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
            const chunk = chunks[chunkIndex];
            console.log(`[batch-script] Processing chunk ${chunkIndex + 1}/${chunks.length} (scenes ${chunk[0].sceneNumber}-${chunk[chunk.length - 1].sceneNumber})`);

            // Build preferences context - SIMPLIFIED but detailed in prompt
            const prefs = preferences || {};

            // Map script style to detailed instructions
            const styleInstructions: Record<string, string> = {
                'concise': `GAYA RINGKAS:
- Dialog: 3-5 exchanges per scene, singkat padat (5-10 kata per line)
- Action: Minimal, hanya aksi essential
- Setting: 1-2 kalimat deskripsi awal saja
- Total: ~30-40 baris per scene`,

                'balanced': `GAYA SEIMBANG:
- Dialog: 5-7 exchanges per scene, natural (10-15 kata per line)
- Action: Standard, deskripsi cukup untuk dipahami
- Setting: Deskripsi vivid tapi tidak berlebihan
- Total: ~50-70 baris per scene`,

                'detailed': `GAYA DETAIL:
- Dialog: 7-10 exchanges per scene, lebih panjang (15-25 kata per line)
- Action: Detailed, deskripsi visual lengkap
- Setting: Deskripsi elaborate, atmosfer jelas
- Total: ~80-100 baris per scene`,

                'cinematic': `GAYA CINEMATIC:
- Dialog: 8-12 exchanges per scene, dramatis (variable length)
- Action: Sangat deskriptif, termasuk camera angles dan mood
- Setting: Full sensory description, suasana immersive
- Transitions: Gunakan CUT TO, DISSOLVE, dll
- Total: ~100-150 baris per scene`
            };

            // Map duration to word count guidance
            const durationInstructions: Record<string, string> = {
                '30': 'TARGET DURASI: ~30 detik per scene. Panjang script ~40-50 kata total.',
                '60': 'TARGET DURASI: ~1 menit per scene. Panjang script ~80-100 kata total.',
                '90': 'TARGET DURASI: ~1.5 menit per scene. Panjang script ~120-150 kata total.',
                '120': 'TARGET DURASI: ~2 menit per scene. Panjang script ~160-200 kata total.'
            };

            const preferencesContext = `
PREFERENSI PENULISAN (WAJIB DIIKUTI):

${styleInstructions[prefs.scriptStyle] || styleInstructions['balanced']}

${durationInstructions[prefs.sceneDuration] || durationInstructions['60']}
${prefs.customInstructions ? `\nINSTRUKSI KHUSUS USER:\n${prefs.customInstructions}` : ''}`;

            // Build user prompt for this chunk
            const userPrompt = `KONTEKS IP PROJECT:
- Judul: ${project.title || 'Tidak ada judul'}
- Genre: ${project.genre || 'Tidak ditentukan'} 
- Tone: ${project.tone || 'Tidak ditentukan'}
- Theme: ${project.theme || 'Tidak ditentukan'}
- Deskripsi: ${project.description || 'Tidak ada deskripsi'}
${endingContext}
${wantNeedContext}
${preferencesContext}

DETAIL KARAKTER:
${characterContext}

SCENES YANG PERLU DITULIS SCRIPT-NYA:
${JSON.stringify(chunk, null, 2)}

INSTRUKSI:
1. Tulis script production-ready untuk SEMUA scene di atas
2. IKUTI PREFERENSI PENULISAN di atas (jumlah dialog, panjang, gaya, detail)
3. Pastikan gaya penulisan sesuai dengan GENRE dan TONE dari IP Project
4. Dialog harus natural dan sesuai personality masing-masing karakter
5. Action lines harus visual dan cinematik
6. Script harus menunjukkan karakter mengejar WANT sambil perlahan awareness terhadap NEED
7. Sesuaikan emotional journey dengan ENDING TYPE yang dipilih

Return JSON array dengan script untuk setiap scene.`;

            // Call AI for this chunk
            const aiResult = await callAI("text", userPrompt, {
                systemPrompt: BATCH_SCRIPT_SYSTEM,
                maxTokens: 4000,
                temperature: 0.8,
                tier,
            });

            if (!aiResult.success || !aiResult.result) {
                console.error(`[batch-script] Chunk ${chunkIndex + 1} failed:`, aiResult.error);
                continue; // Skip this chunk but continue with others
            }

            // Parse AI response
            let scriptsFromAI: Array<{ sceneNumber: number; script: string }>;
            try {
                let cleanResult = aiResult.result.trim();
                if (cleanResult.startsWith('```json')) {
                    cleanResult = cleanResult.replace(/^```json\n?/, '').replace(/\n?```$/, '');
                } else if (cleanResult.startsWith('```')) {
                    cleanResult = cleanResult.replace(/^```\n?/, '').replace(/\n?```$/, '');
                }
                scriptsFromAI = JSON.parse(cleanResult);
            } catch (parseError) {
                console.error(`[batch-script] Failed to parse chunk ${chunkIndex + 1}:`, aiResult.result.substring(0, 200));
                continue;
            }

            // Save each script from this chunk
            for (const scriptData of scriptsFromAI) {
                const scene = scenes.find((s: any) => s.scene_number === scriptData.sceneNumber);
                if (!scene) continue;

                const sceneId = scene.id;
                const scriptContent = scriptData.script;

                try {
                    // Create context snapshot for versioning
                    const contextSnapshot = {
                        scene_plot_hash: crypto.createHash('md5').update(scene.scene_description || '').digest('hex'),
                        beat_id: scene.beat_key,
                        scene_synopsis: (scene.scene_description || '').substring(0, 200),
                        batch_generated: true,
                        chunk: chunkIndex + 1
                    };

                    // Get next version number
                    const maxVersion = await sql`
                        SELECT COALESCE(MAX(version_number), 0) as max_version
                        FROM scene_script_versions WHERE scene_id = ${sceneId}::uuid
                    `;
                    const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

                    // Deactivate previous active version
                    await sql`
                        UPDATE scene_script_versions
                        SET is_active = FALSE, updated_at = NOW()
                        WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
                    `;

                    // Create new version
                    await sql`
                        INSERT INTO scene_script_versions (
                            scene_id, version_number, script_content, context_snapshot,
                            provider, model, credit_cost, prompt, is_active, is_manual_edit
                        ) VALUES (
                            ${sceneId}::uuid, 
                            ${nextVersion}, 
                            ${scriptContent},
                            ${JSON.stringify(contextSnapshot)}::jsonb,
                            ${aiResult.provider || 'unknown'}, 
                            'deepseek-chat', 
                            ${creditCostPerScene},
                            ${userPrompt.substring(0, 500)},
                            TRUE,
                            FALSE
                        )
                    `;

                    savedScripts.push({
                        sceneId,
                        sceneNumber: scene.scene_number,
                        versionNumber: nextVersion,
                        script: scriptContent
                    });
                } catch (dbError) {
                    console.error(`[batch-script] Failed to save scene ${scene.scene_number}:`, dbError);
                }
            }
        }

        // Deduct credits for successfully saved scripts
        if (userId && savedScripts.length > 0) {
            await deductCredits(
                userId,
                savedScripts.length * creditCostPerScene,
                "text_generation",
                `batch_script_${projectId}_${Date.now()}`,
                `Batch script generation for ${savedScripts.length} scenes`
            );
        }

        return NextResponse.json({
            success: true,
            generated: savedScripts.length,
            total: scenesForAI.length,
            chunks: chunks.length,
            scripts: savedScripts,
            creditsUsed: savedScripts.length * creditCostPerScene,
        });

    } catch (error) {
        console.error('Error in batch script generation:', error);
        return NextResponse.json(
            { error: 'Failed to generate scripts' },
            { status: 500 }
        );
    }
}
