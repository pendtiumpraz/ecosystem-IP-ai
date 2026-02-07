import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';
import { ScenePlot, CreateScenePlotRequest } from '@/types/storyboard';

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SCENE_PLOT_SYSTEM = `You are an expert screenwriter specializing in scene development. Your task is to generate detailed scene plots that maintain story continuity and narrative flow.

For each scene, you will create:
1. A compelling title (short, descriptive)
2. A detailed synopsis (what happens in the scene)
3. The emotional beat (what the audience should feel)
4. Location details
5. Time of day
6. Characters involved
7. Key props or elements

CRITICAL: You must maintain STORY CONTINUITY with:
- Previous scenes (if provided)
- The overall story synopsis
- Character arcs and motivations
- The story beat this scene belongs to

IMPORTANT: Output ONLY valid JSON array, no markdown, no explanation.

JSON Structure (array of scenes):
[
  {
    "sceneNumber": <number>,
    "title": "<short descriptive title>",
    "synopsis": "<detailed 2-3 paragraph description of what happens>",
    "emotionalBeat": "<what the audience should feel>",
    "location": "<where the scene takes place>",
    "locationDescription": "<brief visual description of the location>",
    "timeOfDay": "day" | "night" | "dawn" | "dusk",
    "characters": ["<character names involved>"],
    "props": ["<key props or elements>"],
    "estimatedDuration": <seconds, typically 30-90>
  }
]`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            userId,
            storyVersionId, // Add this to be passed from client
            sceneNumbers, // Array of scene numbers to generate
            synopsis,
            storyBeats, // Map of sceneNumber -> { beatId, beatName, beatDescription }
            previousScenesSummary, // Summary of scenes before the first in this batch
            characters, // Array of { id, name, imageUrl, personality, role }
            locations, // Array of { name, description, imageUrl }
            genre,
            tone,
            visualStyle
        } = body;

        if (!projectId || !sceneNumbers || sceneNumbers.length === 0 || !synopsis) {
            return NextResponse.json(
                { error: 'projectId, sceneNumbers, and synopsis are required' },
                { status: 400 }
            );
        }

        // Get user tier
        const tier = await getUserTier(userId);
        const creditCost = 3 * Math.ceil(sceneNumbers.length / 3); // Scale by batch size

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

        // Build character context
        const characterContext = characters?.length > 0
            ? `\nCHARACTERS:\n${characters.map((c: { name: string; role?: string; personality?: string }) =>
                `- ${c.name}${c.role ? ` (${c.role})` : ''}${c.personality ? `: ${c.personality}` : ''}`
            ).join('\n')}`
            : '';

        // Build location context
        const locationContext = locations?.length > 0
            ? `\nAVAILABLE LOCATIONS:\n${locations.map((l: { name: string; description?: string }) =>
                `- ${l.name}${l.description ? `: ${l.description}` : ''}`
            ).join('\n')}`
            : '';

        // Build story beat assignments
        const beatAssignments = sceneNumbers.map((num: number) => {
            const beat = storyBeats?.[num];
            return beat
                ? `Scene ${num}: Part of "${beat.beatName}" - ${beat.beatDescription || ''}`
                : `Scene ${num}: General story progression`;
        }).join('\n');

        const userPrompt = `Generate detailed scene plots for scenes ${sceneNumbers.join(', ')}.

STORY SYNOPSIS:
${synopsis}

GENRE: ${genre || 'Not specified'}
TONE: ${tone || 'Not specified'}
VISUAL STYLE: ${visualStyle || 'Not specified'}
${characterContext}
${locationContext}

SCENE ASSIGNMENTS (story beat each scene belongs to):
${beatAssignments}

${previousScenesSummary ? `PREVIOUS SCENES SUMMARY (for continuity):
${previousScenesSummary}` : 'This is the beginning of the story.'}

Generate ${sceneNumbers.length} scene(s) with scene numbers: ${sceneNumbers.join(', ')}.
Ensure each scene:
1. Flows naturally from previous scenes
2. Advances the story appropriately for its story beat
3. Features relevant characters
4. Has a clear purpose and emotional impact`;

        // Call AI via unified provider system
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: SCENE_PLOT_SYSTEM,
            maxTokens: 4000,
            temperature: 0.8,
            tier,
        });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'Failed to generate scene plots' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let scenePlots: Array<{
            sceneNumber: number;
            title: string;
            synopsis: string;
            emotionalBeat: string;
            location: string;
            locationDescription?: string;
            timeOfDay: 'day' | 'night' | 'dawn' | 'dusk';
            characters: string[];
            props?: string[];
            estimatedDuration: number;
        }>;

        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            scenePlots = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Insert scenes into database
        const createdScenes: ScenePlot[] = [];

        for (const plot of scenePlots) {
            const beat = storyBeats?.[plot.sceneNumber];

            // Map character names to character objects if available
            const charactersInvolved = plot.characters?.map((name: string) => {
                const char = characters?.find((c: { name: string }) =>
                    c.name.toLowerCase() === name.toLowerCase()
                );
                return char
                    ? { id: char.id, name: char.name, imageUrl: char.imageUrl, role: char.role }
                    : { name };
            }) || [];

            const sceneData: CreateScenePlotRequest = {
                project_id: projectId,
                scene_number: plot.sceneNumber,
                title: plot.title,
                synopsis: plot.synopsis,
                emotional_beat: plot.emotionalBeat,
                story_beat_id: beat?.beatId,
                story_beat_name: beat?.beatName,
                location: plot.location,
                time_of_day: plot.timeOfDay || 'day',
                characters_involved: charactersInvolved,
                estimated_duration: plot.estimatedDuration || 60
            };

            // Get story_version_id for this project
            let versionId = storyVersionId;
            if (!versionId) {
                const versionResult = await sql`
                    SELECT sv.id FROM story_versions sv
                    JOIN stories s ON sv.story_id = s.id
                    WHERE s.project_id = ${projectId} 
                    ORDER BY sv.created_at DESC
                    LIMIT 1
                `;
                versionId = versionResult[0]?.id;
            }

            if (!versionId) {
                console.error('No story_version_id found for project:', projectId);
                continue;
            }

            const insertResult = await sql`
                INSERT INTO scene_plots (
                    story_version_id, scene_number, scene_title, scene_description, 
                    scene_location, scene_time, characters_present, beat_key
                ) VALUES (
                    ${versionId}::uuid,
                    ${plot.sceneNumber},
                    ${plot.title || null},
                    ${plot.synopsis || null},
                    ${plot.location || null},
                    ${plot.timeOfDay || 'day'},
                    ${plot.characters || []}::text[],
                    ${beat?.beatId || null}
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

            if (insertResult[0]) {
                createdScenes.push(insertResult[0] as ScenePlot);
            }
        }

        // Update project storyboard_config status
        await sql`
      UPDATE projects
      SET storyboard_config = COALESCE(storyboard_config, '{}'::jsonb) || 
        '{"generationStatus": "generating_plots"}'::jsonb,
      updated_at = NOW()
      WHERE id = ${projectId}::uuid
    `;

        // Deduct credits if userId provided
        if (userId) {
            await deductCredits(
                userId,
                creditCost,
                "text_generation",
                `scene_batch_${Date.now()}`,
                `Scene plot batch generation`
            );
        }

        return NextResponse.json({
            success: true,
            scenes: createdScenes,
            count: createdScenes.length,
            creditsUsed: creditCost,
            provider: aiResult.provider
        });
    } catch (error) {
        console.error('Error generating scene plots:', error);
        return NextResponse.json(
            { error: 'Failed to generate scene plots' },
            { status: 500 }
        );
    }
}
