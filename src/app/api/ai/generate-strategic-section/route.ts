import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Generate content for Strategic Plan section
export async function POST(request: NextRequest) {
  try {
    const { userId, projectId, section, projectContext } = await request.json();

    if (!userId || !projectId || !section) {
      return NextResponse.json(
        { error: 'userId, projectId, and section are required' },
        { status: 400 }
      );
    }

    // Verify user owns project
    const project = await sql`
      SELECT id, title, genre, sub_genre FROM projects 
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
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    if (creditBalance < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
        { status: 402 }
      );
    }

    // Build prompt based on section
    const prompts: Record<string, string> = {
      customerSegments: `Generate a detailed Customer Segments analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Primary target audience demographics (age, gender, location, interests)
2. Secondary audience segments
3. Customer needs and pain points
4. Market size and growth potential
5. Customer behaviors and preferences

Provide specific, actionable insights for this IP project.`,

      valuePropositions: `Generate a detailed Value Propositions analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Core value proposition - what unique value does this IP deliver?
2. Emotional benefits for the audience
3. Functional benefits
4. Differentiation from competitors
5. Why audiences should choose this IP

Provide specific, compelling value propositions.`,

      channels: `Generate a detailed Channels analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Digital channels (streaming platforms, social media, websites)
2. Traditional channels (TV, theaters, physical media)
3. Distribution strategies
4. Marketing channels
5. Partnership opportunities

Provide specific channel recommendations for this IP project.`,

      customerRelationships: `Generate a detailed Customer Relationships analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Type of customer relationship (community, fandom, casual)
2. Engagement strategies
3. Community building approaches
4. Fan interaction methods
5. Long-term relationship building

Provide specific relationship strategies for this IP project.`,

      revenueStreams: `Generate a detailed Revenue Streams analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Primary revenue sources (streaming, licensing, merchandise)
2. Secondary revenue opportunities
3. Monetization strategies
4. Pricing models
5. Revenue diversification

Provide specific revenue stream recommendations for this IP project.`,

      keyResources: `Generate a detailed Key Resources analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Intellectual property assets (characters, stories, world-building)
2. Creative talent (writers, artists, voice actors)
3. Production resources (equipment, software, facilities)
4. Financial resources
5. Distribution and marketing resources

Provide specific resource requirements for this IP project.`,

      keyActivities: `Generate a detailed Key Activities analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Content creation activities (writing, designing, producing)
2. Marketing and promotional activities
3. Distribution management
4. Fan engagement activities
5. Business development activities

Provide specific activity recommendations for this IP project.`,

      keyPartnerships: `Generate a detailed Key Partnerships analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Distribution partners (streaming platforms, publishers)
2. Production partners (studios, animation houses)
3. Marketing and promotional partners
4. Licensing partners (merchandise, games)
5. Technology and infrastructure partners

Provide specific partnership recommendations for this IP project.`,

      costStructure: `Generate a detailed Cost Structure analysis for an IP project.

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}
${projectContext ? `Additional Context: ${projectContext}` : ''}

Analyze and describe:
1. Production costs (talent, equipment, facilities)
2. Marketing and promotion costs
3. Distribution costs
4. Ongoing operational costs
5. Fixed vs variable costs breakdown

Provide specific cost structure recommendations for this IP project.`,
    };

    const prompt = prompts[section] || `Generate content for ${section} section of the IP Business Model Canvas for project: ${project[0].title}`;

    // Get model and generate
    const model = getTextModel(selectedModel);
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 1500,
      temperature: 0.7,
    });

    // Deduct credits
    await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'AI generation for strategic plan section: ${section}', 'usage')
    `;

    // Log AI generation
    await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result_text, credits_used, status)
      VALUES (${userId}, ${projectId}, 'strategic_plan_section', ${prompt.substring(0, 500)}, ${text}, ${creditCost}, 'completed')
    `;

    return NextResponse.json({
      success: true,
      content: text,
      creditsUsed: creditCost,
      remainingCredits: creditBalance - creditCost
    });
  } catch (error: any) {
    console.error('Strategic plan section generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate section: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
