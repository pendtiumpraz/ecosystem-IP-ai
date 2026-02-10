import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { checkCredits, deductCredits } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

interface RouteParams {
    params: Promise<{ id: string }>;
}

async function getUserTier(userId: string): Promise<"trial" | "creator" | "studio" | "enterprise"> {
    if (!userId) return "trial";
    const result = await sql`SELECT subscription_tier FROM users WHERE id = ${userId} AND deleted_at IS NULL`;
    return (result[0]?.subscription_tier as "trial" | "creator" | "studio" | "enterprise") || "trial";
}

const PREFERENCE_SYSTEM = "You are an expert film director and cinematographer. Your task is to analyze an IP project's context and generate shot direction preferences that will guide the shot list generation for every scene.\n\nBased on the project's genre, theme, tone, premise, characters, and format, you must determine:\n\n1. Overall visual style and cinematography approach\n2. Recommended pacing and shot rhythm\n3. Preferred camera types and their usage frequency\n4. Shot duration guidelines based on the genre\n5. Editing rhythm and transition notes\n6. Special considerations for the genre/tone\n\nIMPORTANT: Output ONLY valid JSON, no markdown, no explanation.\n\nJSON Structure:\n{\n  \"visualStyle\": \"Description of overall visual approach\",\n  \"pacingProfile\": \"slow|moderate|fast|mixed\",\n  \"avgShotsPerMinute\": 10,\n  \"shotDurationRange\": {\n    \"min\": 0.5,\n    \"max\": 10,\n    \"dialogueAvg\": 5,\n    \"actionAvg\": 2,\n    \"establishingAvg\": 6\n  },\n  \"preferredCameraTypes\": [\n    {\"type\": \"establishing\", \"frequency\": \"rare|sometimes|often|always\", \"notes\": \"when to use\"},\n    {\"type\": \"wide\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"full\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"medium\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"medium-close\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"close-up\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"extreme-close-up\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"over-shoulder\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"two-shot\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"pov\", \"frequency\": \"...\", \"notes\": \"...\"},\n    {\"type\": \"insert\", \"frequency\": \"...\", \"notes\": \"...\"}\n  ],\n  \"preferredMovements\": [\n    {\"movement\": \"static\", \"frequency\": \"often\", \"notes\": \"when to use\"}\n  ],\n  \"editingNotes\": \"Notes about cut rhythm, transitions, and pacing\",\n  \"genreSpecificNotes\": \"Specific cinematography notes for this genre/tone\",\n  \"moodKeywords\": [\"keyword1\", \"keyword2\"],\n  \"colorPalette\": \"Suggested color grading approach\",\n  \"lightingStyle\": \"Overall lighting approach description\"\n}";

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;
        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        const tier = await getUserTier(userId);

        const projects = await sql`
            SELECT id, title, genre, theme, tone, description, medium_type, duration,
                   main_genre, sub_genre, core_conflict, story_structure
            FROM projects WHERE id = ${projectId} AND deleted_at IS NULL
        `;

        if (projects.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        const project = projects[0];

        let storyInfo = '';
        try {
            const stories = await sql`
                SELECT premise, synopsis, format, theme
                FROM stories WHERE project_id = ${String(projectId)}::text AND deleted_at IS NULL
                ORDER BY created_at DESC LIMIT 1
            `;
            if (stories[0]) {
                const s = stories[0];
                storyInfo = "\nPREMISE: " + (s.premise || 'Not specified') +
                    "\nSTORY SYNOPSIS: " + (s.synopsis || 'Not specified') +
                    "\nSTORY FORMAT: " + (s.format || 'Not specified') +
                    "\nSTORY THEME: " + (s.theme || 'Not specified');
            }
        } catch (e) {
            console.log('[shot-preferences] No stories found');
        }

        let characterInfo = '';
        try {
            const characters = await sql`
                SELECT name, role, description
                FROM characters WHERE project_id = ${String(projectId)}::text AND deleted_at IS NULL
                LIMIT 20
            `;
            if (characters.length > 0) {
                const charList = characters.map((c: any) => {
                    let line = "- " + c.name;
                    if (c.role) { line += " (" + c.role + ")"; }
                    if (c.description) { line += ": " + c.description.substring(0, 100); }
                    return line;
                }).join('\n');
                characterInfo = "\nCHARACTERS (" + characters.length + " total):\n" + charList;
            }
        } catch (e) {
            console.log('[shot-preferences] No characters found');
        }

        const userPrompt = "Analyze this IP project and generate shot direction preferences:\n\n" +
            "PROJECT: " + (project.title || 'Untitled Project') + "\n" +
            "GENRE: " + (project.main_genre || project.genre || 'Not specified') + "\n" +
            "THEME: " + (project.theme || 'Not specified') + "\n" +
            "TONE: " + (project.tone || 'Not specified') + "\n" +
            "FORMAT: " + (project.medium_type || 'Animation/Film') + "\n" +
            "DURATION: " + (project.duration || 'Not specified') + "\n" +
            "CORE CONFLICT: " + (project.core_conflict || 'Not specified') + "\n" +
            "STORY STRUCTURE: " + (project.story_structure || 'Not specified') + "\n" +
            "DESCRIPTION: " + (project.description || 'Not specified') + "\n" +
            storyInfo + "\n" + characterInfo + "\n\n" +
            "Based on all of this context, generate comprehensive shot direction preferences that will guide AI shot list generation for every scene in this project.";

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

        let preferences: any;
        try {
            let jsonText = aiResult.result;
            jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            preferences = JSON.parse(jsonText.trim());
        } catch (e) {
            console.error('[shot-preferences] Parse error:', aiResult.result);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: aiResult.result },
                { status: 500 }
            );
        }

        try {
            await sql`
                UPDATE projects SET shot_preferences = ${JSON.stringify(preferences)}::jsonb
                WHERE id = ${projectId}
            `;
        } catch (e: any) {
            console.log('[shot-preferences] Trying generation_metadata fallback');
            try {
                await sql`
                    UPDATE projects 
                    SET generation_metadata = COALESCE(generation_metadata, '{}'::jsonb) || 
                        jsonb_build_object('shot_preferences', ${JSON.stringify(preferences)}::jsonb)
                    WHERE id = ${projectId}
                `;
            } catch (e2: any) {
                console.error('[shot-preferences] Save error:', e2?.message);
            }
        }

        try {
            await deductCredits(userId, aiResult.creditCost || 1, 'shot_preferences', projectId, 'Shot direction preferences generation');
        } catch (e) {
            console.log('[shot-preferences] Credit deduction skipped');
        }

        return NextResponse.json({
            success: true,
            preferences: preferences,
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

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params;

        let preferences = null;
        try {
            const result = await sql`SELECT shot_preferences FROM projects WHERE id = ${projectId}`;
            preferences = result[0]?.shot_preferences;
        } catch (e) {
            try {
                const result = await sql`SELECT generation_metadata->'shot_preferences' as prefs FROM projects WHERE id = ${projectId}`;
                preferences = result[0]?.prefs;
            } catch (e2) {
                // Neither column exists
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
