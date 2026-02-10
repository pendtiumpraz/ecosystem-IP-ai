import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>; // project id
}

// Get user's subscription tier
async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`
    SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL
  `;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const PREFERENCE_SYSTEM = `You are an expert film director and cinematographer. Your task is to analyze an IP project's context and generate shot direction preferences that will guide the shot list generation for every scene.

Based on the project's genre, theme, tone, premise, characters, and format, you must determine:

1. Overall visual style and cinematography approach
2. Recommended pacing and shot rhythm
3. Preferred camera types and their usage frequency
4. Shot duration guidelines based on the genre
5. Editing rhythm and transition notes
6. Special considerations for the genre/tone

IMPORTANT: Output ONLY valid JSON, no markdown, no explanation.

JSON Structure:
{
  "visualStyle": "Description of overall visual approach",
  "pacingProfile": "slow" | "moderate" | "fast" | "mixed",
  "avgShotsPerMinute": <number>,
  "shotDurationRange": {
    "min": <number in seconds, can be 0.5>,
    "max": <number in seconds>,
    "dialogueAvg": <number>,
    "actionAvg": <number>,
    "establishingAvg": <number>
  },
  "preferredCameraTypes": [
    {"type": "establishing", "frequency": "rare|sometimes|often|always", "notes": "when to use"},
    {"type": "wide", "frequency": "...", "notes": "..."},
    {"type": "full", "frequency": "...", "notes": "..."},
    {"type": "medium", "frequency": "...", "notes": "..."},
    {"type": "medium-close", "frequency": "...", "notes": "..."},
    {"type": "close-up", "frequency": "...", "notes": "..."},
    {"type": "extreme-close-up", "frequency": "...", "notes": "..."},
    {"type": "over-shoulder", "frequency": "...", "notes": "..."},
    {"type": "two-shot", "frequency": "...", "notes": "..."},
    {"type": "pov", "frequency": "...", "notes": "..."},
    {"type": "insert", "frequency": "...", "notes": "..."}
  ],
  "preferredMovements": [
    {"movement": "static|pan-left|pan-right|tilt-up|tilt-down|dolly-in|dolly-out|tracking|crane-up|crane-down|handheld|steadicam|zoom-in|zoom-out", "frequency": "rare|sometimes|often", "notes": "when to use"}
  ],
  "editingNotes": "Notes about cut rhythm, transitions, and pacing",
  "genreSpecificNotes": "Specific cinematography notes for this genre/tone",
  "moodKeywords": ["keyword1", "keyword2", "..."],
  "colorPalette": "Suggested color grading approach",
  "lightingStyle": "Overall lighting approach description"
}`;

// POST - Generate shot preferences for a project  
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const tier = await getUserTier(userId);

        // Fetch project context
        const projects = await sql`
      SELECT id, name, genre, theme, tone, logline, synopsis, format, 
             target_audience, visual_style
      FROM projects 
      WHERE id = ${projectId}::uuid AND deleted_at IS NULL
    `;

        if (projects.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const project = projects[0];

        // Get story info  
        let storyInfo = '';
        try {
            const stories = await sql`
        SELECT title, premise, synopsis, format, theme
        FROM stories 
        WHERE project_id = ${projectId}::text AND deleted_at IS NULL
        ORDER BY created_at DESC LIMIT 1
      `;
            if (stories[0]) {
                storyInfo = `
STORY: ${stories[0].title || 'Untitled'}
PREMISE: ${stories[0].premise || 'Not specified'}
STORY SYNOPSIS: ${stories[0].synopsis || 'Not specified'}
STORY FORMAT: ${stories[0].format || 'Not specified'}
STORY THEME: ${stories[0].theme || 'Not specified'}`;
            }
        } catch (e) {
            console.log('[shot-preferences] No stories found');
        }

        // Get character count
        let characterInfo = '';
        try {
            const characters = await sql`
        SELECT name, role, description
        FROM characters 
        WHERE project_id = ${projectId}::text AND deleted_at IS NULL
        LIMIT 20
      `;
            if (characters.length > 0) {
                characterInfo = `
CHARACTERS (${characters.length} total):
${characters.map((c: any) => `- ${c.name}${c.role ? ` (${c.role})` : ''}${c.description ? `: ${c.description.substring(0, 100)}` : ''}`).join('\n')}`;
            }
        } catch (e) {
            console.log('[shot-preferences] No characters found');
        }

        const userPrompt = `Analyze this IP project and generate shot direction preferences:

PROJECT: ${project.name || 'Untitled Project'}
GENRE: ${project.genre || 'Not specified'}
THEME: ${project.theme || 'Not specified'}
TONE: ${project.tone || 'Not specified'}
FORMAT: ${project.format || 'Animation/Film'}
TARGET AUDIENCE: ${project.target_audience || 'General'}
VISUAL STYLE: ${project.visual_style || 'Cinematic'}
LOGLINE: ${project.logline || 'Not specified'}
SYNOPSIS: ${project.synopsis || 'Not specified'}
${storyInfo}
${characterInfo}

Based on all of this context, generate comprehensive shot direction preferences that will guide AI shot list generation for every scene in this project. Consider:
- The genre's typical shot patterns (action = fast cuts, drama = longer takes, etc.)
- The number of characters and their dynamics
- The overall tone and mood
- Visual storytelling best practices for this type of content`;

        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: PREFERENCE_SYSTEM,
            maxTokens: 3000,
            temperature: 0.7,
            tier,
        });

        if (!aiResult.success || !aiResult.result) {
            return NextResponse.json(
                { error: aiResult.error || 'Failed to generate preferences' },
                { status: 500 }
            );
        }

        // Parse response
        let preferences: any;
        try {
            let jsonText = aiResult.result;
            if (jsonText.includes('```json')) {
                jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            }
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```\n?/g, '');
            }
            preferences = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('[shot-preferences] Parse error:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        // Save preferences to project metadata
        try {
            await sql`
        UPDATE projects 
        SET 
          shot_preferences = ${JSON.stringify(preferences)}::jsonb
        WHERE id = ${projectId}::uuid
      `;
        } catch (e: any) {
            // shot_preferences column might not exist, try generation_metadata
            console.log('[shot-preferences] Trying generation_metadata fallback');
            try {
                await sql`
          UPDATE projects 
          SET generation_metadata = COALESCE(generation_metadata, '{}'::jsonb) || 
              jsonb_build_object('shot_preferences', ${JSON.stringify(preferences)}::jsonb)
          WHERE id = ${projectId}::uuid
        `;
            } catch (e2: any) {
                console.error('[shot-preferences] Save error:', e2?.message);
                // Still return the preferences even if save fails
            }
        }

        // Deduct credits
        try {
            await deductCredits(userId, aiResult.creditCost || 1, 'shot_preferences', projectId, 'Shot direction preferences generation');
        } catch (e) {
            console.log('[shot-preferences] Credit deduction skipped');
        }

        return NextResponse.json({
            success: true,
            preferences,
            provider: aiResult.provider
        });

    } catch (error: any) {
        console.error('[shot-preferences] Error:', error?.message, error?.stack);
        return NextResponse.json(
            { error: 'Failed to generate shot preferences', details: error?.message },
            { status: 500 }
        );
    }
}

// GET - Retrieve saved shot preferences for a project
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;

        // Try shot_preferences column first
        let preferences = null;
        try {
            const result = await sql`
        SELECT shot_preferences FROM projects WHERE id = ${projectId}::uuid
      `;
            preferences = result[0]?.shot_preferences;
        } catch (e) {
            // Try generation_metadata fallback
            try {
                const result = await sql`
          SELECT generation_metadata->'shot_preferences' as prefs 
          FROM projects WHERE id = ${projectId}::uuid
        `;
                preferences = result[0]?.prefs;
            } catch (e2) {
                // Neither exists
            }
        }

        return NextResponse.json({
            preferences: preferences || null,
            hasPreferences: !!preferences
        });

    } catch (error: any) {
        console.error('[shot-preferences] GET Error:', error?.message);
        return NextResponse.json(
            { error: 'Failed to fetch preferences', details: error?.message },
            { status: 500 }
        );
    }
}
