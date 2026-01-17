import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateWithAI, GenerationRequest } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate video prompts for animation clips
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clipIds, animationVersionId, beatKey, userId, projectId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Determine which clips to process
        let clipsToProcess: any[] = [];

        if (clipIds && Array.isArray(clipIds)) {
            clipsToProcess = await sql`
                SELECT ac.id, ac.beat_key, ac.beat_label, ac.key_action_description, ac.source_image_url,
                       ac.camera_motion, ac.camera_angle, ac.duration, ac.moodboard_item_id,
                       mi.prompt as image_prompt, mi.universe_level, mi.characters_involved
                FROM animation_clips ac
                LEFT JOIN moodboard_items mi ON ac.moodboard_item_id::uuid = mi.id
                WHERE ac.id = ANY(${clipIds})
            `;
        } else if (animationVersionId && beatKey) {
            clipsToProcess = await sql`
                SELECT ac.id, ac.beat_key, ac.beat_label, ac.key_action_description, ac.source_image_url,
                       ac.camera_motion, ac.camera_angle, ac.duration, ac.moodboard_item_id,
                       mi.prompt as image_prompt, mi.universe_level, mi.characters_involved
                FROM animation_clips ac
                LEFT JOIN moodboard_items mi ON ac.moodboard_item_id::uuid = mi.id
                WHERE ac.animation_version_id = ${animationVersionId} AND ac.beat_key = ${beatKey}
            `;
        } else if (animationVersionId) {
            clipsToProcess = await sql`
                SELECT ac.id, ac.beat_key, ac.beat_label, ac.key_action_description, ac.source_image_url,
                       ac.camera_motion, ac.camera_angle, ac.duration, ac.moodboard_item_id,
                       mi.prompt as image_prompt, mi.universe_level, mi.characters_involved
                FROM animation_clips ac
                LEFT JOIN moodboard_items mi ON ac.moodboard_item_id::uuid = mi.id
                WHERE ac.animation_version_id = ${animationVersionId}
            `;
        } else {
            return NextResponse.json({ error: 'No clips specified' }, { status: 400 });
        }

        if (clipsToProcess.length === 0) {
            return NextResponse.json({ error: 'No clips found' }, { status: 404 });
        }

        // Get animation version settings
        let versionSettings: any = {};
        if (animationVersionId) {
            const version = await sql`
                SELECT default_duration, default_fps, default_resolution, effect_preset
                FROM animation_versions WHERE id = ${animationVersionId}
            `;
            if (version.length > 0) {
                versionSettings = version[0];
            }
        }

        const results: { clipId: string; prompt: string; cameraMotion: string; success: boolean; error?: string }[] = [];

        for (const clip of clipsToProcess) {
            try {
                const promptInstruction = buildVideoPromptInstruction(clip, versionSettings);

                const fullPrompt = `You are an expert cinematographer and motion design artist for image-to-video AI generation.

Create a detailed, structured video prompt that transforms a static moodboard image into a cinematic video clip.

${promptInstruction}`;

                const genRequest: GenerationRequest = {
                    userId,
                    projectId: projectId || 'animation',
                    generationType: 'animation_video_prompt',
                    prompt: fullPrompt,
                };

                const response = await generateWithAI(genRequest);

                if (!response.success || !response.resultText) {
                    throw new Error(response.error || 'AI generation failed');
                }

                // Parse the response
                let parsedResult: {
                    videoPrompt: string;
                    cameraMotion: string;
                    motionDetails?: any;
                } = {
                    videoPrompt: '',
                    cameraMotion: 'static'
                };

                try {
                    const jsonMatch = response.resultText.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedResult = JSON.parse(jsonMatch[0]);
                    } else {
                        parsedResult.videoPrompt = response.resultText.trim();
                    }
                } catch (parseError) {
                    parsedResult.videoPrompt = response.resultText.trim();
                }

                // Update the clip with structured prompt
                await sql`
                    UPDATE animation_clips SET
                        video_prompt = ${parsedResult.videoPrompt},
                        camera_motion = ${parsedResult.cameraMotion || clip.camera_motion || 'static'},
                        status = 'prompt_ready',
                        updated_at = NOW()
                    WHERE id = ${clip.id}
                `;

                results.push({
                    clipId: clip.id,
                    prompt: parsedResult.videoPrompt,
                    cameraMotion: parsedResult.cameraMotion,
                    success: true
                });

            } catch (clipError: any) {
                console.error(`Failed to generate prompt for clip ${clip.id}:`, clipError);
                results.push({
                    clipId: clip.id,
                    prompt: '',
                    cameraMotion: '',
                    success: false,
                    error: clipError.message
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        return NextResponse.json({
            success: successCount > 0,
            processed: results.length,
            succeeded: successCount,
            results
        });

    } catch (error: any) {
        console.error('Error generating video prompts:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate prompts' }, { status: 500 });
    }
}

function buildVideoPromptInstruction(clip: any, versionSettings: any): string {
    const keyAction = clip.key_action_description || 'A character performing an action in the scene';
    const beatLabel = clip.beat_label || clip.beat_key || 'Scene';
    const duration = clip.duration || versionSettings.default_duration || 6;
    const imagePrompt = clip.image_prompt || '';
    const universeLevel = clip.universe_level || '';
    const preferredCamera = clip.camera_motion && clip.camera_motion !== 'static' ? clip.camera_motion : null;

    return `=== SOURCE CONTEXT ===
Story Beat: ${beatLabel}
Key Action Description: ${keyAction}
${imagePrompt ? `\nOriginal Image Prompt (YAML):\n${imagePrompt}` : ''}
${universeLevel ? `Location Context: ${universeLevel}` : ''}

=== VIDEO REQUIREMENTS ===
Target Duration: ${duration} seconds
${preferredCamera ? `Preferred Camera Motion: ${preferredCamera}` : ''}

=== INSTRUCTIONS ===
Based on the key action and original image prompt above, create a video generation prompt that:

1. **MOTION BREAKDOWN** - Describe specific motions:
   - Character movement (subtle gestures, head turns, expressions)
   - Environmental motion (wind, particles, ambient movement)
   - Camera motion (smooth, cinematic movements)

2. **PRESERVE IMAGE ELEMENTS** - Maintain consistency with source image:
   - Character appearance, pose, and outfit
   - Scene composition and framing
   - Lighting and color palette
   - Art style and mood

3. **CINEMATIC QUALITY** - Add film-like qualities:
   - Depth of field effects
   - Atmospheric particles (dust, light rays)
   - Natural motion blur
   - Smooth transitions

=== OUTPUT FORMAT (JSON) ===
{
  "videoPrompt": "YAML-structured prompt dengan format:
motion:
  subject: [gerakan utama karakter/subjek sesuai key action]
  face: [ekspresi wajah dan gerakan mata]
  body: [gerakan tubuh halus, gestur]
  
environment:
  ambient: [gerakan lingkungan: angin, partikel, cahaya]
  atmosphere: [efek atmosfer: kabut, debu, sinar]
  
camera:
  movement: [orbit/pan/zoom/static/ken_burns/parallax]
  speed: [slow/medium/fast]
  focus: [subject/environment/pull_focus]
  
style:
  mood: [suasana: dramatic/peaceful/tense/joyful]
  lighting: [pencahayaan: natural/dramatic/soft/hard]
  quality: cinematic, smooth motion, film grain
  
duration: ${duration}s",
  
  "cameraMotion": "orbit|zoom_in|zoom_out|pan_left|pan_right|static|ken_burns|parallax",
  "suggestedDuration": ${duration}
}

IMPORTANT:
- Video prompt MUST match the key action: "${keyAction.substring(0, 80)}..."
- Keep character appearance EXACTLY as in original image
- Motion should be SUBTLE and REALISTIC - avoid exaggerated movements
- Output ONLY valid JSON`;
}
