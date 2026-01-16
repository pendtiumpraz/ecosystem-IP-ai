import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from '@/lib/ai-providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate video prompts for animation clips
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clipIds, animationVersionId, beatKey, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Determine which clips to process
        let clipsToProcess: any[] = [];

        if (clipIds && Array.isArray(clipIds)) {
            // Specific clips
            clipsToProcess = await sql`
                SELECT id, beat_key, beat_label, key_action_description, source_image_url,
                       camera_motion, camera_angle, duration
                FROM animation_clips
                WHERE id = ANY(${clipIds})
            `;
        } else if (animationVersionId && beatKey) {
            // All clips in a beat
            clipsToProcess = await sql`
                SELECT id, beat_key, beat_label, key_action_description, source_image_url,
                       camera_motion, camera_angle, duration
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId} AND beat_key = ${beatKey}
            `;
        } else if (animationVersionId) {
            // All clips in version
            clipsToProcess = await sql`
                SELECT id, beat_key, beat_label, key_action_description, source_image_url,
                       camera_motion, camera_angle, duration
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId}
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

                // Build full prompt with system instruction
                const fullPrompt = `You are an expert cinematographer and video prompt engineer. 
Generate cinematic video prompts for image-to-video AI models.
Your prompts should describe:
1. The motion/action happening in the scene
2. Camera movement (orbit, zoom, pan, etc.)
3. Lighting and atmosphere
4. Duration and pacing

Output ONLY valid JSON with the exact format requested.

${promptInstruction}`;

                // Generate with AI
                const response = await generateText(fullPrompt, {
                    tier: 'trial',
                    userId,
                    maxTokens: 500,
                    temperature: 0.7,
                });

                if (!response.success || !response.result) {
                    throw new Error(response.error || 'AI generation failed');
                }

                // Parse the response
                let parsedResult: { videoPrompt: string; cameraMotion: string; suggestedDuration?: number } = {
                    videoPrompt: '',
                    cameraMotion: 'static'
                };

                try {
                    // Try to extract JSON from the response
                    const jsonMatch = response.result.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        parsedResult = JSON.parse(jsonMatch[0]);
                    } else {
                        // If no JSON, use the whole response as prompt
                        parsedResult.videoPrompt = response.result.trim();
                    }
                } catch (parseError) {
                    // Use raw response if JSON parsing fails
                    parsedResult.videoPrompt = response.result.trim();
                }

                // Update the clip
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
    const keyAction = clip.key_action_description || 'A character in the scene';
    const beatLabel = clip.beat_label || clip.beat_key || 'Scene';
    const duration = clip.duration || versionSettings.default_duration || 6;
    const cameraHint = clip.camera_motion !== 'static' ? `Preferred camera motion: ${clip.camera_motion}` : '';

    return `Based on this scene from a moodboard, generate a cinematic video prompt for image-to-video generation.

Scene: ${beatLabel}
Key Action/Description: ${keyAction}
Duration: ${duration} seconds
${cameraHint}

Generate a prompt that:
1. Describes realistic, subtle motion that brings the scene to life
2. Maintains character consistency (same pose, outfit, appearance)
3. Adds cinematic camera movement if appropriate
4. Creates atmospheric depth (lighting, particles, environment)
5. Avoids drastic changes to the original image composition

Output JSON format:
{
  "videoPrompt": "A detailed video prompt describing the motion, atmosphere, and camera work...",
  "cameraMotion": "orbit|zoom_in|zoom_out|pan_left|pan_right|static|ken_burns|parallax",
  "suggestedDuration": ${duration}
}`;
}
