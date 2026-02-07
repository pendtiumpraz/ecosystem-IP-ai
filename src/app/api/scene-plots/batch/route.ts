import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/scene-plots/batch - Create multiple scene plots at once
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectId, scenes } = body;

        if (!projectId || !scenes || !Array.isArray(scenes) || scenes.length === 0) {
            return NextResponse.json(
                { error: 'projectId and scenes array are required' },
                { status: 400 }
            );
        }

        const createdScenes = [];

        for (const scene of scenes) {
            const result = await sql`
        INSERT INTO scene_plots (
          project_id, 
          scene_number, 
          title, 
          synopsis, 
          emotional_beat,
          story_beat_id, 
          story_beat_name, 
          location, 
          time_of_day, 
          characters_involved,
          estimated_duration, 
          status
        ) VALUES (
          ${projectId}::uuid,
          ${scene.scene_number},
          ${scene.title || null},
          ${scene.synopsis || null},
          ${scene.emotional_beat || null},
          ${scene.story_beat_id || null}::uuid,
          ${scene.story_beat_name || null},
          ${scene.location || null},
          ${scene.time_of_day || 'day'},
          ${JSON.stringify(scene.characters_involved || [])}::jsonb,
          ${scene.estimated_duration || 60},
          ${scene.status || 'empty'}
        )
        ON CONFLICT (project_id, scene_number) 
        DO UPDATE SET
          title = COALESCE(EXCLUDED.title, scene_plots.title),
          synopsis = COALESCE(EXCLUDED.synopsis, scene_plots.synopsis),
          emotional_beat = COALESCE(EXCLUDED.emotional_beat, scene_plots.emotional_beat),
          story_beat_id = COALESCE(EXCLUDED.story_beat_id, scene_plots.story_beat_id),
          story_beat_name = COALESCE(EXCLUDED.story_beat_name, scene_plots.story_beat_name),
          location = COALESCE(EXCLUDED.location, scene_plots.location),
          time_of_day = COALESCE(EXCLUDED.time_of_day, scene_plots.time_of_day),
          characters_involved = COALESCE(EXCLUDED.characters_involved, scene_plots.characters_involved),
          estimated_duration = COALESCE(EXCLUDED.estimated_duration, scene_plots.estimated_duration),
          status = COALESCE(EXCLUDED.status, scene_plots.status),
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
