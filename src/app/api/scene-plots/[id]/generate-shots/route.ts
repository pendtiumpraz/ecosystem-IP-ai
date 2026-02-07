import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';

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

const SHOT_LIST_SYSTEM = `You are an expert cinematographer and director. Your task is to create a professional shot list for a scene, breaking it down into individual camera setups.

For each shot, specify:
1. Camera type (wide, medium, close-up, extreme-close-up, POV, over-shoulder)
2. Camera angle (eye-level, low-angle, high-angle, dutch, birds-eye, worms-eye)
3. Camera movement (static, pan, tilt, dolly, tracking, crane, handheld, zoom)
4. Duration (in seconds, typically 2-10 seconds per shot)
5. What's in frame (framing)
6. What action occurs
7. Character blocking/positions
8. Lighting notes (optional)
9. Audio notes (optional)

Create shots that:
- Tell the story visually
- Match the emotional beat of the scene
- Provide visual variety
- Are practical to shoot
- Follow filmmaking best practices (180-degree rule, shot progression, etc.)

IMPORTANT: Output ONLY valid JSON array, no markdown, no explanation.

JSON Structure:
[
  {
    "shotNumber": <number starting from 1>,
    "cameraType": "wide" | "medium" | "close-up" | "extreme-close-up" | "pov" | "over-shoulder",
    "cameraAngle": "eye-level" | "low-angle" | "high-angle" | "dutch" | "birds-eye" | "worms-eye",
    "cameraMovement": "static" | "pan" | "tilt" | "dolly" | "tracking" | "crane" | "handheld" | "zoom",
    "duration": <seconds>,
    "framing": "<what's visible in the frame>",
    "action": "<what happens during this shot>",
    "blocking": "<character positions and movements>",
    "lighting": "<lighting notes, optional>",
    "audio": "<sound/music notes, optional>",
    "notes": "<director's notes, optional>"
  }
]`;

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: sceneId } = await params;
        const body = await request.json();
        const { userId, genre, tone, visualStyle, targetShotCount } = body;

        // Get scene data
        const scenes = await sql`
      SELECT sp.*, p.title as project_title
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
        const creditCost = 3;

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

        const userPrompt = `Create a shot list for this scene:

SCENE: ${scene.title || `Scene ${scene.scene_number}`}

SYNOPSIS:
${scene.synopsis || 'No synopsis provided'}

EMOTIONAL BEAT: ${scene.emotional_beat || 'Not specified'}

LOCATION: ${scene.location || 'Not specified'}
${scene.location_description ? `Description: ${scene.location_description}` : ''}

TIME OF DAY: ${scene.time_of_day || 'day'}

CHARACTERS INVOLVED:
${scene.characters_involved?.map((c: { name: string; role?: string }) =>
            `- ${c.name}${c.role ? ` (${c.role})` : ''}`
        ).join('\n') || 'No specific characters'}

PROPS/ELEMENTS:
${scene.props?.join(', ') || 'None specified'}

PROJECT CONTEXT:
- Genre: ${genre || 'Not specified'}
- Tone: ${tone || 'Not specified'}
- Visual Style: ${visualStyle || 'Cinematic'}

SCENE DURATION: ~${scene.estimated_duration || 60} seconds
${targetShotCount ? `TARGET SHOT COUNT: ${targetShotCount} shots` : 'Create an appropriate number of shots for the scene duration (typically 3-8 shots for a 60-second scene)'}

Create a professional shot list that visually tells this story moment.`;

        // Call AI via unified provider system
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: SHOT_LIST_SYSTEM,
            maxTokens: 3000,
            temperature: 0.7,
            tier,
        });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'Failed to generate shot list' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let shots: Array<{
            shotNumber: number;
            cameraType: string;
            cameraAngle: string;
            cameraMovement: string;
            duration: number;
            framing: string;
            action: string;
            blocking?: string;
            lighting?: string;
            audio?: string;
            notes?: string;
        }>;

        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            shots = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Delete existing shots for this scene (soft delete)
        await sql`
      UPDATE scene_shots
      SET deleted_at = NOW()
      WHERE scene_id = ${sceneId}::uuid AND deleted_at IS NULL
    `;

        // Insert new shots
        const createdShots = [];

        for (const shot of shots) {
            const insertResult = await sql`
        INSERT INTO scene_shots (
          scene_id, shot_number, camera_type, camera_angle, camera_movement,
          duration, framing, action, blocking, lighting, audio, notes,
          generation_metadata
        ) VALUES (
          ${sceneId}::uuid,
          ${shot.shotNumber},
          ${shot.cameraType || 'medium'},
          ${shot.cameraAngle || 'eye-level'},
          ${shot.cameraMovement || 'static'},
          ${shot.duration || 5},
          ${shot.framing || null},
          ${shot.action || null},
          ${shot.blocking || null},
          ${shot.lighting || null},
          ${shot.audio || null},
          ${shot.notes || null},
          ${JSON.stringify({ generatedAt: new Date().toISOString(), provider: aiResult.provider })}::jsonb
        )
        RETURNING *
      `;

            if (insertResult[0]) {
                createdShots.push(insertResult[0]);
            }
        }

        // Update scene status
        await sql`
      UPDATE scene_plots
      SET status = CASE 
        WHEN status = 'plotted' THEN 'shot_listed'
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
                `shots_${sceneId}_${Date.now()}`,
                `Shot list generation`
            );
        }

        return NextResponse.json({
            success: true,
            shots: createdShots,
            count: createdShots.length,
            creditsUsed: creditCost,
            provider: aiResult.provider
        });
    } catch (error) {
        console.error('Error generating shot list:', error);
        return NextResponse.json(
            { error: 'Failed to generate shot list' },
            { status: 500 }
        );
    }
}
