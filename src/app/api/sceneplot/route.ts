/**
 * Sceneplot API Endpoint
 * CRUD operations for scene plots and shots
 */

import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const storyVersionId = searchParams.get('storyVersionId');
        const beatKey = searchParams.get('beatKey');

        if (!storyVersionId) {
            return NextResponse.json({ error: 'storyVersionId is required' }, { status: 400 });
        }

        // Build query based on optional beatKey filter
        let scenes;
        if (beatKey) {
            scenes = await sql`
                SELECT 
                    sp.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', ss.id,
                                'shotNumber', ss.shot_number,
                                'shotType', ss.shot_type,
                                'shotSize', ss.shot_size,
                                'shotAngle', ss.shot_angle,
                                'shotDescription', ss.shot_description,
                                'durationSeconds', ss.duration_seconds,
                                'cameraMovement', ss.camera_movement,
                                'audioNotes', ss.audio_notes,
                                'visualNotes', ss.visual_notes,
                                'dialogue', ss.dialogue,
                                'action', ss.action
                            ) ORDER BY ss.shot_number
                        ) FILTER (WHERE ss.id IS NOT NULL),
                        '[]'
                    ) as shots
                FROM scene_plots sp
                LEFT JOIN scene_shots ss ON ss.scene_plot_id = sp.id
                WHERE sp.story_version_id = ${storyVersionId}
                AND sp.beat_key = ${beatKey}
                GROUP BY sp.id
                ORDER BY sp.scene_number
            `;
        } else {
            scenes = await sql`
                SELECT 
                    sp.*,
                    COALESCE(
                        json_agg(
                            json_build_object(
                                'id', ss.id,
                                'shotNumber', ss.shot_number,
                                'shotType', ss.shot_type,
                                'shotSize', ss.shot_size,
                                'shotAngle', ss.shot_angle,
                                'shotDescription', ss.shot_description,
                                'durationSeconds', ss.duration_seconds,
                                'cameraMovement', ss.camera_movement,
                                'audioNotes', ss.audio_notes,
                                'visualNotes', ss.visual_notes,
                                'dialogue', ss.dialogue,
                                'action', ss.action
                            ) ORDER BY ss.shot_number
                        ) FILTER (WHERE ss.id IS NOT NULL),
                        '[]'
                    ) as shots
                FROM scene_plots sp
                LEFT JOIN scene_shots ss ON ss.scene_plot_id = sp.id
                WHERE sp.story_version_id = ${storyVersionId}
                GROUP BY sp.id
                ORDER BY sp.beat_key, sp.scene_number
            `;
        }

        // Transform DB fields to camelCase
        const transformedScenes = scenes.map((scene: any) => ({
            id: scene.id,
            beatKey: scene.beat_key,
            sceneNumber: scene.scene_number,
            sceneTitle: scene.scene_title,
            sceneDescription: scene.scene_description,
            sceneLocation: scene.scene_location,
            sceneTime: scene.scene_time,
            charactersPresent: scene.characters_present || [],
            preference: scene.preference,
            shots: scene.shots,
            createdAt: scene.created_at,
            updatedAt: scene.updated_at
        }));

        return NextResponse.json({ scenes: transformedScenes });
    } catch (error: any) {
        console.error('Sceneplot GET error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { storyVersionId, beatKey, scenes } = body;

        if (!storyVersionId || !beatKey || !scenes) {
            return NextResponse.json(
                { error: 'storyVersionId, beatKey, and scenes are required' },
                { status: 400 }
            );
        }

        // Start transaction - delete existing scenes for this beat, then insert new ones
        // Delete existing scenes (and shots via CASCADE)
        await sql`
            DELETE FROM scene_plots 
            WHERE story_version_id = ${storyVersionId} 
            AND beat_key = ${beatKey}
        `;

        // Insert new scenes and shots
        const insertedScenes = [];

        for (const scene of scenes) {
            // Insert scene
            const [insertedScene] = await sql`
                INSERT INTO scene_plots (
                    story_version_id, beat_key, scene_number, scene_title,
                    scene_description, scene_location, scene_time,
                    characters_present, preference
                ) VALUES (
                    ${storyVersionId}, ${beatKey}, ${scene.sceneNumber}, ${scene.sceneTitle || null},
                    ${scene.sceneDescription || null}, ${scene.sceneLocation || null}, ${scene.sceneTime || 'day'},
                    ${scene.charactersPresent || []}, ${scene.preference || null}
                )
                RETURNING *
            `;

            // Insert shots for this scene
            const insertedShots = [];
            if (scene.shots && scene.shots.length > 0) {
                for (const shot of scene.shots) {
                    const [insertedShot] = await sql`
                        INSERT INTO scene_shots (
                            scene_plot_id, shot_number, shot_type, shot_size,
                            shot_angle, shot_description, duration_seconds,
                            camera_movement, audio_notes, visual_notes,
                            dialogue, action
                        ) VALUES (
                            ${insertedScene.id}, ${shot.shotNumber}, ${shot.shotType || null}, ${shot.shotSize || null},
                            ${shot.shotAngle || null}, ${shot.shotDescription || null}, ${shot.durationSeconds || 3},
                            ${shot.cameraMovement || null}, ${shot.audioNotes || null}, ${shot.visualNotes || null},
                            ${shot.dialogue || null}, ${shot.action || null}
                        )
                        RETURNING *
                    `;
                    insertedShots.push(insertedShot);
                }
            }

            insertedScenes.push({
                ...insertedScene,
                shots: insertedShots
            });
        }

        return NextResponse.json({
            success: true,
            message: `Saved ${insertedScenes.length} scene(s)`,
            scenes: insertedScenes
        });
    } catch (error: any) {
        console.error('Sceneplot POST error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const sceneId = searchParams.get('sceneId');
        const storyVersionId = searchParams.get('storyVersionId');
        const beatKey = searchParams.get('beatKey');

        if (sceneId) {
            // Delete specific scene
            await sql`DELETE FROM scene_plots WHERE id = ${sceneId}`;
            return NextResponse.json({ success: true, message: 'Scene deleted' });
        }

        if (storyVersionId && beatKey) {
            // Delete all scenes for a beat
            await sql`
                DELETE FROM scene_plots 
                WHERE story_version_id = ${storyVersionId} 
                AND beat_key = ${beatKey}
            `;
            return NextResponse.json({ success: true, message: 'All scenes for beat deleted' });
        }

        return NextResponse.json(
            { error: 'Either sceneId or (storyVersionId + beatKey) is required' },
            { status: 400 }
        );
    } catch (error: any) {
        console.error('Sceneplot DELETE error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
