/**
 * Scene Plot API - Get/Update scene plot for a specific clip
 * GET /api/animation-clips/[id]/scene-plot
 * PUT /api/animation-clips/[id]/scene-plot
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Scene Plot JSONB structure
interface Shot {
    shotNumber: number;
    shotType: string;      // establishing, wide, medium, close-up, etc.
    shotAngle: string;     // eye-level, high, low, dutch, birds-eye, worms-eye
    cameraMovement: string; // static, pan-left, dolly-in, tracking, etc.
    durationSeconds: number;
    shotDescription: string;
    action: string;
}

interface ScenePlot {
    shots: Shot[];
    preference?: string;
    generatedAt?: string;
}

// GET - Get scene plot for a specific clip
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const clipId = params.id;

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID is required' }, { status: 400 });
        }

        const [clip] = await sql`
            SELECT 
                id,
                beat_key,
                beat_label,
                key_action_description,
                scene_plot,
                scene_plot_preference,
                source_image_url,
                video_prompt
            FROM animation_clips
            WHERE id = ${clipId}
        `;

        if (!clip) {
            return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
        }

        return NextResponse.json({
            clipId: clip.id,
            beatKey: clip.beat_key,
            beatLabel: clip.beat_label,
            keyActionDescription: clip.key_action_description,
            scenePlot: clip.scene_plot,
            preference: clip.scene_plot_preference,
            hasScenePlot: !!clip.scene_plot?.shots?.length,
            sourceImageUrl: clip.source_image_url,
            videoPrompt: clip.video_prompt
        });
    } catch (error: any) {
        console.error('Scene Plot GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT - Update scene plot for a specific clip
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const clipId = params.id;
        const body = await request.json();
        const { scenePlot, preference } = body as { scenePlot: ScenePlot; preference?: string };

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID is required' }, { status: 400 });
        }

        if (!scenePlot || !scenePlot.shots) {
            return NextResponse.json({ error: 'Scene plot with shots is required' }, { status: 400 });
        }

        // Add timestamp
        const scenePlotWithTimestamp: ScenePlot = {
            ...scenePlot,
            generatedAt: new Date().toISOString()
        };

        // Update the clip
        const [updated] = await sql`
            UPDATE animation_clips
            SET 
                scene_plot = ${JSON.stringify(scenePlotWithTimestamp)}::jsonb,
                scene_plot_preference = ${preference || null},
                updated_at = NOW()
            WHERE id = ${clipId}
            RETURNING id, scene_plot, scene_plot_preference
        `;

        if (!updated) {
            return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Scene plot updated',
            clipId: updated.id,
            scenePlot: updated.scene_plot,
            preference: updated.scene_plot_preference
        });
    } catch (error: any) {
        console.error('Scene Plot PUT error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Remove scene plot from a clip
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const clipId = params.id;

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID is required' }, { status: 400 });
        }

        const [updated] = await sql`
            UPDATE animation_clips
            SET 
                scene_plot = NULL,
                scene_plot_preference = NULL,
                updated_at = NOW()
            WHERE id = ${clipId}
            RETURNING id
        `;

        if (!updated) {
            return NextResponse.json({ error: 'Clip not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Scene plot removed',
            clipId: updated.id
        });
    } catch (error: any) {
        console.error('Scene Plot DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
