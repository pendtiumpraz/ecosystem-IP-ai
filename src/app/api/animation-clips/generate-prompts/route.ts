/**
 * Generate Prompts API
 * POST /api/animation-clips/generate-prompts
 * 
 * Generates animation prompts using scene plot data
 * Scene plot informs camera angle, shot type, movement
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';

const sql = neon(process.env.DATABASE_URL!);

interface GenerateRequest {
    clipIds: string[];           // Specific clip IDs to generate for
    beatKey?: string;            // Optional: filter by beat
    animationVersionId?: string; // Optional: filter by animation version
    userId: string;              // For credit deduction
    artStyle?: string;           // Optional: art style hint
}

// Camera movement to prompt text mapping
const CAMERA_MOVEMENT_TEXT: Record<string, string> = {
    'static': 'Camera holds still',
    'pan-left': 'Camera pans smoothly to the left',
    'pan-right': 'Camera pans smoothly to the right',
    'tilt-up': 'Camera tilts upward',
    'tilt-down': 'Camera tilts downward',
    'dolly-in': 'Camera slowly moves toward the subject',
    'dolly-out': 'Camera pulls back from the subject',
    'tracking': 'Camera follows the subject movement',
    'crane-up': 'Camera rises vertically',
    'crane-down': 'Camera descends vertically',
    'handheld': 'Slight handheld camera movement',
    'steadicam': 'Smooth floating camera movement',
    'zoom-in': 'Lens zooms in on the subject',
    'zoom-out': 'Lens zooms out from the subject'
};

// Shot angle to prompt text mapping
const SHOT_ANGLE_TEXT: Record<string, string> = {
    'eye-level': 'at eye level',
    'high': 'from a high angle looking down',
    'low': 'from a low angle looking up',
    'dutch': 'with a tilted dutch angle',
    'birds-eye': 'from directly above',
    'worms-eye': 'from directly below'
};

// Shot type to prompt text mapping
const SHOT_TYPE_TEXT: Record<string, string> = {
    'establishing': 'Wide establishing shot',
    'wide': 'Wide shot',
    'full': 'Full body shot',
    'medium': 'Medium shot',
    'medium-close': 'Medium close-up',
    'close-up': 'Close-up',
    'extreme-close-up': 'Extreme close-up',
    'over-shoulder': 'Over the shoulder shot',
    'two-shot': 'Two-shot',
    'group': 'Group shot',
    'pov': 'Point of view shot',
    'insert': 'Insert/cutaway shot'
};

function buildPromptFromScenePlot(
    keyActionDescription: string,
    scenePlot: any,
    artStyle?: string
): string {
    if (!scenePlot?.shots?.length) {
        // No scene plot, generate basic prompt
        return keyActionDescription;
    }

    const shots = scenePlot.shots;

    // Build cinematic prompt from scene plot data
    const parts: string[] = [];

    // Main action description
    parts.push(keyActionDescription);

    // Add camera/cinematography info from first shot (primary shot)
    const primaryShot = shots[0];

    if (primaryShot) {
        const shotType = SHOT_TYPE_TEXT[primaryShot.shotType] || 'Medium shot';
        const shotAngle = SHOT_ANGLE_TEXT[primaryShot.shotAngle] || '';
        const cameraMovement = CAMERA_MOVEMENT_TEXT[primaryShot.cameraMovement] || '';

        parts.push(`${shotType} ${shotAngle}.`);

        if (cameraMovement && primaryShot.cameraMovement !== 'static') {
            parts.push(cameraMovement + '.');
        }

        if (primaryShot.shotDescription) {
            parts.push(primaryShot.shotDescription);
        }

        if (primaryShot.durationSeconds) {
            parts.push(`Duration: ${primaryShot.durationSeconds} seconds.`);
        }
    }

    // Add art style if provided
    if (artStyle) {
        parts.push(`Style: ${artStyle}.`);
    }

    // Add cinematic quality hints
    parts.push('Cinematic lighting, professional composition, high quality.');

    return parts.filter(Boolean).join(' ');
}

export async function POST(request: Request) {
    try {
        const body: GenerateRequest = await request.json();
        const { clipIds, beatKey, animationVersionId, userId, artStyle } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Get clips to generate prompts for
        let clips: any[] = [];

        if (clipIds && clipIds.length > 0) {
            clips = await sql`
                SELECT 
                    id, beat_key, beat_label, key_action_description,
                    scene_plot, source_image_url, video_prompt
                FROM animation_clips
                WHERE id = ANY(${clipIds})
                ORDER BY clip_order
            `;
        } else if (animationVersionId) {
            if (beatKey) {
                clips = await sql`
                    SELECT 
                        id, beat_key, beat_label, key_action_description,
                        scene_plot, source_image_url, video_prompt
                    FROM animation_clips
                    WHERE animation_version_id = ${animationVersionId}
                    AND beat_key = ${beatKey}
                    ORDER BY clip_order
                `;
            } else {
                clips = await sql`
                    SELECT 
                        id, beat_key, beat_label, key_action_description,
                        scene_plot, source_image_url, video_prompt
                    FROM animation_clips
                    WHERE animation_version_id = ${animationVersionId}
                    ORDER BY clip_order
                `;
            }
        } else {
            return NextResponse.json(
                { error: 'Either clipIds or animationVersionId is required' },
                { status: 400 }
            );
        }

        if (clips.length === 0) {
            return NextResponse.json(
                { error: 'No clips found to generate prompts for' },
                { status: 404 }
            );
        }

        const results: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];

            try {
                // Build prompt from scene plot
                const videoPrompt = buildPromptFromScenePlot(
                    clip.key_action_description || '',
                    clip.scene_plot,
                    artStyle
                );

                // Optionally enhance with AI
                let enhancedPrompt = videoPrompt;

                // For now, use the built prompt directly
                // Could add AI enhancement here if needed

                // Save to database
                await sql`
                    UPDATE animation_clips
                    SET 
                        video_prompt = ${enhancedPrompt},
                        updated_at = NOW()
                    WHERE id = ${clip.id}
                `;

                results.push({
                    clipId: clip.id,
                    beatKey: clip.beat_key,
                    success: true,
                    prompt: enhancedPrompt,
                    hadScenePlot: !!clip.scene_plot?.shots?.length
                });

            } catch (clipError: any) {
                console.error(`Error generating prompt for clip ${clip.id}:`, clipError);
                errors.push({
                    clipId: clip.id,
                    beatKey: clip.beat_key,
                    error: clipError.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Generated prompts for ${results.length}/${clips.length} clips`,
            results,
            errors: errors.length > 0 ? errors : undefined,
            totalClips: clips.length,
            successCount: results.length,
            errorCount: errors.length
        });

    } catch (error: any) {
        console.error('Generate Prompts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
