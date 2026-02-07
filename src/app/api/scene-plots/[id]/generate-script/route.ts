import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import crypto from 'crypto';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
  if (!userId) return "trial";
  const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
  return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SCRIPT_GENERATION_SYSTEM = `You are an expert screenwriter. Your task is to write a professional screenplay script for a scene based on the scene plot, shot list, and character information.

Write in STANDARD SCREENPLAY FORMAT:
- SCENE HEADING (INT./EXT. LOCATION - TIME)
- Action lines (present tense, visual descriptions)
- CHARACTER NAME (centered, all caps)
- Dialogue (centered under character name)
- Parentheticals for delivery notes (sparingly)
- Transitions (CUT TO:, DISSOLVE TO:, etc.)

Your script should:
1. Match the emotional beat of the scene
2. Stay true to character personalities
3. Advance the story naturally
4. Be the appropriate length for the scene duration
5. Include visual descriptions that match the shot list
6. Use natural, character-appropriate dialogue`;

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: sceneId } = await params;
    const body = await request.json();
    const { userId, forceNewVersion } = body;

    // Get scene data with characters
    const scenes = await sql`
      SELECT sp.*, p.title as project_title, p.id as project_id
      FROM scene_plots sp
      JOIN projects p ON sp.project_id = p.id
      WHERE sp.id = ${sceneId}::uuid
    `;

    if (scenes.length === 0) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
    }

    const scene = scenes[0];

    // Get user tier
    const tier = await getUserTier(userId);
    const creditCost = 4; // Script generation is more expensive

    // Check credits if userId provided
    if (userId) {
      const hasCredits = await checkCredits(userId, creditCost);
      if (!hasCredits) {
        return NextResponse.json(
          { error: 'Insufficient credits', required: creditCost },
          { status: 402 }
        );
      }
    }

    // Get shots for this scene
    const shots = await sql`
      SELECT * FROM scene_shots
      WHERE scene_id = ${sceneId}::uuid AND deleted_at IS NULL
      ORDER BY shot_number
    `;

    // Get project characters
    const characters = await sql`
      SELECT id, name, description, personality, role, appearance
      FROM characters
      WHERE project_id = ${scene.project_id}::uuid
    `;

    // Build character personality context
    const characterContext = characters.length > 0
      ? characters.map(c =>
        `${c.name}${c.role ? ` (${c.role})` : ''}:
  Personality: ${c.personality || 'Not specified'}
  Appearance: ${c.appearance || 'Not specified'}`
      ).join('\n\n')
      : 'No character details available';

    // Build shot list context
    const shotContext = shots.length > 0
      ? shots.map(s =>
        `Shot ${s.shot_number}: ${s.camera_type} - ${s.action || s.framing || 'No action specified'}`
      ).join('\n')
      : 'No shot list available';

    const userPrompt = `Write a screenplay script for this scene:

PROJECT: ${scene.project_title || 'Untitled Project'}

SCENE ${scene.scene_number}: ${scene.title || 'Untitled Scene'}

LOCATION: ${scene.location || 'UNSPECIFIED LOCATION'}
TIME: ${scene.time_of_day?.toUpperCase() || 'DAY'}

SCENE SYNOPSIS:
${scene.synopsis || 'No synopsis provided'}

EMOTIONAL BEAT: ${scene.emotional_beat || 'Not specified'}

CHARACTERS IN SCENE:
${scene.characters_involved?.map((c: { name: string }) => c.name).join(', ') || 'None specified'}

CHARACTER DETAILS:
${characterContext}

SHOT LIST (for visual reference):
${shotContext}

SCENE DURATION: ~${scene.estimated_duration || 60} seconds (aim for ${Math.round((scene.estimated_duration || 60) / 60 * 125)} words approximately)

Write the screenplay script in proper format. Include:
1. Scene heading
2. Action descriptions
3. Character dialogue
4. Necessary parentheticals
Be concise but impactful. Match the emotional tone.`;

    // Call AI via unified provider system
    const aiResult = await callAI("text", userPrompt, {
      systemPrompt: SCRIPT_GENERATION_SYSTEM,
      maxTokens: 3000,
      temperature: 0.8,
      tier,
    });

    if (!aiResult.success || !aiResult.result) {
      return NextResponse.json(
        { error: aiResult.error || 'Failed to generate script' },
        { status: 500 }
      );
    }

    const scriptContent = aiResult.result.trim();

    // Create context snapshot for versioning
    const shotListString = shots.map(s => `${s.shot_number}:${s.action || ''}`).join('|');

    const contextSnapshot = {
      scene_plot_hash: crypto.createHash('md5').update(scene.synopsis || '').digest('hex'),
      shot_list_hash: crypto.createHash('md5').update(shotListString).digest('hex'),
      beat_id: scene.story_beat_id,
      scene_synopsis: scene.synopsis?.substring(0, 200)
    };

    // Get next version number
    const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version
      FROM scene_script_versions WHERE scene_id = ${sceneId}::uuid
    `;
    const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

    // Deactivate previous active version
    await sql`
      UPDATE scene_script_versions
      SET is_active = FALSE, updated_at = NOW()
      WHERE scene_id = ${sceneId}::uuid AND is_active = TRUE
    `;

    // Create new version
    const insertResult = await sql`
      INSERT INTO scene_script_versions (
        scene_id, version_number, script_content, context_snapshot,
        provider, model, credit_cost, prompt, is_active, is_manual_edit
      ) VALUES (
        ${sceneId}::uuid, 
        ${nextVersion}, 
        ${scriptContent},
        ${JSON.stringify(contextSnapshot)}::jsonb,
        ${aiResult.provider || 'unknown'}, 
        'deepseek-chat', 
        ${creditCost},
        ${userPrompt.substring(0, 500)},
        TRUE,
        FALSE
      )
      RETURNING *
    `;

    // Update scene status
    await sql`
      UPDATE scene_plots
      SET status = CASE 
        WHEN status IN ('plotted', 'shot_listed', 'storyboarded') THEN 'scripted'
        ELSE status
      END,
      updated_at = NOW()
      WHERE id = ${sceneId}::uuid
    `;

    // Deduct credits if userId provided
    if (userId) {
      await deductCredits(
        userId,
        creditCost,
        "text_generation",
        `script_${sceneId}_${Date.now()}`,
        `Script generation for scene`
      );
    }

    return NextResponse.json({
      success: true,
      version: insertResult[0],
      versionNumber: nextVersion,
      creditsUsed: creditCost,
      provider: aiResult.provider
    });
  } catch (error) {
    console.error('Error generating script:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}
