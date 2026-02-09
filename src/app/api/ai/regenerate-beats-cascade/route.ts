import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import { SCENEPLOT_PROMPT } from '@/lib/ai/prompts';

const sql = neon(process.env.DATABASE_URL!);

// Credit costs per operation
const CREDIT_COSTS = {
    beatContent: 3,
    keyAction: 2,
    scenePlot: 3,
    script: 4,
};

interface TensionChange {
    beatKey: string;
    beatLabel: string;
    previousTension: number;
    newTension: number;
    prevBeatTension?: number;
    nextBeatTension?: number;
}

interface RequestBody {
    projectId: string;
    storyVersionId: string;
    changes: TensionChange[];
    structureType: string; // hero, cat, harmon, three-act, freytag, custom, save-the-cat, etc.
    userId: string;
}

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

// Convert tension number to category name
function getTensionCategory(level: number): string {
    if (level === 1) return 'LOW (tenang, reflektif, setup)';
    if (level === 3) return 'HIGH (intens, klimaks, dramatik)';
    return 'MEDIUM (progresif, membangun)';
}

// SCRIPT_GENERATION_SYSTEM - SAME as original generate-script/route.ts
const SCRIPT_GENERATION_SYSTEM = `Kamu adalah penulis skenario profesional Indonesia. Tugas kamu adalah menulis naskah skenario untuk sebuah scene berdasarkan plot scene, daftar shot, dan informasi karakter.

TULIS DALAM FORMAT SKENARIO STANDAR:
- SCENE HEADING (INT./EXT. LOKASI - WAKTU)
- Action lines (present tense, deskripsi visual)
- NAMA KARAKTER (tengah, huruf kapital)
- Dialog (di bawah nama karakter)
- Parentheticals untuk catatan delivery (gunakan secukupnya)
- Transitions (CUT TO:, DISSOLVE TO:, dll.)

Naskah kamu harus:
1. Sesuai dengan emotional beat scene
2. Setia dengan kepribadian karakter
3. Memajukan cerita secara natural
4. Panjang sesuai durasi scene
5. Menyertakan deskripsi visual yang sesuai dengan shot list
6. Menggunakan dialog alami yang sesuai karakter

PENTING:
- Tulis dalam Bahasa Indonesia
- Gunakan dialog yang natural dan conversational
- Perhatikan dinamika antar karakter
- Buat action lines yang visual dan cinematik`;

// Build AI prompt for beat regeneration - MATCHES original generate-story-all format
function getRegenerateBeatPrompt(params: {
    beatKey: string;
    beatLabel: string;
    previousContent: string;
    previousKeyAction: string;
    previousTension: number;
    newTension: number;
    prevBeatTension?: number;
    nextBeatTension?: number;
    // Project context - SAME as original
    projectTitle: string;
    projectDescription: string;
    synopsis: string;
    genre: string;
    tone: string;
    structureType: string;
}): string {
    const fromCategory = getTensionCategory(params.previousTension);
    const toCategory = getTensionCategory(params.newTension);
    const direction = params.newTension > params.previousTension ? 'NAIK ⬆️' : 'TURUN ⬇️';

    return `Anda adalah screenwriter profesional. MODIFIKASI beat story sesuai perubahan tension.

PROJECT INFO:
- Title: ${params.projectTitle}
- Genre: ${params.genre || 'Drama'}
- Tone: ${params.tone || 'Serius'}
- Description: ${params.projectDescription || ''}

SYNOPSIS:
${params.synopsis}

BEAT YANG AKAN DIMODIFIKASI: "${params.beatLabel}" (${params.beatKey})

=== PERUBAHAN TENSION (${direction}) ===
Tension SAAT INI: ${fromCategory}
Tension BARU (target): ${toCategory}
${params.prevBeatTension !== undefined ? `Beat sebelumnya: ${getTensionCategory(params.prevBeatTension)}` : ''}
${params.nextBeatTension !== undefined ? `Beat sesudahnya: ${getTensionCategory(params.nextBeatTension)}` : ''}

=== KONTEN BEAT SAAT INI (modifikasi ini) ===
Description: ${params.previousContent || '(Belum ada konten)'}
Key Action: ${params.previousKeyAction || '(Belum ada key action)'}
===

INSTRUKSI MODIFIKASI:
- PERTAHANKAN inti cerita dan karakter dari konten saat ini
- SESUAIKAN intensitas dan stakes sesuai tension baru
- Jika tension ${direction === 'NAIK ⬆️' ? 'NAIK: buat lebih dramatis, stakes lebih tinggi, konflik lebih tajam, pacing lebih cepat' : 'TURUN: buat lebih reflektif, introspektif, pacing lebih lambat, momen tenang'}
- Sesuaikan dengan genre ${params.genre || 'Drama'}

OUTPUT dalam BAHASA INDONESIA, FORMAT JSON (tanpa markdown):
{
  "beatContent": "<deskripsi beat 2-3 paragraf sesuai tension baru>",
  "keyAction": "<aksi kunci 1-2 kalimat yang menggambarkan beat>"
}`;
}

// Build AI prompt for scene plot regeneration - MATCHES SCENEPLOT_PROMPT format
function getRegenerateScenePlotPrompt(params: {
    sceneNumber: number;
    totalScenes: number;
    beatKey: string;
    beatLabel: string;
    beatContent: string;
    previousTension: number;
    newTension: number;
    // Project context - SAME as original
    projectTitle: string;
    projectDescription: string;
    synopsis: string;
    genre: string;
    tone: string;
    characters: string[];
    previousSceneSummary?: string;
    originalScene?: {
        title: string;
        description: string;
        location: string;
        time: string;
        emotionalBeat: string;
        charactersPresent: string[];
    };
}): string {
    const fromCategory = getTensionCategory(params.previousTension);
    const toCategory = getTensionCategory(params.newTension);
    const direction = params.newTension > params.previousTension ? 'NAIK ⬆️' : 'TURUN ⬇️';
    const scenePosition = params.sceneNumber <= Math.ceil(params.totalScenes / 3) ? 'AWAL' :
        params.sceneNumber <= Math.ceil(params.totalScenes * 2 / 3) ? 'TENGAH' : 'AKHIR';

    // Character context for prompt - SAME as original
    const characterContext = params.characters.length > 0
        ? params.characters.slice(0, 5).join(', ')
        : 'Karakter utama';

    return `You are a professional film director and cinematographer. MODIFY scene plot based on tension change.

PROJECT INFO:
- Title: ${params.projectTitle}
- Genre: ${params.genre || 'Drama'}
- Tone: ${params.tone || 'Serius'}
- Description: ${params.projectDescription || ''}

SYNOPSIS:
${params.synopsis}

BEAT: "${params.beatLabel}" (${params.beatKey})
Beat Content: ${params.beatContent || 'No beat content'}

=== PERUBAHAN TENSION (${direction}) ===
Tension SAAT INI: ${fromCategory}
Tension BARU (target): ${toCategory}

SCENE POSITION: Scene ${params.sceneNumber} dari ${params.totalScenes} (Bagian ${scenePosition})

AVAILABLE CHARACTERS:
${characterContext}

${params.originalScene ? `
=== SCENE SAAT INI (MODIFIKASI ini sesuai tension baru) ===
Title: ${params.originalScene.title}
Description: ${params.originalScene.description}
Location: ${params.originalScene.location}
Time: ${params.originalScene.time}
Emotional Beat: ${params.originalScene.emotionalBeat}
Characters: ${params.originalScene.charactersPresent?.join(', ') || 'Not specified'}
===
INSTRUKSI: PERTAHANKAN inti cerita dan lokasi, tapi SESUAIKAN intensitas sesuai tension baru!
` : ''}

${params.previousSceneSummary ? `
SCENE SEBELUMNYA (untuk continuity):
${params.previousSceneSummary}
Scene ini harus BERBEDA dan MEMAJUKAN cerita!
` : ''}

INSTRUKSI MODIFIKASI ${direction}:
${params.newTension === 3 ? `
- HIGH TENSION: Tambah konflik lebih intens, stakes lebih tinggi
- Dialog lebih urgent dan tegang
- Pacing lebih cepat
` : params.newTension === 1 ? `
- LOW TENSION: Kurangi konflik, buat lebih reflektif
- Fokus character development
- Dialog lebih tenang dan introspektif
` : `
- MEDIUM TENSION: Keseimbangan konflik dan momen tenang
- Progresif membangun momentum
- Dialog natural
`}

ATURAN:
1. Response in Indonesian for descriptions
2. VARIASI dari scene sebelumnya
3. PERTAHANKAN kontinuitas cerita

OUTPUT dalam BAHASA INDONESIA, JSON only:
{
  "sceneNumber": ${params.sceneNumber},
  "title": "<judul singkat deskriptif>",
  "synopsis": "<2-3 paragraf detail, SESUAI tension ${toCategory}>",
  "emotionalBeat": "<apa yang penonton rasakan>",
  "location": "<lokasi scene>",
  "timeOfDay": "day" | "night" | "dawn" | "dusk",
  "characters": ["<2-4 karakter yang aktif>"]
}`;
}

// Build AI prompt for script regeneration
function getRegenerateScriptPrompt(params: {
    sceneTitle: string;
    sceneDescription: string;
    emotionalBeat: string;
    location: string;
    timeOfDay: string;
    characters: string[];
    previousTension: number;
    newTension: number;
    genre: string;
    tone: string;
    originalScript?: string;
    estimatedDuration?: number; // in seconds
}): string {
    const fromCategory = getTensionCategory(params.previousTension);
    const toCategory = getTensionCategory(params.newTension);
    const direction = params.newTension > params.previousTension ? 'NAIK ⬆️' : 'TURUN ⬇️';

    // Calculate target word count based on duration (same formula as original)
    const duration = params.estimatedDuration || 60;
    const targetWords = Math.round(duration / 60 * 125);

    return `Kamu adalah penulis skenario profesional. Tugas: MODIFIKASI script sesuai perubahan tension.

=== SCENE INFO ===
Title: ${params.sceneTitle}
Location: ${params.location || 'Interior'}
Time: ${params.timeOfDay || 'Day'}
Characters: ${params.characters.join(', ') || 'Karakter utama'}

SCENE DESCRIPTION:
${params.sceneDescription}

EMOTIONAL BEAT: ${params.emotionalBeat}

=== DURASI & PANJANG SCRIPT ===
DURASI SCENE: ~${duration} detik
TARGET: sekitar ${targetWords} kata (JANGAN lebih panjang dari ini!)
${params.originalScript ? `PANJANG SCRIPT ASLI: ~${params.originalScript.split(/\s+/).length} kata - PERTAHANKAN panjang yang sama!` : ''}

=== PERUBAHAN TENSION (${direction}) ===
Tension SAAT INI: ${fromCategory}
Tension BARU (target): ${toCategory}

GENRE: ${params.genre || 'Drama'}
TONE: ${params.tone || 'Serius'}

${params.originalScript ? `
=== SCRIPT ASLI (modifikasi ini sesuai tension baru) ===
${params.originalScript.substring(0, 2000)}
===
INSTRUKSI PENTING:
1. PERTAHANKAN panjang script yang sama dengan aslinya!
2. SESUAIKAN intensitas dan pacing sesuai tension baru
3. JANGAN menambah dialog atau action yang tidak perlu
` : ''}

FORMAT SCRIPT:
- SCENE HEADING: INT./EXT. LOKASI - WAKTU
- ACTION LINES: Present tense, visual, cinematik
- CHARACTER NAME: HURUF KAPITAL centered
- DIALOG: Di bawah nama karakter
- PARENTHETICALS: (berbisik), (marah), dll

OUTPUT dalam BAHASA INDONESIA - return ONLY the script text, no JSON.`;
}

export async function POST(request: NextRequest) {
    console.log('[CASCADE] === API CALLED ===');

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Helper to send streaming updates
    const sendUpdate = async (data: any) => {
        await writer.write(encoder.encode(JSON.stringify(data) + '\n'));
    };

    // Start processing in background
    (async () => {
        try {
            const body: RequestBody = await request.json();
            console.log('[CASCADE] Request body:', JSON.stringify(body, null, 2));
            const { projectId, storyVersionId, changes, structureType, userId } = body;

            // Validate
            if (!projectId || !storyVersionId || !changes || changes.length === 0) {
                await sendUpdate({ type: 'error', error: 'projectId, storyVersionId, and changes are required' });
                await writer.close();
                return;
            }

            // Get user tier
            const tier = await getUserTier(userId);

            // Get story version data with project info
            const storyVersionResult = await sql`
        SELECT 
          sv.*,
          s.synopsis,
          p.title as project_title,
          p.description as project_description,
          p.genre,
          p.tone
        FROM story_versions sv
        JOIN stories s ON sv.story_id = s.id
        JOIN projects p ON sv.project_id = p.id
        WHERE sv.id = ${storyVersionId}::uuid
      `;

            if (storyVersionResult.length === 0) {
                await sendUpdate({ type: 'error', error: 'Story version not found' });
                await writer.close();
                return;
            }

            const storyVersion = storyVersionResult[0];

            // Add detailed logging for debugging
            console.log('[CASCADE] Starting regeneration:', {
                projectId,
                storyVersionId,
                structureType,
                normalizedStructure: structureType?.toLowerCase().replace(/['\s-]/g, '') || 'cat',
                changesCount: changes.length,
                changes: changes.map(c => ({ beatKey: c.beatKey, prev: c.previousTension, new: c.newTension }))
            });

            // Normalize structure type and get appropriate beats
            const normalizedStructure = structureType?.toLowerCase().replace(/['\s-]/g, '') || 'cat';
            console.log('[CASCADE] Using structure:', normalizedStructure);

            const getBeatsForStructure = (): Record<string, string> => {
                if (normalizedStructure.includes('hero')) return storyVersion.hero_beats || {};
                if (normalizedStructure.includes('harmon')) return storyVersion.harmon_beats || {};
                if (normalizedStructure.includes('threeact') || normalizedStructure.includes('3act')) return storyVersion.three_act_beats || {};
                if (normalizedStructure.includes('freytag')) return storyVersion.freytag_beats || {};
                if (normalizedStructure.includes('custom')) return storyVersion.custom_beats || {};
                return storyVersion.cat_beats || {}; // Default: Save the Cat
            };
            const beats = getBeatsForStructure();

            // Beat key mapping - frontend uses camelCase, but DB might use numeric indices
            // Create mapping from beat index to beat key based on structure
            const CAT_BEATS_ORDER = [
                'openingImage', 'themeStated', 'setup', 'catalyst', 'debate',
                'breakIntoTwo', 'bStory', 'funAndGames', 'midpoint', 'badGuysCloseIn',
                'allIsLost', 'darkNightOfTheSoul', 'breakIntoThree', 'finale', 'finalImage'
            ];
            const HERO_BEATS_ORDER = [
                'ordinaryWorld', 'callToAdventure', 'refusalOfCall', 'meetingMentor',
                'crossingThreshold', 'testsAlliesEnemies', 'approachCave', 'ordeal',
                'reward', 'roadBack', 'resurrection', 'returnElixir'
            ];
            const HARMON_BEATS_ORDER = [
                'you', 'need', 'go', 'search', 'find', 'take', 'return', 'change'
            ];
            const THREE_ACT_BEATS_ORDER = [
                'setup', 'incitingIncident', 'plotPoint1', 'risingAction',
                'midpoint', 'plotPoint2', 'climax', 'resolution'
            ];
            const FREYTAG_BEATS_ORDER = [
                'exposition', 'risingAction', 'climax', 'fallingAction', 'denouement'
            ];

            const getBeatsOrder = (): string[] => {
                if (normalizedStructure.includes('hero')) return HERO_BEATS_ORDER;
                if (normalizedStructure.includes('harmon')) return HARMON_BEATS_ORDER;
                if (normalizedStructure.includes('threeact') || normalizedStructure.includes('3act')) return THREE_ACT_BEATS_ORDER;
                if (normalizedStructure.includes('freytag')) return FREYTAG_BEATS_ORDER;
                if (normalizedStructure.includes('custom')) return []; // Custom has dynamic beats, will use beatKey directly
                return CAT_BEATS_ORDER; // Default: Save the Cat
            };
            const beatsOrder = getBeatsOrder();

            // Map beat keys to their indices (1-based like DB stores)
            const beatKeyToIndex = new Map<string, string>();
            const beatIndexToKey = new Map<string, string>();
            beatsOrder.forEach((key, idx) => {
                beatKeyToIndex.set(key, String(idx + 1));
                beatIndexToKey.set(String(idx + 1), key);
            });

            // Build list of possible beat_key values to query (both formats)
            const affectedBeatKeysForQuery: string[] = [];
            changes.forEach(c => {
                affectedBeatKeysForQuery.push(c.beatKey);
                const idx = beatKeyToIndex.get(c.beatKey);
                if (idx) affectedBeatKeysForQuery.push(idx);
            });

            // Get all scene plots for affected beats (matching either format)
            const scenePlots = await sql`
                SELECT * FROM scene_plots
                WHERE story_version_id = ${storyVersionId}::uuid
                AND beat_key = ANY(${affectedBeatKeysForQuery}::text[])
                ORDER BY scene_number ASC
            `;

            // Check if moodboard exists with items (key actions stored in moodboard_items)
            const moodboardCheck = await sql`
                SELECT m.id as moodboard_id, mi.beat_key, mi.key_action_description
                FROM moodboards m
                LEFT JOIN moodboard_items mi ON mi.moodboard_id = m.id
                WHERE m.story_version_id = ${storyVersionId}::uuid
                AND m.deleted_at IS NULL
                AND m.is_active = TRUE
                ORDER BY m.version_number DESC
            `;
            const hasMoodboard = moodboardCheck.length > 0 && moodboardCheck[0].moodboard_id;
            const moodboardId = moodboardCheck[0]?.moodboard_id;

            // Build existing key actions map from moodboard_items
            const existingKeyActions: Record<string, string> = {};
            moodboardCheck.forEach((row: any) => {
                if (row.beat_key && row.key_action_description) {
                    existingKeyActions[row.beat_key] = row.key_action_description;
                }
            });

            // Debug: Log moodboard info and existing key actions
            console.log('[CASCADE] Moodboard check:', {
                hasMoodboard,
                moodboardId,
                existingKeyActionBeatKeys: Object.keys(existingKeyActions),
                requestedBeatKeys: changes.map(c => c.beatKey)
            });

            // Calculate total credits
            const scenesPerBeat = Math.ceil(scenePlots.length / changes.length) || 1;
            const estimatedCredits = changes.length * (
                CREDIT_COSTS.beatContent +
                CREDIT_COSTS.keyAction +
                (scenesPerBeat * CREDIT_COSTS.scenePlot) +
                (scenesPerBeat * CREDIT_COSTS.script)
            );

            // Check credits
            if (userId) {
                const hasCredits = await checkCredits(userId, estimatedCredits);
                if (!hasCredits) {
                    await sendUpdate({ type: 'error', error: 'Insufficient credits', required: estimatedCredits });
                    await writer.close();
                    return;
                }
            }

            // Send start event
            await sendUpdate({
                type: 'start',
                totalBeats: changes.length,
                totalScenes: scenePlots.length,
                estimatedCredits
            });

            let totalCreditsUsed = 0;

            // Process each beat change
            for (let beatIndex = 0; beatIndex < changes.length; beatIndex++) {
                const change = changes[beatIndex];

                // Filter scenes by matching either the camelCase key or numeric index
                const numericIdx = beatKeyToIndex.get(change.beatKey);
                const beatScenes = scenePlots.filter((s: any) =>
                    s.beat_key === change.beatKey || s.beat_key === numericIdx
                );

                await sendUpdate({
                    type: 'beat_start',
                    beatIndex,
                    beatKey: change.beatKey,
                    beatLabel: change.beatLabel,
                    scenesCount: beatScenes.length
                });

                // Step 1: Regenerate Beat Content
                await sendUpdate({ type: 'step', beatIndex, step: 'beatContent', status: 'generating' });

                try {
                    const beatPrompt = getRegenerateBeatPrompt({
                        beatKey: change.beatKey,
                        beatLabel: change.beatLabel,
                        previousContent: beats?.[change.beatKey] || '',
                        previousKeyAction: '', // Will get from moodboard if available
                        previousTension: change.previousTension,
                        newTension: change.newTension,
                        prevBeatTension: change.prevBeatTension,
                        nextBeatTension: change.nextBeatTension,
                        // Project context - SAME as original
                        projectTitle: storyVersion.project_title || '',
                        projectDescription: storyVersion.project_description || '',
                        synopsis: storyVersion.synopsis || '',
                        genre: storyVersion.genre || '',
                        tone: storyVersion.tone || '',
                        structureType: structureType || 'save-the-cat',
                    });

                    const beatResult = await callAI('text', beatPrompt, {
                        maxTokens: 1000,
                        temperature: 0.7,
                        tier,
                    });

                    if (!beatResult.success) {
                        throw new Error(beatResult.error || 'Failed to generate beat content');
                    }

                    // Parse JSON response
                    let beatData: { beatContent: string; keyAction: string };
                    try {
                        const jsonMatch = beatResult.result?.match(/\{[\s\S]*\}/);
                        beatData = jsonMatch ? JSON.parse(jsonMatch[0]) : { beatContent: beatResult.result, keyAction: '' };
                    } catch {
                        beatData = { beatContent: beatResult.result || '', keyAction: '' };
                    }

                    // Save beat content to database - use separate queries for each structure type
                    const beatUpdateData = JSON.stringify({ [change.beatKey]: beatData.beatContent });
                    const tensionUpdateData = JSON.stringify({ [change.beatKey]: change.newTension });

                    if (normalizedStructure.includes('hero')) {
                        console.log('[CASCADE] Saving to hero_beats:', {
                            beatKey: change.beatKey,
                            newTension: change.newTension,
                            storyVersionId
                        });
                        const updateResult = await sql`
                            UPDATE story_versions
                            SET 
                              hero_beats = COALESCE(hero_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                            RETURNING id, tension_levels
                        `;
                        console.log('[CASCADE] hero_beats save result:', {
                            rowsAffected: updateResult.length,
                            savedTensionForBeat: updateResult[0]?.tension_levels?.[change.beatKey]
                        });
                    } else if (normalizedStructure.includes('harmon')) {
                        await sql`
                            UPDATE story_versions
                            SET 
                              harmon_beats = COALESCE(harmon_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                        `;
                    } else if (normalizedStructure.includes('threeact') || normalizedStructure.includes('3act')) {
                        await sql`
                            UPDATE story_versions
                            SET 
                              three_act_beats = COALESCE(three_act_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                        `;
                    } else if (normalizedStructure.includes('freytag')) {
                        await sql`
                            UPDATE story_versions
                            SET 
                              freytag_beats = COALESCE(freytag_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                        `;
                    } else if (normalizedStructure.includes('custom')) {
                        await sql`
                            UPDATE story_versions
                            SET 
                              custom_beats = COALESCE(custom_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                        `;
                    } else {
                        // Default: Save the Cat
                        console.log('[CASCADE] Saving to cat_beats:', {
                            beatKey: change.beatKey,
                            beatContent: beatData.beatContent?.substring(0, 50) || '(empty)',
                            newTension: change.newTension,
                            storyVersionId
                        });
                        const updateResult = await sql`
                            UPDATE story_versions
                            SET 
                              cat_beats = COALESCE(cat_beats, '{}'::jsonb) || ${beatUpdateData}::jsonb,
                              tension_levels = COALESCE(tension_levels, '{}'::jsonb) || ${tensionUpdateData}::jsonb,
                              updated_at = NOW()
                            WHERE id = ${storyVersionId}::uuid
                            RETURNING id, tension_levels
                        `;
                        console.log('[CASCADE] Save result:', {
                            rowsAffected: updateResult.length,
                            savedTensionForBeat: updateResult[0]?.tension_levels?.[change.beatKey]
                        });
                    }

                    totalCreditsUsed += CREDIT_COSTS.beatContent;
                    await sendUpdate({
                        type: 'step',
                        beatIndex,
                        step: 'beatContent',
                        status: 'complete',
                        result: beatData.beatContent.substring(0, 100) + '...'
                    });

                    // Step 2: Key Action - ONLY if moodboard exists with key action for this beat
                    const hasExistingKeyAction = hasMoodboard && existingKeyActions[change.beatKey];

                    if (hasExistingKeyAction && beatData.keyAction) {
                        await sendUpdate({ type: 'step', beatIndex, step: 'keyAction', status: 'generating' });

                        // Update key action in moodboard_items for this beat
                        await sql`
                            UPDATE moodboard_items
                            SET key_action_description = ${beatData.keyAction},
                                updated_at = NOW()
                            WHERE moodboard_id = ${moodboardId}::uuid
                            AND beat_key = ${change.beatKey}
                        `;

                        totalCreditsUsed += CREDIT_COSTS.keyAction;
                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'keyAction',
                            status: 'complete',
                            result: beatData.keyAction
                        });
                    } else {
                        // Skip key action - no moodboard or no existing key action
                        console.log(`[CASCADE] Skipping key action for beat ${change.beatKey} - no existing moodboard/key action`);
                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'keyAction',
                            status: 'skipped',
                            result: 'No moodboard version'
                        });
                    }

                    // Step 3: Regenerate Scene Plots for this beat
                    if (beatScenes.length > 0) {
                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'scenePlots',
                            status: 'generating',
                            progress: { current: 0, total: beatScenes.length }
                        });

                        // Get last scene from PREVIOUS beat for continuity (scene 1 of beat 3 should know about last scene of beat 2)
                        const firstSceneNumber = beatScenes[0]?.scene_number || 1;
                        const previousBeatLastScene = await sql`
                          SELECT scene_title, scene_description 
                          FROM scene_plots 
                          WHERE story_version_id = ${storyVersionId}::uuid 
                          AND scene_number < ${firstSceneNumber}
                          ORDER BY scene_number DESC 
                          LIMIT 1
                        `;

                        let previousSceneSummary = previousBeatLastScene[0]
                            ? `[SCENE SEBELUMNYA dari beat lain: ${previousBeatLastScene[0].scene_title}] ${(previousBeatLastScene[0].scene_description || '').substring(0, 200)}...`
                            : '';

                        for (let sceneIdx = 0; sceneIdx < beatScenes.length; sceneIdx++) {
                            const scene = beatScenes[sceneIdx];

                            // SKIP if scene doesn't have existing plot (never generated)
                            if (!scene.scene_description && !scene.synopsis) {
                                console.log(`[CASCADE] Skipping scene ${scene.scene_number} - no existing plot`);
                                continue;
                            }

                            const scenePlotPrompt = getRegenerateScenePlotPrompt({
                                sceneNumber: scene.scene_number,
                                totalScenes: beatScenes.length,
                                beatKey: change.beatKey,
                                beatLabel: change.beatLabel,
                                beatContent: beats?.[change.beatKey] || '',
                                previousTension: change.previousTension,
                                newTension: change.newTension,
                                // Project context - SAME as original
                                projectTitle: storyVersion.project_title || '',
                                projectDescription: storyVersion.project_description || '',
                                synopsis: storyVersion.synopsis || '',
                                genre: storyVersion.genre || '',
                                tone: storyVersion.tone || '',
                                characters: scene.characters_present || [],
                                previousSceneSummary: previousSceneSummary || undefined,
                                originalScene: {
                                    title: scene.scene_title || '',
                                    description: scene.scene_description || '',
                                    location: scene.scene_location || '',
                                    time: scene.scene_time || 'day',
                                    emotionalBeat: scene.emotional_beat || '',
                                    charactersPresent: scene.characters_present || [],
                                },
                            });

                            const scenePlotResult = await callAI('text', scenePlotPrompt, {
                                maxTokens: 800,
                                temperature: 0.8,
                                tier,
                            });

                            if (scenePlotResult.success && scenePlotResult.result) {
                                try {
                                    const jsonMatch = scenePlotResult.result.match(/\{[\s\S]*\}/);
                                    const plotData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

                                    if (plotData) {
                                        // Update scene plot in database
                                        // NOTE: characters_present stays UNCHANGED - tension affects HOW scene plays, not WHO is in it
                                        await sql`
                      UPDATE scene_plots SET
                        scene_title = ${plotData.title || scene.scene_title},
                        scene_description = ${plotData.synopsis || scene.scene_description},
                        emotional_beat = ${plotData.emotionalBeat || scene.emotional_beat},
                        scene_location = ${plotData.location || scene.scene_location},
                        scene_time = ${plotData.timeOfDay || scene.scene_time},
                        updated_at = NOW()
                      WHERE id = ${scene.id}::uuid
                    `;

                                        // Update previousSceneSummary for next scene context
                                        previousSceneSummary = `[${plotData.title || scene.scene_title}] ${(plotData.synopsis || scene.scene_description || '').substring(0, 200)}...`;
                                    }
                                } catch (e) {
                                    console.error('Failed to parse scene plot:', e);
                                }
                            }

                            totalCreditsUsed += CREDIT_COSTS.scenePlot;
                            await sendUpdate({
                                type: 'step',
                                beatIndex,
                                step: 'scenePlots',
                                status: 'generating',
                                progress: { current: sceneIdx + 1, total: beatScenes.length }
                            });
                        }

                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'scenePlots',
                            status: 'complete',
                            scenesUpdated: beatScenes.length
                        });
                    }

                    // Step 4: Regenerate Scripts for scenes
                    if (beatScenes.length > 0) {
                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'scripts',
                            status: 'generating',
                            progress: { current: 0, total: beatScenes.length }
                        });

                        for (let sceneIdx = 0; sceneIdx < beatScenes.length; sceneIdx++) {
                            const scene = beatScenes[sceneIdx];

                            // Get updated scene data
                            const updatedScene = await sql`
                SELECT * FROM scene_plots WHERE id = ${scene.id}::uuid
              `;
                            const sceneData = updatedScene[0] || scene;

                            // Get current active script for modification
                            const currentScript = await sql`
                  SELECT script_content FROM scene_script_versions 
                  WHERE scene_id = ${scene.id}::uuid AND is_active = TRUE
                  LIMIT 1
                `;
                            const originalScript = currentScript[0]?.script_content || '';

                            // SKIP if scene doesn't have existing script (never generated)
                            if (!originalScript) {
                                console.log(`[CASCADE] Skipping script for scene ${scene.scene_number} - no existing script`);
                                continue;
                            }

                            const scriptPrompt = getRegenerateScriptPrompt({
                                sceneTitle: sceneData.scene_title || `Scene ${sceneData.scene_number}`,
                                sceneDescription: sceneData.scene_description || '',
                                emotionalBeat: sceneData.emotional_beat || '',
                                location: sceneData.scene_location || '',
                                timeOfDay: sceneData.scene_time || 'day',
                                characters: sceneData.characters_present || [],
                                previousTension: change.previousTension,
                                newTension: change.newTension,
                                genre: storyVersion.genre || '',
                                tone: storyVersion.tone || '',
                                originalScript: originalScript,
                                estimatedDuration: sceneData.estimated_duration || 60,
                            });

                            const scriptResult = await callAI('text', scriptPrompt, {
                                systemPrompt: SCRIPT_GENERATION_SYSTEM,
                                maxTokens: 2000,
                                temperature: 0.7,
                                tier,
                            });

                            if (scriptResult.success && scriptResult.result) {
                                // Deactivate old scripts
                                await sql`
                  UPDATE scene_script_versions
                  SET is_active = FALSE, updated_at = NOW()
                  WHERE scene_id = ${scene.id}::uuid AND is_active = TRUE
                `;

                                // Get next version number
                                const maxVersionResult = await sql`
                  SELECT COALESCE(MAX(version_number), 0) as max_num
                  FROM scene_script_versions
                  WHERE scene_id = ${scene.id}::uuid
                `;
                                const nextVersion = (maxVersionResult[0]?.max_num || 0) + 1;

                                // Insert new script version
                                await sql`
                  INSERT INTO scene_script_versions (
                    scene_id, version_number, script_content, is_active
                  ) VALUES (
                    ${scene.id}::uuid,
                    ${nextVersion},
                    ${scriptResult.result},
                    TRUE
                  )
                `;
                            }

                            totalCreditsUsed += CREDIT_COSTS.script;
                            await sendUpdate({
                                type: 'step',
                                beatIndex,
                                step: 'scripts',
                                status: 'generating',
                                progress: { current: sceneIdx + 1, total: beatScenes.length }
                            });
                        }

                        await sendUpdate({
                            type: 'step',
                            beatIndex,
                            step: 'scripts',
                            status: 'complete',
                            scriptsUpdated: beatScenes.length
                        });
                    }

                    await sendUpdate({ type: 'beat_complete', beatIndex, beatKey: change.beatKey });

                } catch (error: any) {
                    await sendUpdate({
                        type: 'error',
                        error: `Failed at beat ${change.beatLabel}: ${error.message}`,
                        beatIndex
                    });
                    // Continue with next beat instead of stopping entirely
                }
            }

            // Deduct credits
            if (userId && totalCreditsUsed > 0) {
                await deductCredits(
                    userId,
                    totalCreditsUsed,
                    'text_generation',
                    `tension_cascade_${Date.now()}`,
                    `Cascade regeneration for ${changes.length} beat(s)`
                );
            }

            // Send completion
            await sendUpdate({
                type: 'done',
                totalCreditsUsed,
                beatsRegenerated: changes.length
            });

        } catch (error: any) {
            console.error('Cascade regeneration error:', error);
            await sendUpdate({ type: 'error', error: error.message || 'Unknown error' });
        } finally {
            await writer.close();
        }
    })();

    return new Response(stream.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
