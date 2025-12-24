import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET strategic plan
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns the project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const plan = await sql`
    SELECT * FROM strategic_plans WHERE project_id = ${id}
  `;

  // Map cast_ to cast for frontend
  if (plan.length > 0 && plan[0].cast_) {
    plan[0].cast = plan[0].cast_;
  }

  return NextResponse.json(plan[0] || null);
}

// POST/PUT strategic plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns the project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const data = await request.json();
  
  // Check if plan exists
  const existing = await sql`
    SELECT id FROM strategic_plans WHERE project_id = ${id}
  `;

  if (existing.length > 0) {
    // Update
    const updated = await sql`
      UPDATE strategic_plans SET
        customer_segments = ${data.customerSegments || null},
        value_propositions = ${data.valuePropositions || null},
        channels = ${data.channels || null},
        customer_relationships = ${data.customerRelationships || null},
        revenue_streams = ${data.revenueStreams || null},
        key_resources = ${data.keyResources || null},
        key_activities = ${data.keyActivities || null},
        key_partnerships = ${data.keyPartnerships || null},
        cost_structure = ${data.costStructure || null},
        cast_ = ${data.cast || null},
        director = ${data.director || null},
        producer = ${data.producer || null},
        executive_producer = ${data.executiveProducer || null},
        distributor = ${data.distributor || null},
        publisher = ${data.publisher || null},
        title_brand_positioning = ${data.titleBrandPositioning || null},
        theme_stated = ${data.themeStated || null},
        unique_selling = ${data.uniqueSelling || null},
        story_values = ${data.storyValues || null},
        fans_loyalty = ${data.fansLoyalty || null},
        production_budget = ${data.productionBudget || null},
        promotion_budget = ${data.promotionBudget || null},
        social_media_engagements = ${data.socialMediaEngagements || null},
        teaser_trailer_engagements = ${data.teaserTrailerEngagements || null},
        genre = ${data.genre || null},
        competitor_name = ${data.competitorName || null},
        competitor_scores = ${data.competitorScores ? JSON.stringify(data.competitorScores) : null}::jsonb,
        project_scores = ${data.projectScores ? JSON.stringify(data.projectScores) : null}::jsonb,
        predicted_audience = ${data.predictedAudience ? JSON.stringify(data.predictedAudience) : null}::jsonb,
        ai_suggestions = ${data.aiSuggestions || null},
        updated_at = NOW()
      WHERE id = ${existing[0].id}
      RETURNING *
    `;
    return NextResponse.json(updated[0]);
  } else {
    // Create
    const created = await sql`
      INSERT INTO strategic_plans (
        project_id,
        customer_segments, value_propositions, channels, customer_relationships,
        revenue_streams, key_resources, key_activities, key_partnerships, cost_structure,
        cast_, director, producer, executive_producer, distributor, publisher,
        title_brand_positioning, theme_stated, unique_selling, story_values, fans_loyalty,
        production_budget, promotion_budget, social_media_engagements, teaser_trailer_engagements, genre,
        competitor_name, competitor_scores, project_scores, predicted_audience, ai_suggestions
      )
      VALUES (
        ${id},
        ${data.customerSegments || null}, ${data.valuePropositions || null}, ${data.channels || null}, ${data.customerRelationships || null},
        ${data.revenueStreams || null}, ${data.keyResources || null}, ${data.keyActivities || null}, ${data.keyPartnerships || null}, ${data.costStructure || null},
        ${data.cast || null}, ${data.director || null}, ${data.producer || null}, ${data.executiveProducer || null}, ${data.distributor || null}, ${data.publisher || null},
        ${data.titleBrandPositioning || null}, ${data.themeStated || null}, ${data.uniqueSelling || null}, ${data.storyValues || null}, ${data.fansLoyalty || null},
        ${data.productionBudget || null}, ${data.promotionBudget || null}, ${data.socialMediaEngagements || null}, ${data.teaserTrailerEngagements || null}, ${data.genre || null},
        ${data.competitorName || null}, ${data.competitorScores ? JSON.stringify(data.competitorScores) : null}::jsonb,
        ${data.projectScores ? JSON.stringify(data.projectScores) : null}::jsonb,
        ${data.predictedAudience ? JSON.stringify(data.predictedAudience) : null}::jsonb,
        ${data.aiSuggestions || null}
      )
      RETURNING *
    `;
    return NextResponse.json(created[0]);
  }
}
