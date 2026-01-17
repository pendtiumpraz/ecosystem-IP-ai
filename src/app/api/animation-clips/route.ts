import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - List clips for an animation version
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const animationVersionId = searchParams.get('animationVersionId');
        const beatKey = searchParams.get('beatKey');

        if (!animationVersionId) {
            return NextResponse.json({ error: 'Animation Version ID required' }, { status: 400 });
        }

        let clips;
        if (beatKey) {
            clips = await sql`
                SELECT 
                    ac.id, ac.animation_version_id as "animationVersionId", 
                    ac.moodboard_item_id as "moodboardItemId",
                    ac.beat_key as "beatKey", ac.beat_label as "beatLabel", ac.clip_order as "clipOrder",
                    ac.source_image_url as "sourceImageUrl", ac.key_action_description as "keyActionDescription",
                    ac.video_prompt as "videoPrompt", ac.negative_prompt as "negativePrompt",
                    ac.duration, ac.fps, ac.resolution, ac.camera_motion as "cameraMotion", ac.camera_angle as "cameraAngle",
                    ac.video_url as "videoUrl", ac.thumbnail_url as "thumbnailUrl", ac.preview_gif_url as "previewGifUrl",
                    ac.job_id as "jobId", ac.eta_seconds as "etaSeconds", ac.status, ac.error_message as "errorMessage",
                    ac.generation_cost as "generationCost", ac.created_at as "createdAt", ac.updated_at as "updatedAt",
                    COALESCE(mi.beat_index, 999) as "beatIndex"
                FROM animation_clips ac
                LEFT JOIN moodboard_items mi ON ac.moodboard_item_id = mi.id
                WHERE ac.animation_version_id = ${animationVersionId} AND ac.beat_key = ${beatKey}
                ORDER BY ac.clip_order ASC
            `;
        } else {
            clips = await sql`
                SELECT 
                    ac.id, ac.animation_version_id as "animationVersionId", 
                    ac.moodboard_item_id as "moodboardItemId",
                    ac.beat_key as "beatKey", ac.beat_label as "beatLabel", ac.clip_order as "clipOrder",
                    ac.source_image_url as "sourceImageUrl", ac.key_action_description as "keyActionDescription",
                    ac.video_prompt as "videoPrompt", ac.negative_prompt as "negativePrompt",
                    ac.duration, ac.fps, ac.resolution, ac.camera_motion as "cameraMotion", ac.camera_angle as "cameraAngle",
                    ac.video_url as "videoUrl", ac.thumbnail_url as "thumbnailUrl", ac.preview_gif_url as "previewGifUrl",
                    ac.job_id as "jobId", ac.eta_seconds as "etaSeconds", ac.status, ac.error_message as "errorMessage",
                    ac.generation_cost as "generationCost", ac.created_at as "createdAt", ac.updated_at as "updatedAt",
                    COALESCE(mi.beat_index, 999) as "beatIndex"
                FROM animation_clips ac
                LEFT JOIN moodboard_items mi ON ac.moodboard_item_id = mi.id
                WHERE ac.animation_version_id = ${animationVersionId}
                ORDER BY COALESCE(mi.beat_index, ac.clip_order), ac.clip_order ASC
            `;
        }

        return NextResponse.json({ clips });
    } catch (error: any) {
        console.error('Error fetching animation clips:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch clips' }, { status: 500 });
    }
}

// POST - Create new clip or sync from moodboard
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { animationVersionId, syncFromMoodboard, moodboardId, clips } = body;

        if (!animationVersionId) {
            return NextResponse.json({ error: 'Animation Version ID required' }, { status: 400 });
        }

        // Sync all clips from moodboard
        if (syncFromMoodboard && moodboardId) {
            // Delete existing clips
            await sql`DELETE FROM animation_clips WHERE animation_version_id = ${animationVersionId}`;

            // Get moodboard items with images, ordered by beat_index then key_action_index
            const moodboardItems = await sql`
                SELECT id, beat_key, beat_label, beat_index, key_action_index, key_action_description, image_url
                FROM moodboard_items
                WHERE moodboard_id = ${moodboardId} AND image_url IS NOT NULL
                ORDER BY beat_index ASC, key_action_index ASC
            `;

            let clipOrder = 0;
            for (const item of moodboardItems) {
                await sql`
                    INSERT INTO animation_clips (
                        animation_version_id, moodboard_item_id, beat_key, beat_label,
                        clip_order, source_image_url, key_action_description, status
                    ) VALUES (
                        ${animationVersionId}, ${item.id}, ${item.beat_key}, ${item.beat_label},
                        ${clipOrder++}, ${item.image_url}, ${item.key_action_description}, 'pending'
                    )
                `;
            }

            // Update total clips count
            await sql`UPDATE animation_versions SET total_clips = ${clipOrder} WHERE id = ${animationVersionId}`;

            return NextResponse.json({
                success: true,
                synced: clipOrder,
                message: `Synced ${clipOrder} clips from moodboard`
            });
        }

        // Create single clip or batch
        if (clips && Array.isArray(clips)) {
            for (const clip of clips) {
                await sql`
                    INSERT INTO animation_clips (
                        animation_version_id, moodboard_item_id, beat_key, beat_label,
                        clip_order, source_image_url, key_action_description, status
                    ) VALUES (
                        ${animationVersionId}, ${clip.moodboardItemId}, ${clip.beatKey}, ${clip.beatLabel},
                        ${clip.clipOrder || 0}, ${clip.sourceImageUrl}, ${clip.keyActionDescription}, 'pending'
                    )
                `;
            }
            return NextResponse.json({ success: true, created: clips.length });
        }

        return NextResponse.json({ error: 'No clips data provided' }, { status: 400 });
    } catch (error: any) {
        console.error('Error creating animation clips:', error);
        return NextResponse.json({ error: error.message || 'Failed to create clips' }, { status: 500 });
    }
}

// PATCH - Update clip (prompt, settings, status, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, videoPrompt, negativePrompt, duration, fps, resolution,
            cameraMotion, cameraAngle, videoUrl, thumbnailUrl, previewGifUrl,
            jobId, etaSeconds, status, errorMessage, clipOrder } = body;

        if (!id) {
            return NextResponse.json({ error: 'Clip ID required' }, { status: 400 });
        }

        await sql`
            UPDATE animation_clips SET
                video_prompt = COALESCE(${videoPrompt}, video_prompt),
                negative_prompt = COALESCE(${negativePrompt}, negative_prompt),
                duration = COALESCE(${duration}, duration),
                fps = COALESCE(${fps}, fps),
                resolution = COALESCE(${resolution}, resolution),
                camera_motion = COALESCE(${cameraMotion}, camera_motion),
                camera_angle = COALESCE(${cameraAngle}, camera_angle),
                video_url = COALESCE(${videoUrl}, video_url),
                thumbnail_url = COALESCE(${thumbnailUrl}, thumbnail_url),
                preview_gif_url = COALESCE(${previewGifUrl}, preview_gif_url),
                job_id = COALESCE(${jobId}, job_id),
                eta_seconds = COALESCE(${etaSeconds}, eta_seconds),
                status = COALESCE(${status}, status),
                error_message = COALESCE(${errorMessage}, error_message),
                clip_order = COALESCE(${clipOrder}, clip_order),
                updated_at = NOW()
            WHERE id = ${id}
        `;

        // If status is completed, update version's completed_clips count
        if (status === 'completed') {
            await sql`
                UPDATE animation_versions SET 
                    completed_clips = (
                        SELECT COUNT(*) FROM animation_clips 
                        WHERE animation_version_id = (
                            SELECT animation_version_id FROM animation_clips WHERE id = ${id}
                        ) AND status = 'completed'
                    ),
                    updated_at = NOW()
                WHERE id = (SELECT animation_version_id FROM animation_clips WHERE id = ${id})
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating animation clip:', error);
        return NextResponse.json({ error: error.message || 'Failed to update clip' }, { status: 500 });
    }
}

// DELETE - Remove clip
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Clip ID required' }, { status: 400 });
        }

        // Get version ID before deleting
        const clip = await sql`SELECT animation_version_id FROM animation_clips WHERE id = ${id}`;
        const versionId = clip[0]?.animation_version_id;

        await sql`DELETE FROM animation_clips WHERE id = ${id}`;

        // Update total clips count
        if (versionId) {
            await sql`
                UPDATE animation_versions SET 
                    total_clips = (SELECT COUNT(*) FROM animation_clips WHERE animation_version_id = ${versionId}),
                    updated_at = NOW()
                WHERE id = ${versionId}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting animation clip:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete clip' }, { status: 500 });
    }
}
