import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { generateIPBiblePDF } from '@/lib/generate-ip-bible-pdf';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user owns project
    const projects = await sql`
      SELECT * FROM projects
      WHERE id = ${id} AND user_id = ${userId}
    `;

    if (!projects || projects.length === 0) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const project = projects[0] as any;

    // Fetch story data
    const stories = await sql`
      SELECT * FROM stories
      WHERE project_id = ${id}
    `;
    const story = stories[0] as any;

    // Fetch characters
    const characters = await sql`
      SELECT * FROM characters
      WHERE project_id = ${id}
      ORDER BY created_at ASC
    `;

    // Fetch universe
    const universes = await sql`
      SELECT * FROM universes
      WHERE project_id = ${id}
    `;
    const universe = universes[0] as any;

    // Fetch universe formula
    const universeFormulas = await sql`
      SELECT * FROM universe_formulas
      WHERE project_id = ${id}
    `;
    const universeFormula = universeFormulas[0] as any;

    // Fetch strategic plan
    const strategicPlans = await sql`
      SELECT * FROM strategic_plans
      WHERE project_id = ${id}
    `;
    const strategicPlan = strategicPlans[0] as any;

    // Fetch project team
    const projectTeam = await sql`
      SELECT * FROM project_team
      WHERE project_id = ${id}
      ORDER BY joined_at ASC
    `;

    // Fetch project materials
    const materials = await sql`
      SELECT * FROM project_materials
      WHERE project_id = ${id}
      ORDER BY created_at ASC
    `;

    // Parse JSON fields
    const parsedStory = story ? {
      genre: story.genre,
      subGenre: story.sub_genre,
      format: story.format,
      duration: story.duration,
      tone: story.tone,
      theme: story.theme,
      conflict: story.conflict,
      targetAudience: story.target_audience,
      endingType: story.ending_type,
      premise: story.premise,
      synopsis: story.synopsis,
      globalSynopsis: story.global_synopsis,
      structure: story.structure,
      structureBeats: story.structure_beats ? JSON.parse(story.structure_beats as string) : undefined,
    } : undefined;

    const parsedCharacters = characters.map((char: any) => ({
      name: char.name,
      role: char.role,
      age: char.age,
      physiological: char.physiological ? JSON.parse(char.physiological as string) : undefined,
      psychological: char.psychological ? JSON.parse(char.psychological as string) : undefined,
    }));

    const parsedStrategicPlan = strategicPlan ? {
      customerSegments: strategicPlan.customer_segments,
      valuePropositions: strategicPlan.value_propositions,
      channels: strategicPlan.channels,
      customerRelationships: strategicPlan.customer_relationships,
      revenueStreams: strategicPlan.revenue_streams,
      keyResources: strategicPlan.key_resources,
      keyActivities: strategicPlan.key_activities,
      keyPartnerships: strategicPlan.key_partnerships,
      costStructure: strategicPlan.cost_structure,
      cast: strategicPlan.cast_,
      director: strategicPlan.director,
      producer: strategicPlan.producer,
      executiveProducer: strategicPlan.executive_producer,
      distributor: strategicPlan.distributor,
      publisher: strategicPlan.publisher,
      titleBrandPositioning: strategicPlan.title_brand_positioning,
      themeStated: strategicPlan.theme_stated,
      uniqueSelling: strategicPlan.unique_selling,
      storyValues: strategicPlan.story_values,
      fansLoyalty: strategicPlan.fans_loyalty,
      productionBudget: strategicPlan.production_budget,
      promotionBudget: strategicPlan.promotion_budget,
      socialMediaEngagements: strategicPlan.social_media_engagements,
      teaserTrailerEngagements: strategicPlan.teaser_trailer_engagements,
      genre: strategicPlan.genre,
      competitorScores: strategicPlan.competitor_scores ? JSON.parse(strategicPlan.competitor_scores as string) : undefined,
      projectScores: strategicPlan.project_scores ? JSON.parse(strategicPlan.project_scores as string) : undefined,
      predictedAudience: strategicPlan.predicted_audience ? JSON.parse(strategicPlan.predicted_audience as string) : undefined,
    } : undefined;

    const parsedMaterials = materials.map((mat: any) => ({
      name: mat.name,
      description: mat.description,
      type: mat.type,
      fileUrl: mat.file_url,
      category: mat.category,
      tags: mat.tags ? JSON.parse(mat.tags as string) : [],
    }));

    // Compile IP Bible data
    const ipBibleData = {
      title: project.title || "Untitled IP",
      studioName: project.studio_name || undefined,
      ipOwner: project.ip_owner || undefined,
      story: parsedStory,
      characters: parsedCharacters,
      universe: universe ? {
        name: universe.name,
        period: universe.period,
        era: universe.era,
        location: universe.location,
        environment: universe.environment,
      } : undefined,
      universeFormula: universeFormula ? {
        workingOfficeSchool: universeFormula.working_office_school,
        townDistrictCity: universeFormula.town_district_city,
        neighborhoodEnvironment: universeFormula.neighborhood_environment,
        rulesOfWork: universeFormula.rules_of_work,
        laborLaw: universeFormula.labor_law,
        country: universeFormula.country,
        governmentSystem: universeFormula.government_system,
        universeName: universeFormula.universe_name,
        period: universeFormula.period,
        environmentLandscape: universeFormula.environment_landscape,
        societyAndSystem: universeFormula.society_and_system,
        privateInterior: universeFormula.private_interior,
        sociopoliticEconomy: universeFormula.sociopolitic_economy,
        socioculturalSystem: universeFormula.sociocultural_system,
        houseCastle: universeFormula.house_castle,
        roomCave: universeFormula.room_cave,
        familyInnerCircle: universeFormula.family_inner_circle,
        kingdomTribeCommunal: universeFormula.kingdom_tribe_communal,
      } : undefined,
      strategicPlan: parsedStrategicPlan,
      moodboardImages: project.moodboard_images ? JSON.parse(project.moodboard_images as string) : undefined,
      animationVideos: project.animation_videos ? JSON.parse(project.animation_videos as string) : undefined,
      projectTeam: projectTeam.map((member: any) => ({
        name: member.name,
        role: member.role,
        email: member.email,
        responsibilities: member.responsibilities,
        expertise: member.expertise,
      })),
      materials: parsedMaterials,
    };

    // Generate PDF
    const pdfBlob = await generateIPBiblePDF(ipBibleData);

    // Return PDF as response
    return new NextResponse(pdfBlob as Blob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${project.title.replace(/\s+/g, '_')}_IP_Bible.pdf"`,
      },
    });

  } catch (error) {
    console.error('IP Bible export error:', error);
    return NextResponse.json({ error: 'Failed to export IP Bible' }, { status: 500 });
  }
}
