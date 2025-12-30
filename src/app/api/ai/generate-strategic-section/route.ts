import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate content for Strategic Plan section (single or all)
export async function POST(request: NextRequest) {
  try {
    const { userId, projectId, section, projectContext, generateAll } = await request.json();

    if (!userId || !projectId || !section) {
      return NextResponse.json(
        { error: 'userId, projectId, and section are required' },
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
    const baseCreditCost = CREDIT_COSTS[selectedModel] || 1;

    // If generateAll, we charge more but generate everything at once
    const creditCost = generateAll ? baseCreditCost * 2 : baseCreditCost;

    if (creditBalance < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
        { status: 402 }
      );
    }

    const projectTitle = project[0].title;
    const projectGenre = project[0].genre || 'N/A';
    const projectSubGenre = project[0].sub_genre || 'N/A';
    const projectDescription = project[0].description || '';

    let prompt: string;
    let text: string;

    // Generate ALL sections at once or single section
    if (generateAll && section === 'businessModelCanvas') {
      prompt = `Anda adalah konsultan bisnis IP (Intellectual Property) profesional. Generate Business Model Canvas lengkap untuk IP project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Sub-Genre: ${projectSubGenre}
- Description: ${projectDescription}
${projectContext ? `- Additional Context: ${projectContext}` : ''}

Generate Business Model Canvas dengan 9 section ini dalam format JSON:
{
  "customerSegments": "Detailed customer segments analysis...",
  "valuePropositions": "Unique value propositions...",
  "channels": "Distribution and marketing channels...",
  "customerRelationships": "Customer engagement strategies...",
  "revenueStreams": "Monetization and revenue models...",
  "keyResources": "Essential resources needed...",
  "keyActivities": "Core business activities...",
  "keyPartnerships": "Strategic partnerships...",
  "costStructure": "Cost breakdown and structure..."
}

IMPORTANT:
- Setiap section harus detail dan actionable
- Sesuaikan dengan industri entertainment/media
- Gunakan bahasa Indonesia
- Fokus pada IP development untuk film/animation/series
- Return ONLY valid JSON, no markdown`;

      const model = getTextModel(selectedModel);
      const result = await generateText({
        model,
        prompt,
        maxTokens: 3000,
        temperature: 0.7,
      });
      text = result.text;

    } else if (generateAll && section === 'performanceAnalysis') {
      prompt = `Anda adalah analis industri entertainment profesional. Generate Performance Analysis untuk IP project berikut.

PROJECT INFO:
- Title: ${projectTitle}
- Genre: ${projectGenre}
- Sub-Genre: ${projectSubGenre}
- Description: ${projectDescription}
${projectContext ? `- Additional Context: ${projectContext}` : ''}

Generate analisis 15 Key Performance Factors dalam format JSON:
{
  "cast": "Rekomendasi cast dan talent strategy...",
  "director": "Director profile dan vision...",
  "producer": "Producer approach dan strategy...",
  "executiveProducer": "Executive producer role...",
  "distributor": "Distribution strategy...",
  "publisher": "Publishing/release strategy...",
  "titleBrandPositioning": "Brand positioning strategy...",
  "themeStated": "Core themes dan messaging...",
  "uniqueSelling": "Unique selling points...",
  "storyValues": "Story values dan emotional hooks...",
  "fansLoyalty": "Fan engagement strategy...",
  "productionBudget": "Budget recommendation...",
  "promotionBudget": "Marketing budget allocation...",
  "socialMediaEngagements": "Social media strategy...",
  "teaserTrailerEngagements": "Trailer/teaser strategy..."
}

IMPORTANT:
- Setiap factor harus spesifik dan actionable
- Berikan rekomendasi konkret, bukan generic
- Gunakan bahasa Indonesia
- Return ONLY valid JSON, no markdown`;

      const model = getTextModel(selectedModel);
      const result = await generateText({
        model,
        prompt,
        maxTokens: 3000,
        temperature: 0.7,
      });
      text = result.text;

    } else {
      // Single section generation (original behavior)
      const prompts: Record<string, string> = {
        customerSegments: `Generate Customer Segments untuk IP project "${projectTitle}" genre ${projectGenre}. 
Analisis: demographics, needs, behaviors. Bahasa Indonesia, actionable insights.`,

        valuePropositions: `Generate Value Propositions untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: unique value, emotional/functional benefits, differentiation. Bahasa Indonesia.`,

        channels: `Generate Channels analysis untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: digital channels, traditional channels, distribution, marketing. Bahasa Indonesia.`,

        customerRelationships: `Generate Customer Relationships untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: engagement, community building, fan interaction. Bahasa Indonesia.`,

        revenueStreams: `Generate Revenue Streams untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: primary/secondary revenue, monetization, pricing. Bahasa Indonesia.`,

        keyResources: `Generate Key Resources untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: IP assets, talent, production resources, financial. Bahasa Indonesia.`,

        keyActivities: `Generate Key Activities untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: content creation, marketing, distribution, engagement. Bahasa Indonesia.`,

        keyPartnerships: `Generate Key Partnerships untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: distribution, production, marketing, licensing partners. Bahasa Indonesia.`,

        costStructure: `Generate Cost Structure untuk IP project "${projectTitle}" genre ${projectGenre}.
Analisis: production, marketing, distribution, operational costs. Bahasa Indonesia.`,
      };

      prompt = prompts[section] || `Generate content for ${section} section of IP Business Model Canvas for: ${projectTitle}`;

      const model = getTextModel(selectedModel);
      const result = await generateText({
        model,
        prompt,
        maxTokens: 1500,
        temperature: 0.7,
      });
      text = result.text;
    }

    // Deduct credits
    await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, ${'AI generation for strategic plan: ' + section}, 'usage')
    `;

    // Log AI generation
    await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'strategic_plan_section', ${prompt.substring(0, 500)}, ${text.substring(0, 5000)}, ${creditCost}, 'completed')
    `;

    return NextResponse.json({
      success: true,
      content: text,
      creditsUsed: creditCost,
      remainingCredits: creditBalance - creditCost,
      generateAll: generateAll || false
    });
  } catch (error: any) {
    console.error('Strategic plan section generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate section: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
