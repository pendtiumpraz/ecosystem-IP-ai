import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get single character
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { charId } = await params;

    const characters = await sql`
      SELECT * FROM characters WHERE id = ${charId}
    `;

    if (characters.length === 0) {
      return NextResponse.json(
        { error: "Character not found" },
        { status: 404 }
      );
    }

    const c = characters[0];
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
    console.error("Get character error:", error);
    return NextResponse.json(
      { error: "Failed to fetch character" },
      { status: 500 }
    );
  }
}

// PUT - Update character
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { id: projectId, charId } = await params;
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

    await sql`
      UPDATE characters SET
        name = ${name},
        role = ${role || 'supporting'},
        age = ${age || null},
        cast_reference = ${castReference || null},
        image_url = ${imageUrl || null},
        image_poses = ${JSON.stringify(imagePoses || {})}::jsonb,
        physiological = ${JSON.stringify(mergedPhysiological || {})}::jsonb,
        psychological = ${JSON.stringify(mergedPsychological || {})}::jsonb,
        emotional = ${JSON.stringify(emotional || {})}::jsonb,
        family = ${JSON.stringify(family || {})}::jsonb,
        sociocultural = ${JSON.stringify(sociocultural || {})}::jsonb,
        core_beliefs = ${JSON.stringify(coreBeliefs || {})}::jsonb,
        educational = ${JSON.stringify(educational || {})}::jsonb,
        sociopolitics = ${JSON.stringify(sociopolitics || {})}::jsonb,
        swot_analysis = ${JSON.stringify(swot || {})}::jsonb,
        traits = ${traits || null},
        updated_at = NOW()
      WHERE id = ${charId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update character error:", error);
    return NextResponse.json(
      { error: "Failed to update character" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete character
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { id: projectId, charId } = await params;

    // Check if character is linked to any story
    const linkedStories = await sql`
      SELECT id, version_name FROM story_versions 
      WHERE project_id = ${projectId} 
      AND deleted_at IS NULL
      AND character_ids @> ARRAY[${charId}]::uuid[]
    `;

    if (linkedStories.length > 0) {
      const storyNames = linkedStories.map((s: any) => s.version_name).join(', ');
      return NextResponse.json(
        { error: `Character is linked to stories: ${storyNames}. Remove from story first.` },
        { status: 400 }
      );
    }

    await sql`
      UPDATE characters 
      SET deleted_at = NOW()
      WHERE id = ${charId} AND project_id = ${projectId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete character error:", error);
    return NextResponse.json(
      { error: "Failed to delete character" },
      { status: 500 }
    );
  }
}

// PATCH - Restore deleted character
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; charId: string }> }
) {
  try {
    const { id: projectId, charId } = await params;
    const body = await request.json();

    if (body.restore) {
      await sql`
        UPDATE characters 
        SET deleted_at = NULL
        WHERE id = ${charId} AND project_id = ${projectId}
      `;
      return NextResponse.json({ success: true, restored: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Patch character error:", error);
    return NextResponse.json(
      { error: "Failed to patch character" },
      { status: 500 }
    );
  }
}
