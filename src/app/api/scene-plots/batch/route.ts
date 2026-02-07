import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/scene-plots/batch - Create multiple scene plots at once
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectId, scenes, storyVersionId } = body;

        if (!projectId || !scenes || !Array.isArray(scenes) || scenes.length === 0) {
            return NextResponse.json(
                { error: 'projectId and scenes array are required' },
                { status: 400 }
            );
        }

        // Get story version ID for this project if not provided
        let versionId = storyVersionId;
        if (!versionId) {
            // First try story_versions table
            const versionResult = await sql`
                SELECT sv.id FROM story_versions sv
                JOIN stories s ON sv.story_id = s.id
                WHERE s.project_id = ${projectId} 
                ORDER BY sv.created_at DESC
                LIMIT 1
            `;
            versionId = versionResult[0]?.id;

            // If no story_versions, check if stories.id is directly used
            if (!versionId) {
                const storyResult = await sql`
                    SELECT id FROM stories WHERE project_id = ${projectId} LIMIT 1
                `;
                // Check if this story id exists in story_versions
                const checkVersion = await sql`
                    SELECT id FROM story_versions WHERE id = ${storyResult[0]?.id} LIMIT 1
                `;
                versionId = checkVersion[0]?.id || storyResult[0]?.id;
            }
        }

        if (!versionId) {
            return NextResponse.json(
                { error: 'No story version found for this project' },
                { status: 400 }
            );
        }

        const createdScenes = [];

        for (const scene of scenes) {
            // Use actual column names from scene_plots table
            const result = await sql`
                INSERT INTO scene_plots (
                    story_version_id, 
                    scene_number, 
                    scene_title, 
                    scene_description, 
                    scene_location, 
                    scene_time, 
                    characters_present,
                    beat_key,
                    preference
                ) VALUES (
                    ${versionId}::uuid,
                    ${scene.scene_number},
                    ${scene.title || scene.scene_title || null},
                    ${scene.synopsis || scene.scene_description || null},
                    ${scene.location || scene.scene_location || null},
                    ${scene.time_of_day || scene.scene_time || 'day'},
                    ${scene.characters_involved || scene.characters_present || []}::text[],
                    ${scene.story_beat_id || scene.beat_key || null},
                    ${scene.preference || null}
                )
                ON CONFLICT ON CONSTRAINT unique_beat_scene
                DO UPDATE SET
                    scene_title = COALESCE(EXCLUDED.scene_title, scene_plots.scene_title),
                    scene_description = COALESCE(EXCLUDED.scene_description, scene_plots.scene_description),
                    scene_location = COALESCE(EXCLUDED.scene_location, scene_plots.scene_location),
                    scene_time = COALESCE(EXCLUDED.scene_time, scene_plots.scene_time),
                    characters_present = COALESCE(EXCLUDED.characters_present, scene_plots.characters_present),
                    updated_at = NOW()
                RETURNING *
            `;

            if (result[0]) {
                createdScenes.push(result[0]);
            }
        }

        return NextResponse.json({
            success: true,
            scenes: createdScenes,
            count: createdScenes.length
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating scene plots batch:', error);
        return NextResponse.json(
            { error: 'Failed to create scene plots' },
            { status: 500 }
        );
    }
}
