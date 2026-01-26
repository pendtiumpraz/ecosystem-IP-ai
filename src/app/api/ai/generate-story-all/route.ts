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

    // Helper function to get structure display name
    const getStructureDisplayName = (type: string): string => {
      switch (type) {
        case 'hero-journey': return "Hero's Journey";
        case 'dan-harmon': return "Dan Harmon Story Circle";
        case 'three-act': return "Three Act Structure";
        case 'freytag': return "Freytag's Pyramid";
        case 'custom': return "Custom Structure";
        default: return "Save the Cat";
      }
    };

    // Helper function to get structure beats description
    const getStructureBeatsDescription = (type: string, customBeats?: any[]): string => {
      switch (type) {
        case 'save-the-cat':
          return `SAVE THE CAT BEATS (15 beats):
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
15. Final Image - Shows how the hero has changed`;

        case 'hero-journey':
          return `HERO'S JOURNEY (12 stages):
1. Ordinary World - The hero in their normal life
2. Call to Adventure - Something shakes up the situation
3. Refusal of the Call - The hero fears the unknown
4. Meeting the Mentor - Hero gets supplies or advice
5. Crossing the Threshold - Committing to the journey
6. Tests, Allies, Enemies - Exploring the new world
7. Approach to the Inmost Cave - Preparing for the main danger
8. The Ordeal - The central crisis
9. Reward - Seizing the sword
10. The Road Back - Recommitment to complete the journey
11. Resurrection - Final exam where hero is tested once more
12. Return with the Elixir - Hero returns home changed`;

        case 'dan-harmon':
          return `DAN HARMON STORY CIRCLE (8 steps):
1. You (Comfort Zone) - A character in their comfort zone
2. Need - But they want something
3. Go - They enter an unfamiliar situation
4. Search - Adapt to the new situation
5. Find - Get what they wanted
6. Take - Pay a heavy price for it
7. Return - Return to their familiar situation
8. Change - Having changed`;

        case 'three-act':
          return `THREE ACT STRUCTURE (8 beats):
1. Setup - Introduce the world, characters, and the status quo
2. Inciting Incident - The event that sets the story in motion
3. Plot Point 1 - A turning point that propels the story into Act 2
4. Rising Action - Conflicts and obstacles escalate
5. Midpoint - A major revelation or reversal
6. Plot Point 2 - Crisis point leading to Act 3
7. Climax - The highest point of tension; the main conflict is addressed
8. Resolution - The aftermath; loose ends are tied up`;

        case 'freytag':
          return `FREYTAG'S PYRAMID (5 phases):
1. Exposition - Background information, setting, and characters are introduced
2. Rising Action - Series of events that build toward the climax
3. Climax - The turning point; highest emotional intensity
4. Falling Action - Events that unfold after the climax
5. Denouement - Final resolution of the plot`;

        case 'custom':
          if (customBeats && customBeats.length > 0) {
            const beatsList = customBeats.map((b, i) =>
              `${i + 1}. ${b.label} (Act ${b.act}) - ${b.desc || 'No description'}`
            ).join('\n');
            return `CUSTOM STRUCTURE (${customBeats.length} beats):\n${beatsList}`;
          }
          return `CUSTOM STRUCTURE:
User has defined their own beat structure. Generate appropriate beats based on the story flow with Act 1 (Setup), Act 2 (Confrontation), and Act 3 (Resolution).`;

        default:
          return `SAVE THE CAT BEATS (15 beats - default)`;
      }
    };

    const structureDisplayName = getStructureDisplayName(structure);
    const structureBeatsDescription = getStructureBeatsDescription(structure);

    const prompt = `Anda adalah screenwriter profesional. Generate story lengkap untuk IP project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Sub-Genre: ${projectSubGenre}
- Description: ${projectDescription}

Gunakan struktur: ${structureDisplayName}

Generate story dalam format JSON:
{
  "premise": "Satu kalimat inti cerita yang powerful...",
  "synopsis": "Synopsis 2-3 paragraf yang ringkas dan menarik...",
  "globalSynopsis": "Synopsis global untuk keseluruhan IP, bisa digunakan untuk pitching...",
  "theme": "Tema utama cerita...",
  "tone": "Tone cerita (Serious/Humorous/Suspenseful/Emotional)...",
  "want": "Apa yang karakter utama INGINKAN secara eksternal...",
  "need": "Apa yang karakter utama BUTUHKAN secara internal...",
  "wantStages": {
    "menginginkan": "Apa yang awalnya diinginkan...",
    "memastikan": "Bagaimana karakter memastikan/berkomitmen...",
    "mengejar": "Bagaimana karakter aktif mengejar...",
    "tercapai": true/false
  },
  "needStages": {
    "membutuhkan": "Apa kebutuhan internal karakter...",
    "menemukan": "Bagaimana karakter menemukan kebenaran...",
    "menerima": "Bagaimana karakter menerima perubahan...",
    "terpenuhi": true/false
  },
  "endingType": "happy/sad/bitter_sweet/ambiguous/cliffhanger/twisted",
  "endingRasa": "Pahit-manis/Puas/Gelisah/Muram/Tenang/Reflektif",
  "structure": {
    "name": "${structureDisplayName}",
    "acts": [
      {
        "name": "Act 1: Setup",
        "beats": [
          {
            "key": "beatKeyName",
            "name": "Beat Name",
            "description": "Deskripsi beat ini...",
            "keyActions": "Aksi kunci yang terjadi..."
          }
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
${structureBeatsDescription}
- Gunakan bahasa Indonesia
- Buat story yang koheren dan menarik
- Sesuaikan dengan genre ${projectGenre}
- wantStages dan needStages wajib diisi dengan journey karakter
- endingType harus salah satu dari: happy, sad, bitter_sweet, ambiguous, cliffhanger, twisted
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
