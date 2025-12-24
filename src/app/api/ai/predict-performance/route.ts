import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateText } from 'ai';
import { getTextModel, DEFAULT_MODELS, CREDIT_COSTS, TextModelId } from '@/lib/ai/providers';

const sql = neon(process.env.DATABASE_URL!);

// POST - Predict performance based on 15 key factors
export async function POST(request: NextRequest) {
  try {
    const { userId, projectId, competitorName, performaData } = await request.json();

    if (!userId || !projectId) {
      return NextResponse.json(
        { error: 'userId and projectId are required' },
        { status: 400 }
      );
    }

    // Verify user owns the project
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

    const userTier = userResult[0].subscription_tier || 'free';
    const creditBalance = userResult[0].credit_balance || 0;

    // Check credit cost for performance prediction
    const selectedModel = DEFAULT_MODELS.synopsis as TextModelId;
    const creditCost = CREDIT_COSTS[selectedModel] || 1;

    if (creditBalance < creditCost) {
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditCost, balance: creditBalance },
        { status: 402 }
      );
    }

    // Build prompt for AI
    const prompt = `Analyze performance potential of an IP project based on the following 15 key factors:

Project Title: ${project[0].title}
Genre: ${project[0].genre || 'N/A'}
Sub-Genre: ${project[0].sub_genre || 'N/A'}

15 Key Factors:
1. Cast: ${performaData.cast || 'Not specified'}
2. Director: ${performaData.director || 'Not specified'}
3. Producer: ${performaData.producer || 'Not specified'}
4. Executive Producer: ${performaData.executiveProducer || 'Not specified'}
5. Distributor: ${performaData.distributor || 'Not specified'}
6. Publisher: ${performaData.publisher || 'Not specified'}
7. Title Brand Positioning: ${performaData.titleBrandPositioning || 'Not specified'}
8. Theme Stated: ${performaData.themeStated || 'Not specified'}
9. Unique Selling Point: ${performaData.uniqueSelling || 'Not specified'}
10. Story Values: ${performaData.storyValues || 'Not specified'}
11. Fans Loyalty: ${performaData.fansLoyalty || 'Not specified'}
12. Production Budget: ${performaData.productionBudget || 'Not specified'}
13. Promotion Budget: ${performaData.promotionBudget || 'Not specified'}
14. Social Media Engagements: ${performaData.socialMediaEngagements || 'Not specified'}
15. Teaser Trailer Engagements: ${performaData.teaserTrailerEngagements || 'Not specified'}

${competitorName ? `Competitor: ${competitorName}` : ''}

Please analyze and provide:
1. A score (1-10) for each of the 15 factors
2. Overall project score (1-100)
3. Predicted audience size and demographics
4. Key strengths and weaknesses
5. Suggestions to improve performance

Format your response as JSON:
{
  "projectScores": {
    "cast": <1-10>,
    "director": <1-10>,
    "producer": <1-10>,
    "executiveProducer": <1-10>,
    "distributor": <1-10>,
    "publisher": <1-10>,
    "titleBrandPositioning": <1-10>,
    "themeStated": <1-10>,
    "uniqueSelling": <1-10>,
    "storyValues": <1-10>,
    "fansLoyalty": <1-10>,
    "productionBudget": <1-10>,
    "promotionBudget": <1-10>,
    "socialMediaEngagements": <1-10>,
    "teaserTrailerEngagements": <1-10>
  },
  "overallScore": <1-100>,
  "predictedAudience": {
    "size": "estimated number",
    "demographics": ["age groups", "regions", "interests"]
  },
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "suggestions": ["suggestion 1", "suggestion 2", ...]
}`;

    // Get model and generate
    const model = getTextModel(selectedModel);
    const { text } = await generateText({
      model,
      prompt,
      maxTokens: 2000,
      temperature: 0.7,
    });

    // Parse AI response
    let analysis;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      analysis = {
        projectScores: {},
        overallScore: 50,
        predictedAudience: { size: 'Unknown', demographics: [] },
        strengths: [],
        weaknesses: [],
        suggestions: ['Unable to analyze - please provide more details']
      };
    }

    // Deduct credits
    await sql`
      UPDATE users SET credit_balance = credit_balance - ${creditCost}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    // Log transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, balance_after, description, type)
      VALUES (${userId}, -${creditCost}, ${creditBalance - creditCost}, 'Performance prediction for project ${projectId}', 'usage')
    `;

    // Log AI generation
    await sql`
      INSERT INTO ai_generation_logs (user_id, project_id, generation_type, prompt, result, credits_used, status)
      VALUES (${userId}, ${projectId}, 'performance_prediction', ${prompt.substring(0, 500)}, ${JSON.stringify(analysis)}, ${creditCost}, 'completed')
    `;

    return NextResponse.json({
      success: true,
      analysis,
      creditsUsed: creditCost,
      remainingCredits: creditBalance - creditCost
    });
  } catch (error: any) {
    console.error('Performance prediction error:', error);
    return NextResponse.json(
      { error: 'Failed to predict performance: ' + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
