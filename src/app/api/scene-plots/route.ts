import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import {
  ScenePlot,
  CreateScenePlotRequest
} from '@/types/storyboard';

const sql = neon(process.env.DATABASE_URL!);

// GET /api/scene-plots - List scene plots for a project
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const storyVersionIdParam = searchParams.get('storyVersionId');
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const status = searchParams.get('status');
    const storyBeatId = searchParams.get('storyBeatId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Use storyVersionId if provided, otherwise look it up
    let storyVersionId = storyVersionIdParam;

    if (!storyVersionId) {
      // First get story_version_id for this project from stories table
      const storyResult = await sql`
        SELECT id FROM stories WHERE project_id = ${projectId} LIMIT 1
      `;
      storyVersionId = storyResult[0]?.id;
    }

    let scenePlots: any[] = [];

    if (storyVersionId) {
      // Get scenes using story_version_id
      scenePlots = await sql`
        SELECT 
          sp.id,
          sp.story_version_id,
          sp.scene_number,
          sp.scene_title as title,
          sp.scene_description as synopsis,
          sp.scene_location as location,
          sp.scene_time as time_of_day,
          sp.characters_present,
          sp.beat_key as story_beat_id,
          sp.preference,
          sp.created_at,
          sp.updated_at,
          'plotted' as status,
          (
            SELECT row_to_json(siv)
            FROM scene_image_versions siv
            WHERE siv.scene_id = sp.id AND siv.is_active = TRUE
            LIMIT 1
          ) as active_image_version,
          (
            SELECT row_to_json(ssv)
            FROM scene_script_versions ssv
            WHERE ssv.scene_id = sp.id AND ssv.is_active = TRUE
            LIMIT 1
          ) as active_script_version
        FROM scene_plots sp
        WHERE sp.story_version_id = ${storyVersionId}
        ORDER BY sp.scene_number ASC
      `;

      console.log('[Scene Plots GET] Query result:', {
        storyVersionId,
        scenesFound: scenePlots.length
      });
    }

    // Filter in JS if needed
    if (status && scenePlots.length > 0) {
      scenePlots = scenePlots.filter((sp: any) => sp.status === status);
    }
    if (storyBeatId && scenePlots.length > 0) {
      scenePlots = scenePlots.filter((sp: any) => sp.story_beat_id === storyBeatId);
    }

    // Get stats - simplified since scene_plots table doesn't have status/deleted_at
    const stats = {
      total: scenePlots.length,
      empty: 0,
      plotted: scenePlots.length, // All scenes from this query are considered 'plotted'
      shot_listed: 0,
      storyboarded: 0,
      scripted: 0,
      complete: 0
    };

    // Get storyboard config for distribution
    const projectResult = await sql`
      SELECT storyboard_config FROM projects WHERE id = ${projectId}
    `;
    const storyboardConfig = projectResult[0]?.storyboard_config;

    console.log('[Scene Plots GET] projectId:', projectId);
    console.log('[Scene Plots GET] storyboardConfig:', JSON.stringify(storyboardConfig)?.slice(0, 500));
    console.log('[Scene Plots GET] sceneDistribution:', storyboardConfig?.sceneDistribution ? 'exists' : 'null');

    return NextResponse.json({
      scenes: scenePlots,
      stats: stats,
      distribution: storyboardConfig?.sceneDistribution || null,
      totalScenes: storyboardConfig?.totalScenes || scenePlots.length
    });
  } catch (error) {
    console.error('Error fetching scene plots:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scene plots' },
      { status: 500 }
    );
  }
}

// POST /api/scene-plots - Create new scene plot(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scenes: CreateScenePlotRequest[] = Array.isArray(body) ? body : [body];

    if (scenes.length === 0) {
      return NextResponse.json(
        { error: 'At least one scene is required' },
        { status: 400 }
      );
    }

    const createdScenes: ScenePlot[] = [];

    for (const scene of scenes) {
      const result = await sql`
        INSERT INTO scene_plots (
          project_id, scene_number, title, synopsis, emotional_beat,
          story_beat_id, story_beat_name, location, location_image_url,
          time_of_day, characters_involved, estimated_duration, status
        ) VALUES (
          ${scene.project_id}::uuid,
          ${scene.scene_number},
          ${scene.title || null},
          ${scene.synopsis || null},
          ${scene.emotional_beat || null},
          ${scene.story_beat_id || null}::uuid,
          ${scene.story_beat_name || null},
          ${scene.location || null},
          ${scene.location_image_url || null},
          ${scene.time_of_day || 'day'},
          ${JSON.stringify(scene.characters_involved || [])}::jsonb,
          ${scene.estimated_duration || 60},
          ${scene.synopsis ? 'plotted' : 'empty'}
        )
        ON CONFLICT (project_id, scene_number) 
        DO UPDATE SET
          title = EXCLUDED.title,
          synopsis = EXCLUDED.synopsis,
          emotional_beat = EXCLUDED.emotional_beat,
          story_beat_id = EXCLUDED.story_beat_id,
          story_beat_name = EXCLUDED.story_beat_name,
          location = EXCLUDED.location,
          location_image_url = EXCLUDED.location_image_url,
          time_of_day = EXCLUDED.time_of_day,
          characters_involved = EXCLUDED.characters_involved,
          estimated_duration = EXCLUDED.estimated_duration,
          status = CASE 
            WHEN EXCLUDED.synopsis IS NOT NULL THEN 'plotted'
            ELSE scene_plots.status 
          END,
          updated_at = NOW()
        RETURNING *
      `;

      if (result[0]) {
        createdScenes.push(result[0] as ScenePlot);
      }
    }

    return NextResponse.json({
      scenes: createdScenes,
      count: createdScenes.length
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating scene plots:', error);
    return NextResponse.json(
      { error: 'Failed to create scene plots' },
      { status: 500 }
    );
  }
}
