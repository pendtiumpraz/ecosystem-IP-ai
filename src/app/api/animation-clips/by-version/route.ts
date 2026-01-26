/**
 * Animation Clips API - Get all clips for an animation version
 * GET /api/animation-clips/by-version?animationVersionId=xxx&beatKey=xxx
 * 
 * Returns clips with scene plot status for display in UI
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const animationVersionId = searchParams.get('animationVersionId');
        const beatKey = searchParams.get('beatKey');

        if (!animationVersionId) {
            return NextResponse.json(
                { error: 'animationVersionId is required' },
                { status: 400 }
            );
        }

        let clips: any[];

        if (beatKey) {
            clips = await sql`
                SELECT 
                    id,
                    animation_version_id,
                    moodboard_item_id,
                    beat_key,
                    beat_label,
                    clip_order,
                    source_image_url,
                    key_action_description,
                    video_prompt,
                    scene_plot,
                    scene_plot_preference,
                    duration,
                    camera_motion,
                    camera_angle,
                    video_url,
                    status,
                    created_at,
                    updated_at
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId}
                AND beat_key = ${beatKey}
                ORDER BY clip_order
            `;
        } else {
            clips = await sql`
                SELECT 
                    id,
                    animation_version_id,
                    moodboard_item_id,
                    beat_key,
                    beat_label,
                    clip_order,
                    source_image_url,
                    key_action_description,
                    video_prompt,
                    scene_plot,
                    scene_plot_preference,
                    duration,
                    camera_motion,
                    camera_angle,
                    video_url,
                    status,
                    created_at,
                    updated_at
                FROM animation_clips
                WHERE animation_version_id = ${animationVersionId}
                ORDER BY clip_order
            `;
        }

        // Group by beat
        const clipsByBeat: Record<string, any[]> = {};

        clips.forEach(clip => {
            const key = clip.beat_key || 'unknown';
            if (!clipsByBeat[key]) {
                clipsByBeat[key] = [];
            }
            clipsByBeat[key].push({
                ...clip,
                hasScenePlot: !!clip.scene_plot?.shots?.length,
                hasPrompt: !!clip.video_prompt,
                hasAnimation: !!clip.video_url,
                shotsCount: clip.scene_plot?.shots?.length || 0,
                totalDuration: clip.scene_plot?.shots?.reduce(
                    (sum: number, s: any) => sum + (s.durationSeconds || 0), 0
                ) || 0
            });
        });

        // Calculate summary stats
        const summary = {
            totalClips: clips.length,
            withScenePlot: clips.filter(c => c.scene_plot?.shots?.length > 0).length,
            withPrompt: clips.filter(c => c.video_prompt).length,
            withAnimation: clips.filter(c => c.video_url).length,
            beatCount: Object.keys(clipsByBeat).length
        };

        return NextResponse.json({
            success: true,
            animationVersionId,
            beatKey: beatKey || null,
            summary,
            clipsByBeat,
            clips
        });

    } catch (error: any) {
        console.error('Get clips by version error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
