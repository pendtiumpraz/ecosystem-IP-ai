import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ModelsLab fetch endpoint for checking job status
const MODELSLAB_FETCH_URL = 'https://modelslab.com/api/v7/video-fusion/fetch';

// POST - Check status of processing clips and update with results
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clipIds, animationVersionId } = body;

        // Get ModelsLab API key
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

        // Get processing clips
        let processingClips: any[] = [];

        if (clipIds && Array.isArray(clipIds)) {
            processingClips = await sql`
                SELECT id, animation_version_id, job_id, status
                FROM animation_clips
                WHERE id = ANY(${clipIds}) AND status = 'processing' AND job_id IS NOT NULL
            `;
        } else if (animationVersionId) {
            processingClips = await sql`
                SELECT id, animation_version_id, job_id, status
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId} 
                  AND status = 'processing' 
                  AND job_id IS NOT NULL
            `;
        } else {
            return NextResponse.json({ error: 'No clips specified' }, { status: 400 });
        }

        if (processingClips.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No processing clips to check',
                updated: 0
            });
        }

        const results: { clipId: string; status: string; videoUrl?: string }[] = [];

        for (const clip of processingClips) {
            try {
                const fetchResult = await fetchJobStatus(clip.job_id, apiKey);

                if (fetchResult.status === 'success' && fetchResult.videoUrl) {
                    // Job completed - update clip
                    await sql`
                        UPDATE animation_clips SET 
                            video_url = ${fetchResult.videoUrl},
                            status = 'completed',
                            updated_at = NOW()
                        WHERE id = ${clip.id}
                    `;

                    // Update version progress
                    await updateVersionProgress(clip.animation_version_id);

                    results.push({
                        clipId: clip.id,
                        status: 'completed',
                        videoUrl: fetchResult.videoUrl
                    });

                } else if (fetchResult.status === 'failed') {
                    await sql`
                        UPDATE animation_clips SET 
                            status = 'failed',
                            error_message = ${fetchResult.error || 'Job failed'},
                            updated_at = NOW()
                        WHERE id = ${clip.id}
                    `;

                    results.push({
                        clipId: clip.id,
                        status: 'failed'
                    });

                } else {
                    // Still processing
                    results.push({
                        clipId: clip.id,
                        status: 'processing'
                    });
                }

            } catch (error: any) {
                console.error(`Failed to check status for clip ${clip.id}:`, error);
                results.push({
                    clipId: clip.id,
                    status: 'error'
                });
            }
        }

        const completedCount = results.filter(r => r.status === 'completed').length;
        return NextResponse.json({
            success: true,
            checked: results.length,
            completed: completedCount,
            results
        });

    } catch (error: any) {
        console.error('Error checking video status:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function fetchJobStatus(jobId: string, apiKey: string): Promise<{
    status: 'success' | 'processing' | 'failed';
    videoUrl?: string;
    error?: string;
}> {
    try {
        const response = await fetch(MODELSLAB_FETCH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key: apiKey,
                request_id: jobId,
            }),
        });

        const data = await response.json();
        console.log(`[Video Status] Job ${jobId}:`, JSON.stringify(data).substring(0, 300));

        if (data.status === 'success' && data.output && data.output.length > 0) {
            return {
                status: 'success',
                videoUrl: data.output[0],
            };
        }

        if (data.status === 'processing' || data.status === 'queued') {
            return { status: 'processing' };
        }

        if (data.status === 'error' || data.status === 'failed') {
            return {
                status: 'failed',
                error: data.error || data.message || 'Job failed',
            };
        }

        // Still processing by default
        return { status: 'processing' };

    } catch (error: any) {
        console.error('[Video Status] Fetch error:', error);
        return {
            status: 'failed',
            error: error.message,
        };
    }
}

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
