import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate Animation Prompts from Story
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Verify user owns project and get story data
        const project = await sql`
      SELECT id, title, genre, sub_genre, description, 
             story_structure, story_synopsis, story_beats
      FROM projects 
      WHERE id = ${projectId} AND user_id = ${userId} AND deleted_at IS NULL
    `;

        if (project.length === 0) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Check user credits
        const userResult = await sql`
      SELECT subscription_tier, credit_balance FROM users WHERE id = ${userId} AND deleted_at IS NULL
    `;

        if (userResult.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const creditBalance = userResult[0].credit_balance || 0;
        const selectedModel = DEFAULT_MODELS.synopsis as TextModelId;
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 3; // Triple for generating multiple scenes

        if (creditBalance < creditCost) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
                { status: 402 }
            );
        }

        const projectTitle = project[0].title;
        const projectGenre = project[0].genre || 'N/A';
        const storySynopsis = project[0].story_synopsis || '';
        const storyBeats = project[0].story_beats || '';

        if (!storySynopsis && !storyBeats) {
            return NextResponse.json(
                { error: 'No story data found. Please fill Story section first.' },
                { status: 400 }
            );
        }

        const prompt = `Anda adalah director untuk production animation. Berdasarkan story berikut, generate 8-12 animation scene prompts.

PROJECT: ${projectTitle}
GENRE: ${projectGenre}

STORY SYNOPSIS:
${storySynopsis}

STORY BEATS:
${storyBeats}

Generate animation scenes dalam format JSON:
{
  "scenes": [
    {
      "sceneOrder": 1,
      "sceneName": "Scene 1 - [Nama Scene]",
      "description": "Deskripsi singkat apa yang terjadi di scene ini...",
      "prompt": "Detailed animation prompt dalam BAHASA INGGRIS untuk AI video generator. Include: camera movement, lighting, character actions, environment details, mood, style. Example: 'A young hero stands at the edge of a cliff, golden sunset behind, wind blowing cape, dramatic low angle shot, cinematic lighting, 3D animation style'",
      "style": "3d"
    },
    ...
  ]
}

RULES:
- Generate 8-12 scenes yang mencakup keseluruhan story
- Scene prompts HARUS dalam BAHASA INGGRIS (untuk AI video generator)
- Setiap prompt minimal 50 kata dengan detail specific
- Include camera angles, lighting, character expressions
- Style options: cartoon, sketch, 3d, vector, realistic, anime
- Sesuaikan style dengan genre ${projectGenre}
- Return ONLY valid JSON, no markdown`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 4000,
            temperature: 0.7,
        });

        // Parse response
        let scenes;
        try {
            let jsonText = result.text;
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            const parsed = JSON.parse(jsonText);
            scenes = parsed.scenes;
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            return NextResponse.json(
                { error: 'Failed to parse AI response' },
                { status: 500 }
            );
        }

        // Deduct credits
        await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

        // Log transaction
        await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for animation prompts', 'usage')
    `;

        // Log AI generation
        await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'animation_prompts', ${prompt.substring(0, 500)}, ${result.text.substring(0, 5000)}, ${creditCost}, 'completed')
    `;

        return NextResponse.json({
            success: true,
            scenes,
            creditsUsed: creditCost,
            remainingCredits: creditBalance - creditCost
        });
    } catch (error: any) {
        console.error('Animation prompts generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate animation prompts: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}
