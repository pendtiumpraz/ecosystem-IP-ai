import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const SCENE_DISTRIBUTION_SYSTEM = `You are an expert film/series scriptwriter and story structure specialist. Your task is to distribute a story into individual scenes based on the story beats (narrative structure) and target duration.

Given:
1. Story synopsis
2. Story beats (narrative structure points with descriptions)
3. Target duration in minutes
4. Scenes per minute ratio (typically 0.5-2 scenes per minute depending on pacing)

You will output a scene distribution plan that:
- Allocates scenes to each story beat proportionally
- Ensures proper pacing and story flow
- Maintains narrative continuity
- Respects the target duration

IMPORTANT: Output ONLY valid JSON, no markdown, no explanation.

JSON Structure:
{
  "totalScenes": <number>,
  "distribution": [
    {
      "beatId": "<story beat id>",
      "beatName": "<story beat name>",
      "sceneCount": <number of scenes for this beat>,
      "sceneNumbers": [<array of scene numbers assigned to this beat>],
      "pacing": "slow" | "medium" | "fast",
      "notes": "<brief note on what these scenes should cover>"
    }
  ],
  "estimatedDuration": <calculated duration in minutes>,
  "pacingNotes": "<overall pacing recommendation>"
}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            userId,
            synopsis,
            storyBeats, // Array of { id, name, description, percentage }
            targetDuration, // in minutes
            scenesPerMinute, // default 1
            genre,
            tone
        } = body;

        if (!projectId || !synopsis || !storyBeats || storyBeats.length === 0) {
            return NextResponse.json(
                { error: 'projectId, synopsis, and storyBeats are required' },
                { status: 400 }
            );
        }

        // Get user tier for AI provider selection
        const tier = await getUserTier(userId);
        const creditCost = 3; // Text generation cost

        console.log('[Scene Distribution] userId:', userId, 'tier:', tier);

        // Check credits if userId provided
        if (userId) {
            const hasCredits = await checkCredits(userId, creditCost);
            console.log('[Scene Distribution] hasCredits:', hasCredits);
            if (!hasCredits) {
                return NextResponse.json(
                    { error: 'Insufficient credits', required: creditCost },
                    { status: 402 }
                );
            }
        }

        const spm = scenesPerMinute || 1;
        const duration = targetDuration || 60;
        const estimatedTotalScenes = Math.ceil(duration * spm);

        const userPrompt = `Please create a scene distribution for:

STORY SYNOPSIS:
${synopsis}

STORY BEATS:
${storyBeats.map((beat: { id: string; name: string; description: string; percentage?: number }, i: number) =>
            `${i + 1}. ${beat.name} (${beat.percentage || Math.round(100 / storyBeats.length)}%)
   Description: ${beat.description}`
        ).join('\n\n')}

TARGET PARAMETERS:
- Target Duration: ${duration} minutes
- Scenes Per Minute: ${spm}
- Estimated Total Scenes: ${estimatedTotalScenes}
- Genre: ${genre || 'Not specified'}
- Tone: ${tone || 'Not specified'}

Distribute scenes across the story beats, ensuring proper narrative flow and pacing. Each scene should be 30-90 seconds on average.`;

        // Call AI via unified provider system
        console.log('[Scene Distribution] Calling AI with tier:', tier);
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: SCENE_DISTRIBUTION_SYSTEM,
            maxTokens: 2000,
            temperature: 0.7,
            tier,
        });

        console.log('[Scene Distribution] AI Result:', { success: aiResult.success, provider: aiResult.provider, error: aiResult.error });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'AI generation failed - no result returned' },
                { status: 500 }
            );
        }

        // Parse the JSON response
        let distribution;
        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            distribution = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('Failed to parse AI response:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Update project storyboard_config
        const configJson = JSON.stringify({
            totalScenes: distribution.totalScenes,
            scenesPerMinute: spm,
            targetDuration: duration,
            generationStatus: 'distributing',
            lastGeneratedAt: new Date().toISOString(),
            sceneDistribution: distribution.distribution
        });

        await sql`
            UPDATE projects
            SET storyboard_config = ${configJson}::jsonb,
                updated_at = NOW()
            WHERE id = ${projectId}
        `;

        // Deduct credits if userId provided
        if (userId) {
            await deductCredits(
                userId,
                creditCost,
                "text_generation",
                `scene_dist_${Date.now()}`,
                `Scene distribution for project`
            );
        }

        return NextResponse.json({
            success: true,
            distribution,
            creditsUsed: creditCost,
            provider: aiResult.provider
        });
    } catch (error) {
        console.error('Error generating scene distribution:', error);
        return NextResponse.json(
            { error: 'Failed to generate scene distribution' },
            { status: 500 }
        );
    }
}
