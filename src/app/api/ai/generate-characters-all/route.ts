import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate All Characters for a project based on story
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId, characterCount } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Verify user owns project and get story data
        const project = await sql`
      SELECT id, title, genre, sub_genre, description,
             story_premise, story_synopsis
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
        const selectedModel = DEFAULT_MODELS.character as TextModelId;
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 3;

        if (creditBalance < creditCost) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
                { status: 402 }
            );
        }

        const projectTitle = project[0].title;
        const projectGenre = project[0].genre || 'Drama';
        const projectSubGenre = project[0].sub_genre || '';
        const storySynopsis = project[0].story_synopsis || project[0].story_premise || project[0].description || '';

        const numCharacters = characterCount || 5;

        const prompt = `Anda adalah character designer profesional untuk IP storytelling. Generate ${numCharacters} karakter lengkap untuk project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre} ${projectSubGenre ? `/ ${projectSubGenre}` : ''}
- Synopsis: ${storySynopsis}

Generate characters dalam format JSON:
{
  "characters": [
    {
      "name": "Nama Karakter",
      "role": "protagonist/antagonist/supporting/mentor/comic_relief",
      "age": "25",
      "gender": "male/female",
      "occupation": "Pekerjaan/Status",
      "description": "Deskripsi singkat karakter...",
      "castReference": "Referensi aktor/penampilan (opsional)",
      "physiological": {
        "height": "170cm",
        "build": "Athletic/Slim/Heavy",
        "features": "Ciri fisik khusus",
        "health": "Kondisi kesehatan"
      },
      "psychological": {
        "personality": "MBTI atau deskripsi kepribadian",
        "quirks": "Kebiasaan unik",
        "fears": "Ketakutan",
        "desires": "Keinginan terdalam"
      },
      "emotional": {
        "temperament": "Temperamen",
        "triggers": "Pemicu emosi",
        "coping": "Cara mengatasi stress"
      },
      "family": {
        "background": "Latar belakang keluarga",
        "relationships": "Hubungan dengan keluarga"
      },
      "sociocultural": {
        "class": "Kelas sosial",
        "religion": "Agama/kepercayaan",
        "values": "Nilai yang dipegang"
      },
      "coreBeliefs": "Keyakinan inti karakter...",
      "educational": {
        "level": "Tingkat pendidikan",
        "skills": "Skill khusus"
      },
      "swot": {
        "strengths": "Kekuatan",
        "weaknesses": "Kelemahan",
        "opportunities": "Peluang",
        "threats": "Ancaman"
      },
      "characterArc": "Perjalanan karakter dari awal hingga akhir...",
      "visualPrompt": "Detailed visual description in ENGLISH for AI image generation..."
    }
  ]
}

RULES:
- Generate ${numCharacters} karakter yang berbeda-beda
- WAJIB ada minimal 1 protagonist dan 1 antagonist
- Setiap karakter harus punya personality yang distinct
- Character arcs harus koheren dengan story
- Visual prompts HARUS dalam BAHASA INGGRIS
- Sesuaikan dengan genre ${projectGenre}
- Return ONLY valid JSON, no markdown`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 5000,
            temperature: 0.8,
        });

        // Parse response
        let characters;
        try {
            let jsonText = result.text;
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            const parsed = JSON.parse(jsonText);
            characters = parsed.characters;
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: result.text },
                { status: 500 }
            );
        }

        // Save characters to database
        for (const char of characters) {
            // Map role to valid enum value
            let role = char.role?.toLowerCase() || 'supporting';
            const validRoles = ['protagonist', 'antagonist', 'deuteragonist', 'tritagonist', 'love_interest', 'mentor', 'sidekick', 'foil', 'supporting'];
            if (!validRoles.includes(role)) {
                role = 'supporting';
            }

            await sql`
        INSERT INTO characters (
          project_id, name, role, age, cast_reference,
          physiological, psychological, emotional, family,
          sociocultural, core_beliefs, educational, sociopolitics, swot_analysis, traits
        ) VALUES (
          ${projectId}, ${char.name}, ${role}, ${char.age || null}, ${char.castReference || null},
          ${JSON.stringify(char.physiological) || null}, ${JSON.stringify(char.psychological) || null},
          ${JSON.stringify(char.emotional) || null}, ${JSON.stringify(char.family) || null},
          ${JSON.stringify(char.sociocultural) || null}, ${JSON.stringify(char.coreBeliefs ? { main: char.coreBeliefs } : null)},
          ${JSON.stringify(char.educational) || null}, ${null}, ${JSON.stringify(char.swot) || null},
          ${char.description || null}
        )
        ON CONFLICT (project_id, name) DO UPDATE SET
          role = EXCLUDED.role,
          age = EXCLUDED.age,
          cast_reference = EXCLUDED.cast_reference,
          physiological = EXCLUDED.physiological,
          psychological = EXCLUDED.psychological,
          emotional = EXCLUDED.emotional,
          family = EXCLUDED.family,
          sociocultural = EXCLUDED.sociocultural,
          core_beliefs = EXCLUDED.core_beliefs,
          swot_analysis = EXCLUDED.swot_analysis,
          traits = EXCLUDED.traits,
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
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for all characters', 'usage')
    `;

        // Log AI generation
        await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'characters_all', ${prompt.substring(0, 500)}, ${result.text.substring(0, 5000)}, ${creditCost}, 'completed')
    `;

        return NextResponse.json({
            success: true,
            characters,
            count: characters.length,
            creditsUsed: creditCost,
            remainingCredits: creditBalance - creditCost
        });
    } catch (error: any) {
        console.error('Characters generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate characters: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}
