import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SHOT_LIST_SYSTEM = `You are an expert cinematographer and 1st AD (Assistant Director). Your job is to break down a scene's script/synopsis into a COMPLETE, DETAILED shot list — exactly like a real film production breakdown.

CRITICAL RULES:
1. Each scene represents approximately 60 seconds of screen time. You MUST generate enough shots so the SUM of all shot durations equals the scene duration (usually ~60 seconds).
2. Typically a 60-second scene has 8-15 shots. NEVER generate just 1 shot. Break down EVERY beat, dialog line, reaction, and action into its own shot. Action-heavy scenes may have 20-30+ quick cuts.
3. Shot duration can range from 0.5 seconds (fast action cuts) to 10 seconds (slow dramatic moments). Action scenes use shorter shots (0.5-3s), dialogue uses longer shots (3-8s).
4. Shot numbers MUST start from 1 and be sequential.
5. Vary your shot types for visual storytelling — mix wide establishing shots, medium shots for conversation, close-ups for emotion, inserts for detail.
6. If there is dialogue, extract the exact line(s) spoken in that shot into the "dialogue" field.

CAMERA TYPE must be EXACTLY one of these values:
"establishing" | "wide" | "full" | "medium" | "medium-close" | "close-up" | "extreme-close-up" | "over-shoulder" | "two-shot" | "pov" | "insert"

CAMERA ANGLE must be EXACTLY one of:
"eye-level" | "high" | "low" | "dutch" | "birds-eye" | "worms-eye"

CAMERA MOVEMENT must be EXACTLY one of:
"static" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "dolly-in" | "dolly-out" | "tracking" | "crane-up" | "crane-down" | "handheld" | "steadicam" | "zoom-in" | "zoom-out"

IMPORTANT: Output ONLY valid JSON array, no markdown, no explanation, no commentary.

JSON Structure:
[
  {
    "shotNumber": 1,
    "cameraType": "establishing",
    "cameraAngle": "eye-level",
    "cameraMovement": "static",
    "duration": 4,
    "shotDescription": "Brief description of what this shot shows",
    "action": "What physically happens in this shot",
    "dialogue": "Exact line of dialogue spoken in this shot, or null if no dialogue",
    "blocking": "Character positions and movements",
    "lighting": "Lighting notes",
    "audio": "Sound effects, ambient audio, music cues",
    "notes": "Director's notes"
  }
]`;

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: sceneId } = await params;
        const body = await request.json();
        const { userId, genre, tone, visualStyle, targetShotCount } = body;

        // Get scene data first
        const scenes = await sql`SELECT * FROM scene_plots WHERE id = ${sceneId}::uuid`;

        if (scenes.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        const scene = scenes[0];

        // Get project info via story_version_id
        let projectInfo: any = {};
        let shotPreferences: any = null;
        if (scene.story_version_id) {
            const storyResult = await sql`
              SELECT s.project_id, p.title as project_title, p.genre as project_genre, p.tone as project_tone
              FROM stories s
              JOIN projects p ON s.project_id = p.id::text
              WHERE s.id::text = ${scene.story_version_id}
            `;
            if (storyResult.length > 0) {
                projectInfo = storyResult[0];

                // Load shot preferences for this project
                try {
                    const prefResult = await sql`
                      SELECT shot_preferences FROM projects WHERE id = ${projectInfo.project_id}::uuid
                    `;
                    shotPreferences = prefResult[0]?.shot_preferences;
                } catch (e) {
                    try {
                        const prefResult = await sql`
                          SELECT generation_metadata->'shot_preferences' as prefs 
                          FROM projects WHERE id = ${projectInfo.project_id}::uuid
                        `;
                        shotPreferences = prefResult[0]?.prefs;
                    } catch (e2) {
                        // No preferences saved
                    }
                }
            }
        }

        console.log('[generate-shots] Shot preferences:', shotPreferences ? 'loaded' : 'none');

        // Get active script version for this scene (TEMPORARILY DISABLED FOR DEBUGGING)
        let activeScript: any = null;
        // Script lookup disabled - will use synopsis fallback
        console.log('[generate-shots] Script lookup disabled, using synopsis fallback');

        // Determine what content to use for shot generation
        const hasScript = !!activeScript?.script_content;
        const contentSource = hasScript ? 'script' : 'synopsis';
        const contentForPrompt = hasScript
            ? activeScript.script_content
            : (scene.synopsis || scene.scene_description || 'No content available');

        // Require at least synopsis if no script
        if (!hasScript && !scene.synopsis && !scene.scene_description) {
            return NextResponse.json({
                error: 'Scene needs either an active script or a synopsis to generate shots.',
                hint: 'Generate a script first, or add a synopsis to the scene plot.'
            }, { status: 400 });
        }

        // Get user tier
        const tier = await getUserTier(userId);
        const creditCost = 3;

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

        const sceneDuration = scene.estimated_duration || 60;

        // Build shot preferences context if available
        const prefsContext = shotPreferences ? `
DIRECTOR'S SHOT PREFERENCES (follow these closely):
- Visual Style: ${shotPreferences.visualStyle || 'Cinematic'}
- Pacing: ${shotPreferences.pacingProfile || 'moderate'} (avg ${shotPreferences.avgShotsPerMinute || 10} shots/min)
- Duration Range: ${shotPreferences.shotDurationRange?.min || 0.5}s - ${shotPreferences.shotDurationRange?.max || 10}s
  * Dialogue avg: ${shotPreferences.shotDurationRange?.dialogueAvg || 5}s
  * Action avg: ${shotPreferences.shotDurationRange?.actionAvg || 2}s
  * Establishing avg: ${shotPreferences.shotDurationRange?.establishingAvg || 4}s
- Editing: ${shotPreferences.editingNotes || 'Standard cinematic editing'}
- Genre Notes: ${shotPreferences.genreSpecificNotes || 'Follow genre conventions'}
- Lighting: ${shotPreferences.lightingStyle || 'Cinematic'}
- Color Palette: ${shotPreferences.colorPalette || 'Natural'}
- Camera preferences:
${(shotPreferences.preferredCameraTypes || []).filter((ct: any) => ct.frequency === 'often' || ct.frequency === 'always').map((ct: any) => `  * ${ct.type}: ${ct.notes}`).join('\n') || '  (use your best judgment)'}
- Movement preferences:
${(shotPreferences.preferredMovements || []).filter((m: any) => m.frequency === 'often').map((m: any) => `  * ${m.movement}: ${m.notes}`).join('\n') || '  (use your best judgment)'}
` : '';

        const userPrompt = hasScript
            ? `Break down this screenplay into a COMPLETE shot list.

SCENE: ${scene.title || scene.scene_title || `Scene ${scene.scene_number}`}

SCREENPLAY/SCRIPT:
${contentForPrompt}

SCENE CONTEXT:
- Location: ${scene.location || scene.scene_location || 'Not specified'}
- Time of Day: ${scene.time_of_day || scene.scene_time || 'day'}
- Emotional Beat: ${scene.emotional_beat || 'Not specified'}

CHARACTERS INVOLVED:
${(scene.characters_involved || scene.characters_present || []).map((c: any) =>
                typeof c === 'string' ? `- ${c}` : `- ${c.name}${c.role ? ` (${c.role})` : ''}`
            ).join('\n') || 'No specific characters'}

PROJECT CONTEXT:
- Genre: ${genre || projectInfo.project_genre || 'Not specified'}
- Tone: ${tone || projectInfo.project_tone || 'Not specified'}
- Visual Style: ${visualStyle || 'Cinematic'}
${prefsContext}
SCENE DURATION: ${sceneDuration} seconds total
${targetShotCount ? `TARGET SHOT COUNT: ${targetShotCount} shots` : `Generate 8-15 shots. The SUM of all shot durations MUST equal exactly ${sceneDuration} seconds.`}

REQUIREMENTS:
- Break down EVERY line of dialogue, action beat, and reaction into separate shots
- Extract dialogue lines into the "dialogue" field for each shot
- Start with an establishing/wide shot, then work through medium and close-up shots
- Use shot/reverse-shot (over-shoulder) for dialogue sequences
- Include reaction shots and inserts where appropriate
- Use cameraType values EXACTLY from: establishing, wide, full, medium, medium-close, close-up, extreme-close-up, over-shoulder, two-shot, pov, insert
- Total of all shot durations MUST equal ${sceneDuration} seconds`
            : `Break down this scene synopsis into a COMPLETE shot list.

SCENE: ${scene.title || scene.scene_title || `Scene ${scene.scene_number}`}

SYNOPSIS:
${contentForPrompt}

LOCATION: ${scene.location || scene.scene_location || 'Not specified'}
TIME OF DAY: ${scene.time_of_day || scene.scene_time || 'day'}
EMOTIONAL BEAT: ${scene.emotional_beat || 'Not specified'}

CHARACTERS INVOLVED:
${(scene.characters_involved || scene.characters_present || []).map((c: any) =>
                typeof c === 'string' ? `- ${c}` : `- ${c.name}${c.role ? ` (${c.role})` : ''}`
            ).join('\n') || 'No specific characters'}

PROJECT CONTEXT:
- Genre: ${genre || projectInfo.project_genre || 'Not specified'}
- Tone: ${tone || projectInfo.project_tone || 'Not specified'}
- Visual Style: ${visualStyle || 'Cinematic'}
${prefsContext}
SCENE DURATION: ${sceneDuration} seconds total
${targetShotCount ? `TARGET SHOT COUNT: ${targetShotCount} shots` : `Generate 8-15 shots. The SUM of all shot durations MUST equal exactly ${sceneDuration} seconds.`}

REQUIREMENTS:
- Imagine the full scene and break it into 8-15 camera setups
- Use cameraType values EXACTLY from: establishing, wide, full, medium, medium-close, close-up, extreme-close-up, over-shoulder, two-shot, pov, insert
- Total of all shot durations MUST equal ${sceneDuration} seconds`;

        // Call AI via unified provider system
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: SHOT_LIST_SYSTEM,
            maxTokens: 4500,
            temperature: 0.7,
            tier,
        });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'Failed to generate shot list' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let shots: Array<{
            shotNumber: number;
            cameraType: string;
            cameraAngle: string;
            cameraMovement: string;
            duration: number;
            shotDescription: string;
            action: string;
            dialogue?: string;
            blocking?: string;
            lighting?: string;
            audio?: string;
            notes?: string;
        }>;

        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            shots = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Delete existing shots for this scene (soft delete) - use scene_plot_id column
        try {
            await sql`
              UPDATE scene_shots
              SET deleted_at = NOW()
              WHERE scene_plot_id = ${sceneId}::uuid AND deleted_at IS NULL
            `;
        } catch (e) {
            console.log('[generate-shots] No deleted_at column, trying simple delete');
            // Table might not have deleted_at - just proceed without soft delete
        }

        // Insert new shots using correct column names from actual DB schema
        const createdShots = [];

        for (const shot of shots) {
            try {
                const insertResult = await sql`
                  INSERT INTO scene_shots (
                    scene_plot_id, shot_number, shot_type, shot_size, shot_angle,
                    shot_description, duration_seconds, camera_movement, 
                    audio_notes, visual_notes, dialogue, action
                  ) VALUES (
                    ${sceneId}::uuid,
                    ${shot.shotNumber},
                    ${shot.cameraType || 'medium'},
                    ${shot.cameraType || 'medium'},
                    ${shot.cameraAngle || 'eye-level'},
                    ${shot.shotDescription || shot.action || ''},
                    ${shot.duration || 5},
                    ${shot.cameraMovement || 'static'},
                    ${shot.audio || null},
                    ${shot.lighting || shot.blocking || shot.notes || null},
                    ${shot.dialogue || null},
                    ${shot.action || null}
                  )
                  RETURNING *
                `;

                if (insertResult[0]) {
                    createdShots.push(insertResult[0]);
                }
            } catch (insertError: any) {
                console.error('[generate-shots] Insert error:', insertError?.message);
            }
        }

        // Update scene - scene_plots doesn't have status column, skip
        // Just update updated_at if column exists
        try {
            await sql`
              UPDATE scene_plots
              SET updated_at = NOW()
              WHERE id = ${sceneId}::uuid
            `;
        } catch (e) {
            // Column might not exist, continue anyway
        }

        // Deduct credits if userId provided
        if (userId) {
            await deductCredits(
                userId,
                creditCost,
                "text_generation",
                `shots_${sceneId}_${Date.now()}`,
                `Shot list generation`
            );
        }

        return NextResponse.json({
            success: true,
            shots: createdShots,
            count: createdShots.length,
            creditsUsed: creditCost,
            provider: aiResult.provider
        });
    } catch (error: any) {
        console.error('Error generating shot list:', {
            message: error?.message,
            stack: error?.stack?.slice(0, 500),
            name: error?.name
        });
        return NextResponse.json(
            { error: 'Failed to generate shot list', details: error?.message },
            { status: 500 }
        );
    }
}
