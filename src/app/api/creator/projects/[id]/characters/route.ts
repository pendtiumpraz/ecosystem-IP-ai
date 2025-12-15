import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List characters for project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const characters = await sql`
      SELECT * FROM characters WHERE project_id = ${id} ORDER BY created_at
    `;

    return NextResponse.json({
      characters: characters.map((c: any) => ({
        id: c.id,
        name: c.name,
        role: c.role,
        age: c.age,
        castReference: c.cast_reference,
        imageUrl: c.image_url,
        imagePoses: c.image_poses || {},
        physiological: c.physiological || {},
        psychological: c.psychological || {},
        emotional: c.emotional || {},
        family: c.family || {},
        sociocultural: c.sociocultural || {},
        coreBeliefs: c.core_beliefs || {},
        educational: c.educational || {},
        sociopolitics: c.sociopolitics || {},
        swot: c.swot_analysis || {},
        traits: c.traits,
        clothingStyle: c.physiological?.clothingStyle || "",
        accessories: c.physiological?.accessories || [],
        props: c.physiological?.props || "",
        personalityTraits: c.psychological?.personalityTraits || []
      }))
    });
  } catch (error) {
    console.error("List characters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch characters" },
      { status: 500 }
    );
  }
}

// POST - Create character
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();

    const {
      name, role, age, castReference, imageUrl, imagePoses,
      physiological, psychological, emotional, family,
      sociocultural, coreBeliefs, educational, sociopolitics, swot,
      traits, clothingStyle, accessories, props, personalityTraits
    } = body;

    // Merge extra fields into physiological/psychological
    const mergedPhysiological = {
      ...physiological,
      clothingStyle,
      accessories,
      props
    };
    const mergedPsychological = {
      ...psychological,
      personalityTraits
    };

    const result = await sql`
      INSERT INTO characters (
        project_id, name, role, age, cast_reference, image_url, image_poses,
        physiological, psychological, emotional, family,
        sociocultural, core_beliefs, educational, sociopolitics, swot_analysis, traits
      ) VALUES (
        ${projectId}, ${name}, ${role || 'supporting'}, ${age || null}, ${castReference || null},
        ${imageUrl || null}, ${JSON.stringify(imagePoses || {})}::jsonb,
        ${JSON.stringify(mergedPhysiological || {})}::jsonb,
        ${JSON.stringify(mergedPsychological || {})}::jsonb,
        ${JSON.stringify(emotional || {})}::jsonb,
        ${JSON.stringify(family || {})}::jsonb,
        ${JSON.stringify(sociocultural || {})}::jsonb,
        ${JSON.stringify(coreBeliefs || {})}::jsonb,
        ${JSON.stringify(educational || {})}::jsonb,
        ${JSON.stringify(sociopolitics || {})}::jsonb,
        ${JSON.stringify(swot || {})}::jsonb,
        ${traits || null}
      )
      RETURNING *
    `;

    const c = result[0];
    return NextResponse.json({
      id: c.id,
      name: c.name,
      role: c.role,
      age: c.age,
      castReference: c.cast_reference,
      imageUrl: c.image_url,
      imagePoses: c.image_poses || {},
      physiological: c.physiological || {},
      psychological: c.psychological || {},
      emotional: c.emotional || {},
      family: c.family || {},
      sociocultural: c.sociocultural || {},
      coreBeliefs: c.core_beliefs || {},
      educational: c.educational || {},
      sociopolitics: c.sociopolitics || {},
      swot: c.swot_analysis || {},
      traits: c.traits
    });
  } catch (error) {
    console.error("Create character error:", error);
    return NextResponse.json(
      { error: "Failed to create character" },
      { status: 500 }
    );
  }
}
