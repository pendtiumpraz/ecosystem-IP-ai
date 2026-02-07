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
    const includeDeleted = searchParams.get('includeDeleted') === 'true';
    const status = searchParams.get('status');
    const storyBeatId = searchParams.get('storyBeatId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // Build query
    let scenePlots;

    if (includeDeleted) {
      scenePlots = await sql`
        SELECT 
          sp.*,
          (
            SELECT json_agg(ss ORDER BY ss.shot_number)
            FROM scene_shots ss
            WHERE ss.scene_id = sp.id AND ss.deleted_at IS NULL
          ) as shots,
          (
            SELECT row_to_json(siv)
            FROM scene_image_versions siv
            WHERE siv.scene_id = sp.id AND siv.is_active = TRUE AND siv.deleted_at IS NULL
            LIMIT 1
          ) as active_image_version,
          (
            SELECT row_to_json(ssv)
            FROM scene_script_versions ssv
            WHERE ssv.scene_id = sp.id AND ssv.is_active = TRUE AND ssv.deleted_at IS NULL
            LIMIT 1
          ) as active_script_version
        FROM scene_plots sp
        WHERE sp.project_id = ${projectId}
        ${status ? sql`AND sp.status = ${status}` : sql``}
        ${storyBeatId ? sql`AND sp.story_beat_id = ${storyBeatId}` : sql``}
        ORDER BY sp.scene_number ASC
      `;
    } else {
      scenePlots = await sql`
        SELECT 
          sp.*,
          (
            SELECT json_agg(ss ORDER BY ss.shot_number)
            FROM scene_shots ss
            WHERE ss.scene_id = sp.id AND ss.deleted_at IS NULL
          ) as shots,
          (
            SELECT row_to_json(siv)
            FROM scene_image_versions siv
            WHERE siv.scene_id = sp.id AND siv.is_active = TRUE AND siv.deleted_at IS NULL
            LIMIT 1
          ) as active_image_version,
          (
            SELECT row_to_json(ssv)
            FROM scene_script_versions ssv
            WHERE ssv.scene_id = sp.id AND ssv.is_active = TRUE AND ssv.deleted_at IS NULL
            LIMIT 1
          ) as active_script_version
        FROM scene_plots sp
        WHERE sp.project_id = ${projectId}
        AND sp.deleted_at IS NULL
        ${status ? sql`AND sp.status = ${status}` : sql``}
        ${storyBeatId ? sql`AND sp.story_beat_id = ${storyBeatId}` : sql``}
        ORDER BY sp.scene_number ASC
      `;
    }

    // Get stats
    const stats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE deleted_at IS NULL) as total,
        COUNT(*) FILTER (WHERE status = 'empty' AND deleted_at IS NULL) as empty,
        COUNT(*) FILTER (WHERE status = 'plotted' AND deleted_at IS NULL) as plotted,
        COUNT(*) FILTER (WHERE status = 'shot_listed' AND deleted_at IS NULL) as shot_listed,
        COUNT(*) FILTER (WHERE status = 'storyboarded' AND deleted_at IS NULL) as storyboarded,
        COUNT(*) FILTER (WHERE status = 'scripted' AND deleted_at IS NULL) as scripted,
        COUNT(*) FILTER (WHERE status = 'complete' AND deleted_at IS NULL) as complete
      FROM scene_plots
      WHERE project_id = ${projectId}
    `;

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
      stats: stats[0] || {
        total: 0, empty: 0, plotted: 0, shot_listed: 0,
        storyboarded: 0, scripted: 0, complete: 0
      },
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
