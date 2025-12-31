import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate All Moodboard Prompts based on Story Structure
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId, structureType } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Verify user owns project and get data
        const project = await sql`
      SELECT id, title, genre, sub_genre, description,
             story_synopsis, story_structure
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
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 2;

        if (creditBalance < creditCost) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
                { status: 402 }
            );
        }

        const projectTitle = project[0].title;
        const projectGenre = project[0].genre || 'Drama';
        const storySynopsis = project[0].story_synopsis || project[0].description || '';
        const storyStructure = project[0].story_structure;

        const structure = structureType || 'save-the-cat';

        // Get characters for visual references
        const characters = await sql`
      SELECT name, role, visual_prompt FROM characters WHERE project_id = ${projectId}
    `;

        const characterDescriptions = characters.map((c: any) =>
            `- ${c.name} (${c.role}): ${c.visual_prompt || 'No visual description'}`
        ).join('\n');

        const prompt = `Anda adalah visual art director untuk film/animation. Generate moodboard prompts untuk setiap story beat.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Synopsis: ${storySynopsis}

CHARACTERS:
${characterDescriptions || 'No characters defined yet'}

STRUCTURE: ${structure === 'hero-journey' ? "Hero's Journey (12 stages)" : structure === 'dan-harmon' ? "Dan Harmon Story Circle (8 steps)" : "Save the Cat (15 beats)"}

Generate moodboard prompts dalam format JSON:
{
  "moodboards": [
    {
      "beatName": "Opening Image",
      "beatOrder": 1,
      "description": "Deskripsi singkat scene dalam Bahasa Indonesia...",
      "keyActions": "Aksi kunci yang terjadi...",
      "visualPrompt": "Detailed visual prompt in ENGLISH for AI image generation. Include: composition, lighting, color palette, mood, characters present, environment details, camera angle. Example: 'Wide establishing shot of a futuristic Jakarta skyline at dusk, neon lights reflecting on rain-soaked streets, protagonist silhouette standing on rooftop, cinematic lighting, cyberpunk aesthetic, moody atmosphere'",
      "colorPalette": ["#hex1", "#hex2", "#hex3"],
      "mood": "Mood of this scene (atmospheric, tense, joyful, etc)",
      "referenceStyle": "Reference visual style (e.g., Studio Ghibli, Marvel, Noir, etc)"
    }
  ]
}

RULES:
${structure === 'save-the-cat' ? `
Generate 15 beats: Opening Image, Theme Stated, Set-Up, Catalyst, Debate, Break into Two, B Story, Fun and Games, Midpoint, Bad Guys Close In, All Is Lost, Dark Night of Soul, Break into Three, Finale, Final Image
` : structure === 'hero-journey' ? `
Generate 12 stages: Ordinary World, Call to Adventure, Refusal of the Call, Meeting the Mentor, Crossing the Threshold, Tests Allies Enemies, Approach, The Ordeal, Reward, The Road Back, Resurrection, Return with Elixir
` : `
Generate 8 steps: You (comfort zone), Need, Go, Search, Find, Take, Return, Change
`}
- visualPrompt HARUS dalam BAHASA INGGRIS untuk AI image generator
- Setiap prompt minimal 50 kata dengan detail specific
- Include character names when relevant
- Sesuaikan dengan genre ${projectGenre}
- Return ONLY valid JSON, no markdown`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 5000,
            temperature: 0.7,
        });

        // Parse response
        let moodboards;
        try {
            let jsonText = result.text;
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            const parsed = JSON.parse(jsonText);
            moodboards = parsed.moodboards;
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: result.text },
                { status: 500 }
            );
        }

        // Save moodboards to database
        for (const moodboard of moodboards) {
            await sql`
        INSERT INTO moodboards (
          project_id, beat_name, beat_order, description, prompt
        ) VALUES (
          ${projectId}, ${moodboard.beatName}, ${moodboard.beatOrder},
          ${moodboard.description || null}, ${moodboard.visualPrompt || null}
        )
        ON CONFLICT (project_id, beat_name) DO UPDATE SET
          description = EXCLUDED.description,
          prompt = EXCLUDED.prompt,
          updated_at = NOW()
      `;
        }

        // Deduct credits
        await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

        // Log transaction
        await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for moodboard prompts', 'usage')
    `;

        // Log AI generation
        await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'moodboard_all', ${prompt.substring(0, 500)}, ${result.text.substring(0, 5000)}, ${creditCost}, 'completed')
    `;

        return NextResponse.json({
            success: true,
            moodboards,
            count: moodboards.length,
            creditsUsed: creditCost,
            remainingCredits: creditBalance - creditCost
        });
    } catch (error: any) {
        console.error('Moodboard generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate moodboards: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}
