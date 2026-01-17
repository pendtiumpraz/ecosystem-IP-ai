import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ModelsLab LTX-2-Pro Image to Video API
const MODELSLAB_API_URL = 'https://modelslab.com/api/v7/video-fusion/image-to-video';

interface VideoGenerationRequest {
    clipId?: string;
    clipIds?: string[];
    animationVersionId?: string;
    beatKey?: string;
    userId: string;
}

// POST - Generate videos for animation clips
export async function POST(request: NextRequest) {
    try {
        const body: VideoGenerationRequest = await request.json();
        const { clipId, clipIds, animationVersionId, beatKey, userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get ModelsLab API key from platform keys
        const apiKeyResult = await sql`
            SELECT pk.encrypted_key as api_key
            FROM platform_api_keys pk
            JOIN ai_providers p ON pk.provider_id = p.id
            WHERE p.slug = 'modelslab' AND pk.is_active = true
            ORDER BY pk.usage_count ASC
            LIMIT 1
        `;

        if (apiKeyResult.length === 0) {
            return NextResponse.json({ error: 'No ModelsLab API key configured' }, { status: 500 });
        }

        const apiKey = apiKeyResult[0].api_key;

        // Determine which clips to process
        let clipsToProcess: any[] = [];

        if (clipId) {
            // Single clip
            clipsToProcess = await sql`
                SELECT id, animation_version_id, source_image_url, video_prompt, 
                       duration, fps, resolution, camera_motion, status
                FROM animation_clips
                WHERE id = ${clipId} AND status = 'prompt_ready'
            `;
        } else if (clipIds && Array.isArray(clipIds)) {
            // Multiple specific clips
            clipsToProcess = await sql`
                SELECT id, animation_version_id, source_image_url, video_prompt, 
                       duration, fps, resolution, camera_motion, status
                FROM animation_clips
                WHERE id = ANY(${clipIds}) AND status = 'prompt_ready'
            `;
        } else if (animationVersionId && beatKey) {
            // All clips in a beat with prompts ready
            clipsToProcess = await sql`
                SELECT id, animation_version_id, source_image_url, video_prompt, 
                       duration, fps, resolution, camera_motion, status
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId} 
                  AND beat_key = ${beatKey}
                  AND status = 'prompt_ready'
            `;
        } else if (animationVersionId) {
            // All clips in version with prompts ready
            clipsToProcess = await sql`
                SELECT id, animation_version_id, source_image_url, video_prompt, 
                       duration, fps, resolution, camera_motion, status
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId} 
                  AND status = 'prompt_ready'
            `;
        } else {
            return NextResponse.json({ error: 'No clips specified' }, { status: 400 });
        }

        if (clipsToProcess.length === 0) {
            return NextResponse.json({
                error: 'No clips with prompts ready. Generate prompts first.',
                hint: 'Clips must have status "prompt_ready" to generate videos'
            }, { status: 400 });
        }

        const results: { clipId: string; jobId?: string; success: boolean; error?: string }[] = [];

        for (const clip of clipsToProcess) {
            try {
                // Mark clip as queued
                await sql`
                    UPDATE animation_clips SET 
                        status = 'queued',
                        updated_at = NOW()
                    WHERE id = ${clip.id}
                `;

                // Call ModelsLab API
                const videoResult = await generateVideoWithModelsLab(
                    clip,
                    apiKey
                );

                if (videoResult.success) {
                    // Create new video version
                    const versionNumber = await getNextVersionNumber(clip.id);

                    if (videoResult.videoUrl) {
                        // Sync result - video URL returned immediately
                        // Deactivate all existing versions
                        await sql`
                            UPDATE clip_video_versions SET is_active = false 
                            WHERE clip_id = ${clip.id}
                        `;

                        // Create new active version
                        const newVersion = await sql`
                            INSERT INTO clip_video_versions (
                                clip_id, version_number, source, video_url, 
                                prompt, camera_motion, duration, job_id, is_active
                            ) VALUES (
                                ${clip.id}, ${versionNumber}, 'generated', ${videoResult.videoUrl},
                                ${clip.video_prompt}, ${clip.camera_motion || 'static'}, 
                                ${clip.duration || 6}, ${videoResult.jobId || null}, true
                            )
                            RETURNING id
                        `;

                        // Update clip with new active version
                        await sql`
                            UPDATE animation_clips SET 
                                video_url = ${videoResult.videoUrl},
                                thumbnail_url = ${videoResult.thumbnailUrl || null},
                                job_id = ${videoResult.jobId || null},
                                active_video_version_id = ${newVersion[0].id},
                                status = 'completed',
                                updated_at = NOW()
                            WHERE id = ${clip.id}
                        `;

                        // Update version completed count
                        await updateVersionProgress(clip.animation_version_id);

                    } else if (videoResult.jobId) {
                        // Async result - create version in pending state
                        await sql`
                            UPDATE clip_video_versions SET is_active = false 
                            WHERE clip_id = ${clip.id}
                        `;

                        await sql`
                            INSERT INTO clip_video_versions (
                                clip_id, version_number, source, 
                                prompt, camera_motion, duration, job_id, is_active
                            ) VALUES (
                                ${clip.id}, ${versionNumber}, 'generated',
                                ${clip.video_prompt}, ${clip.camera_motion || 'static'}, 
                                ${clip.duration || 6}, ${videoResult.jobId}, true
                            )
                        `;

                        await sql`
                            UPDATE animation_clips SET 
                                job_id = ${videoResult.jobId},
                                eta_seconds = ${videoResult.eta || 60},
                                status = 'processing',
                                updated_at = NOW()
                            WHERE id = ${clip.id}
                        `;
                    }

                    results.push({
                        clipId: clip.id,
                        jobId: videoResult.jobId,
                        success: true
                    });
                } else {
                    await sql`
                        UPDATE animation_clips SET 
                            status = 'failed',
                            error_message = ${videoResult.error || 'Unknown error'},
                            updated_at = NOW()
                        WHERE id = ${clip.id}
                    `;

                    results.push({
                        clipId: clip.id,
                        success: false,
                        error: videoResult.error
                    });
                }

            } catch (clipError: any) {
                console.error(`Failed to generate video for clip ${clip.id}:`, clipError);

                await sql`
                    UPDATE animation_clips SET 
                        status = 'failed',
                        error_message = ${clipError.message || 'Generation failed'},
                        updated_at = NOW()
                    WHERE id = ${clip.id}
                `;

                results.push({
                    clipId: clip.id,
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
        console.error('Error generating videos:', error);
        return NextResponse.json({ error: error.message || 'Failed to generate videos' }, { status: 500 });
    }
}

// Generate video using ModelsLab LTX-2-Pro
async function generateVideoWithModelsLab(
    clip: any,
    apiKey: string
): Promise<{ success: boolean; videoUrl?: string; thumbnailUrl?: string; jobId?: string; eta?: number; error?: string }> {

    try {
        const prompt = clip.video_prompt || 'Subtle motion, cinematic atmosphere';
        const duration = clip.duration || 6;
        const resolution = clip.resolution || '1920x1080';

        // Build request body for LTX-2-Pro Image to Video
        const requestBody = {
            key: apiKey,
            model_id: "ltx-2-pro-i2v",
            init_image: clip.source_image_url,
            prompt: prompt,
            negative_prompt: "blurry, distorted, ugly, deformed, low quality, text, watermark",
            resolution: resolution,
            duration: String(duration),
            fps: String(clip.fps || 25),
            generate_audio: false,
            seed: null,
            temp: "yes", // Use temp storage
            webhook: null, // Could add webhook for async processing
            track_id: clip.id, // Track which clip this is for
        };

        console.log(`[Video Gen] Calling ModelsLab for clip ${clip.id}:`, {
            model: requestBody.model_id,
            prompt: prompt.substring(0, 100) + '...',
            duration: requestBody.duration,
            resolution: requestBody.resolution
        });

        const response = await fetch(MODELSLAB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log(`[Video Gen] ModelsLab response:`, JSON.stringify(data).substring(0, 500));

        // Check for immediate output
        if (data.output && data.output.length > 0) {
            return {
                success: true,
                videoUrl: data.output[0],
                jobId: data.id,
            };
        }

        // Check for future_links (async processing)
        if (data.future_links && data.future_links.length > 0) {
            return {
                success: true,
                videoUrl: data.future_links[0],
                jobId: data.id,
                eta: data.eta || 60,
            };
        }

        // Check for processing status
        if (data.status === 'processing' || data.status === 'queued') {
            return {
                success: true,
                jobId: data.id,
                eta: data.eta || 120,
            };
        }

        // Error case
        if (data.status === 'error' || data.error) {
            return {
                success: false,
                error: data.error || data.message || 'ModelsLab API error',
            };
        }

        // Unknown response format
        return {
            success: false,
            error: `Unexpected response format: ${JSON.stringify(data).substring(0, 200)}`,
        };

    } catch (error: any) {
        console.error('[Video Gen] ModelsLab API error:', error);
        return {
            success: false,
            error: error.message || 'Failed to call ModelsLab API',
        };
    }
}

// Update version progress when a clip completes
async function updateVersionProgress(versionId: string) {
    try {
        await sql`
            UPDATE animation_versions SET 
                completed_clips = (
                    SELECT COUNT(*) FROM animation_clips 
                    WHERE animation_version_id = ${versionId} AND status = 'completed'
                ),
                status = CASE 
                    WHEN (SELECT COUNT(*) FROM animation_clips WHERE animation_version_id = ${versionId} AND status = 'completed') 
                         = (SELECT COUNT(*) FROM animation_clips WHERE animation_version_id = ${versionId})
                    THEN 'completed'
                    ELSE 'generating'
                END,
                updated_at = NOW()
            WHERE id = ${versionId}
        `;
    } catch (error) {
        console.error('Failed to update version progress:', error);
    }
}

// Get next version number for a clip
async function getNextVersionNumber(clipId: string): Promise<number> {
    const result = await sql`
        SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
        FROM clip_video_versions
        WHERE clip_id = ${clipId}
    `;
    return result[0].next_version;
}
