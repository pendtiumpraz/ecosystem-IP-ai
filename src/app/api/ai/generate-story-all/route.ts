import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate All Story Content (Premise, Synopsis, Structure, Beats)
export async function POST(request: NextRequest) {
    try {
        const { userId, projectId, structureType } = await request.json();

        if (!userId || !projectId) {
            return NextResponse.json(
                { error: 'userId and projectId are required' },
                { status: 400 }
            );
        }

        // Verify user owns project
        const project = await sql`
      SELECT id, title, genre, sub_genre, description FROM projects 
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
        const creditCost = (CREDIT_COSTS[selectedModel] || 1) * 3; // Triple for full story generation

        if (creditBalance < creditCost) {
            return NextResponse.json(
                { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
                { status: 402 }
            );
        }

        const projectTitle = project[0].title;
        const projectGenre = project[0].genre || 'Drama';
        const projectSubGenre = project[0].sub_genre || '';
        const projectDescription = project[0].description || '';

        const structure = structureType || 'save-the-cat';

        const prompt = `Anda adalah screenwriter profesional. Generate story lengkap untuk IP project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Sub-Genre: ${projectSubGenre}
- Description: ${projectDescription}

Gunakan struktur: ${structure === 'hero-journey' ? "Hero's Journey" : structure === 'dan-harmon' ? "Dan Harmon Story Circle" : "Save the Cat"}

Generate story dalam format JSON:
{
  "premise": "Satu kalimat inti cerita yang powerful...",
  "synopsis": "Synopsis 2-3 paragraf yang ringkas dan menarik...",
  "globalSynopsis": "Synopsis global untuk keseluruhan IP, bisa digunakan untuk pitching...",
  "theme": "Tema utama cerita...",
  "tone": "Tone cerita (Serious/Humorous/Suspenseful/Emotional)...",
  "want": "Apa yang karakter utama INGINKAN secara eksternal...",
  "need": "Apa yang karakter utama BUTUHKAN secara internal...",
  "endingType": "happy/tragic/open",
  "structure": {
    "name": "Nama struktur cerita",
    "acts": [
      {
        "name": "Act 1: Setup",
        "beats": [
          {
            "name": "Opening Image",
            "description": "Deskripsi beat ini...",
            "keyActions": "Aksi kunci yang terjadi..."
          },
          // ... more beats
        ]
      },
      {
        "name": "Act 2: Confrontation",
        "beats": [...]
      },
      {
        "name": "Act 3: Resolution",
        "beats": [...]
      }
    ]
  }
}

RULES:
${structure === 'save-the-cat' ? `
SAVE THE CAT BEATS (15 beats):
1. Opening Image - Snapshot of the protagonist's world before the adventure
2. Theme Stated - Someone (not the hero) states the movie's theme
3. Set-Up - The hero's world, what's missing, what needs to change
4. Catalyst - The moment that changes everything
5. Debate - The hero debates what to do
6. Break into Two - The hero decides to enter a new world
7. B Story - A subplot, often a love story
8. Fun and Games - The promise of the premise
9. Midpoint - Stakes are raised, false victory or false defeat
10. Bad Guys Close In - Pressure mounts, things fall apart
11. All Is Lost - The hero hits rock bottom
12. Dark Night of the Soul - The hero is beaten and hopeless
13. Break into Three - The hero finds a solution
14. Finale - The hero defeats the bad guys
15. Final Image - Shows how the hero has changed
` : structure === 'hero-journey' ? `
HERO'S JOURNEY (12 stages):
1. Ordinary World
2. Call to Adventure
3. Refusal of the Call
4. Meeting the Mentor
5. Crossing the Threshold
6. Tests, Allies, Enemies
7. Approach to the Inmost Cave
8. The Ordeal
9. Reward
10. The Road Back
11. Resurrection
12. Return with the Elixir
` : `
DAN HARMON STORY CIRCLE (8 steps):
1. You - A character is in a zone of comfort
2. Need - But they want something
3. Go - They enter an unfamiliar situation
4. Search - Adapt to it
5. Find - Get what they wanted
6. Take - Pay a heavy price for it
7. Return - Then return to their familiar situation
8. Change - Having changed
`}
- Gunakan bahasa Indonesia
- Buat story yang koheren dan menarik
- Sesuaikan dengan genre ${projectGenre}
- Return ONLY valid JSON, no markdown`;

        const model = getTextModel(selectedModel);
        const result = await generateText({
            model,
            prompt,
            maxTokens: 4000,
            temperature: 0.7,
        });

        // Parse response
        let storyData;
        try {
            let jsonText = result.text;
            if (jsonText.includes('```')) {
                jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            }
            storyData = JSON.parse(jsonText);
        } catch (e) {
            console.error('Failed to parse AI response:', e);
            return NextResponse.json(
                { error: 'Failed to parse AI response', raw: result.text },
                { status: 500 }
            );
        }

        // Save to database
        await sql`
      UPDATE projects SET
        story_premise = ${storyData.premise || null},
        story_synopsis = ${storyData.synopsis || null},
        story_global_synopsis = ${storyData.globalSynopsis || null},
        story_structure = ${JSON.stringify(storyData.structure) || null},
        story_theme = ${storyData.theme || null},
        story_tone = ${storyData.tone || null},
        story_want = ${storyData.want || null},
        story_need = ${storyData.need || null},
        story_ending = ${storyData.endingType || null},
        updated_at = NOW()
      WHERE id = ${projectId}
    `;

        // Deduct credits
        await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

        // Log transaction
        await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for complete story', 'usage')
    `;

        // Log AI generation
        await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'story_all', ${prompt.substring(0, 500)}, ${result.text.substring(0, 5000)}, ${creditCost}, 'completed')
    `;

        return NextResponse.json({
            success: true,
            story: storyData,
            creditsUsed: creditCost,
            remainingCredits: creditBalance - creditCost
        });
    } catch (error: any) {
        console.error('Story generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate story: ' + (error.message || String(error)) },
            { status: 500 }
        );
    }
}
