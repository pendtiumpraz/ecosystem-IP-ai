/**
 * Generate Scene Plots API
 * POST /api/animation-clips/generate-scene-plots
 * 
 * Generates scene plots for multiple clips (bulk operation)
 * Can be called for all clips or for clips of a specific beat
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { SCENEPLOT_PROMPT } from '@/lib/ai/prompts';
import { callAI } from '@/lib/ai-providers';

const sql = neon(process.env.DATABASE_URL!);

interface GenerateRequest {
    clipIds: string[];           // Specific clip IDs to generate for
    beatKey?: string;            // Optional: filter by beat
    animationVersionId?: string; // Optional: filter by animation version
    preference?: string;         // Global preference for all clips
    userId: string;              // For credit deduction
}

// Shot types for validation/correction
const VALID_SHOT_TYPES = [
    'establishing', 'wide', 'full', 'medium', 'medium-close',
    'close-up', 'extreme-close-up', 'over-shoulder', 'two-shot',
    'group', 'pov', 'insert'
];

const VALID_CAMERA_MOVEMENTS = [
    'static', 'pan-left', 'pan-right', 'tilt-up', 'tilt-down',
    'dolly-in', 'dolly-out', 'tracking', 'crane-up', 'crane-down',
    'handheld', 'steadicam', 'zoom-in', 'zoom-out'
];

const VALID_SHOT_ANGLES = [
    'eye-level', 'high', 'low', 'dutch', 'birds-eye', 'worms-eye'
];

export async function POST(request: Request) {
    try {
        const body: GenerateRequest = await request.json();
        const { clipIds, beatKey, animationVersionId, preference, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Get clips to generate for
        let clips: any[] = [];

        if (clipIds && clipIds.length > 0) {
            clips = await sql`
                SELECT 
                    id, beat_key, beat_label, key_action_description,
                    source_image_url, scene_plot
                FROM animation_clips
                WHERE id = ANY(${clipIds})
                ORDER BY clip_order
            `;
        } else if (animationVersionId) {
            // Get all clips for an animation version
            let query = sql`
                SELECT 
                    id, beat_key, beat_label, key_action_description,
                    source_image_url, scene_plot
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId}
            `;

            if (beatKey) {
                clips = await sql`
                    SELECT 
                        id, beat_key, beat_label, key_action_description,
                        source_image_url, scene_plot
                    FROM animation_clips
                    WHERE animation_version_id = ${animationVersionId}
                    AND beat_key = ${beatKey}
                    ORDER BY clip_order
                `;
            } else {
                clips = await sql`
                    SELECT 
                        id, beat_key, beat_label, key_action_description,
                        source_image_url, scene_plot
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
                { error: 'No clips found to generate scene plots for' },
                { status: 404 }
            );
        }

        // Generate scene plots for each clip
        const results: any[] = [];
        const errors: any[] = [];

        for (let i = 0; i < clips.length; i++) {
            const clip = clips[i];

            try {
                // Build prompt from template
                const prompt = SCENEPLOT_PROMPT
                    .replace('{beatKey}', clip.beat_key || '')
                    .replace('{beatLabel}', clip.beat_label || '')
                    .replace('{beatContent}', clip.key_action_description || '')
                    .replace('{characters}', '') // Could be enhanced with character data
                    .replace('{preference}', preference || '');

                // Call AI to generate scene plot
                const aiResponse = await callAI('text', prompt, {
                    userId,
                    temperature: 0.7,
                    maxTokens: 1500
                });

                if (!aiResponse.success || !aiResponse.result) {
                    throw new Error(aiResponse.error || 'AI generation failed');
                }

                // Parse AI response
                let scenePlot: any = null;

                try {
                    // Try to extract JSON from response
                    const jsonMatch = aiResponse.result.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);

                        // Handle both formats: { scenes: [...] } or { shots: [...] }
                        if (parsed.scenes && parsed.scenes[0]) {
                            // Take first scene's shots
                            scenePlot = {
                                shots: parsed.scenes[0].shots || [],
                                preference: preference || '',
                                generatedAt: new Date().toISOString()
                            };
                        } else if (parsed.shots) {
                            scenePlot = {
                                shots: parsed.shots,
                                preference: preference || '',
                                generatedAt: new Date().toISOString()
                            };
                        }

                        // Validate and fix shot data
                        if (scenePlot?.shots) {
                            scenePlot.shots = scenePlot.shots.map((shot: any, idx: number) => ({
                                shotNumber: shot.shotNumber || idx + 1,
                                shotType: VALID_SHOT_TYPES.includes(shot.shotType)
                                    ? shot.shotType : 'medium',
                                shotAngle: VALID_SHOT_ANGLES.includes(shot.shotAngle)
                                    ? shot.shotAngle : 'eye-level',
                                cameraMovement: VALID_CAMERA_MOVEMENTS.includes(shot.cameraMovement)
                                    ? shot.cameraMovement : 'static',
                                durationSeconds: shot.durationSeconds || 3,
                                shotDescription: shot.shotDescription || '',
                                action: shot.action || ''
                            }));
                        }
                    }
                } catch (parseError) {
                    console.error(`Failed to parse AI response for clip ${clip.id}:`, parseError);
                    // Create a basic scene plot as fallback
                    scenePlot = {
                        shots: [
                            {
                                shotNumber: 1,
                                shotType: 'medium',
                                shotAngle: 'eye-level',
                                cameraMovement: 'static',
                                durationSeconds: 4,
                                shotDescription: clip.key_action_description || 'Scene description',
                                action: ''
                            }
                        ],
                        preference: preference || '',
                        generatedAt: new Date().toISOString()
                    };
                }

                // Save to database
                if (scenePlot) {
                    await sql`
                        UPDATE animation_clips
                        SET 
                            scene_plot = ${JSON.stringify(scenePlot)}::jsonb,
                            scene_plot_preference = ${preference || null},
                            updated_at = NOW()
                        WHERE id = ${clip.id}
                    `;

                    results.push({
                        clipId: clip.id,
                        beatKey: clip.beat_key,
                        success: true,
                        shotsCount: scenePlot.shots?.length || 0
                    });
                }
            } catch (clipError: any) {
                console.error(`Error generating scene plot for clip ${clip.id}:`, clipError);
                errors.push({
                    clipId: clip.id,
                    beatKey: clip.beat_key,
                    error: clipError.message
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Generated scene plots for ${results.length}/${clips.length} clips`,
            results,
            errors: errors.length > 0 ? errors : undefined,
            totalClips: clips.length,
            successCount: results.length,
            errorCount: errors.length
        });

    } catch (error: any) {
        console.error('Generate Scene Plots error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
