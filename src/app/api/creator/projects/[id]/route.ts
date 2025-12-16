import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Get project detail with all related data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get project
    const projects = await sql`
      SELECT * FROM projects WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (projects.length === 0) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const project = projects[0];

    // Get characters
    const characters = await sql`
      SELECT * FROM characters WHERE project_id = ${id} ORDER BY created_at
    `;

    // Get story
    const stories = await sql`
      SELECT * FROM stories WHERE project_id = ${id} LIMIT 1
    `;

    // Get universe
    const universes = await sql`
      SELECT * FROM universes WHERE project_id = ${id} LIMIT 1
    `;

    // Get moodboards
    const moodboards = await sql`
      SELECT * FROM moodboards WHERE project_id = ${id} ORDER BY beat_order
    `;

    // Get animations
    const animations = await sql`
      SELECT * FROM animations WHERE project_id = ${id} ORDER BY scene_order
    `;

    // Transform data
    const transformedCharacters = characters.map((c: any) => ({
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
    }));

    const story = stories.length > 0 ? {
      premise: stories[0].premise,
      synopsis: stories[0].synopsis,
      globalSynopsis: stories[0].global_synopsis,
      genre: stories[0].genre,
      subGenre: stories[0].sub_genre,
      format: stories[0].format,
      duration: stories[0].duration,
      tone: stories[0].tone,
      theme: stories[0].theme,
      conflict: stories[0].conflict_type,
      targetAudience: stories[0].target_audience,
      structure: stories[0].structure || "hero",
      structureBeats: stories[0].structure_beats || {},
      keyActions: stories[0].key_actions || {},
      wantNeedMatrix: stories[0].want_need_matrix || {
        want: { external: "", known: "", specific: "", achieved: "" },
        need: { internal: "", unknown: "", universal: "", achieved: "" }
      },
      endingType: stories[0].ending_type,
      generatedScript: stories[0].generated_script
    } : null;

    const universe = universes.length > 0 ? {
      name: universes[0].name,
      period: universes[0].period,
      era: universes[0].era,
      location: universes[0].location,
      worldType: universes[0].world_type,
      technologyLevel: universes[0].technology_level,
      magicSystem: universes[0].magic_system,
      environment: universes[0].environment,
      society: universes[0].society,
      privateLife: universes[0].private_life,
      government: universes[0].government,
      economy: universes[0].economy,
      culture: universes[0].culture
    } : null;

    // Build moodboard data
    const moodboardPrompts: Record<string, string> = {};
    const moodboardImages: Record<string, string> = {};
    moodboards.forEach((m: any) => {
      if (m.beat_name) {
        moodboardPrompts[m.beat_name] = m.prompt || "";
        moodboardImages[m.beat_name] = m.image_url || "";
      }
    });

    // Build animation data
    const animationPrompts: Record<string, string> = {};
    const animationPreviews: Record<string, string> = {};
    animations.forEach((a: any) => {
      if (a.scene_name) {
        animationPrompts[a.scene_name] = a.prompt || "";
        animationPreviews[a.scene_name] = a.preview_url || "";
      }
    });

    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      studioName: project.studio_name,
      logoUrl: project.logo_url,
      thumbnailUrl: project.thumbnail_url,
      ipOwner: project.ip_owner,
      productionDate: project.production_date,
      brandColors: project.brand_colors || ["#9B87F5", "#33C3F0", "#F2C94C", "#F2994A", "#8B7355"],
      brandLogos: project.brand_logos || ["", "", ""],
      team: project.team || {},
      genre: project.genre,
      subGenre: project.sub_genre,
      status: project.status,
      isPublic: project.is_public,
      characters: transformedCharacters,
      story,
      universe,
      moodboardPrompts,
      moodboardImages,
      animationPrompts,
      animationPreviews,
      createdAt: project.created_at,
      updatedAt: project.updated_at
    });
  } catch (error) {
    console.error("Get project detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

// PATCH - Update project
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log("PATCH project:", id);
    console.log("Body received:", JSON.stringify(body, null, 2).substring(0, 2000));

    const {
      title, description, studioName, logoUrl, thumbnailUrl,
      ipOwner, productionDate, brandColors, brandLogos, team,
      genre, subGenre, status, isPublic,
      story, universe, moodboardPrompts, moodboardImages,
      animationPrompts, animationPreviews
    } = body;

    // Update project
    try {
      await sql`
        UPDATE projects SET
          title = COALESCE(${title}, title),
          description = COALESCE(${description}, description),
          studio_name = COALESCE(${studioName}, studio_name),
          logo_url = COALESCE(${logoUrl}, logo_url),
          thumbnail_url = COALESCE(${thumbnailUrl}, thumbnail_url),
          ip_owner = COALESCE(${ipOwner}, ip_owner),
          production_date = COALESCE(${productionDate ? new Date(productionDate) : null}, production_date),
          brand_colors = COALESCE(${brandColors ? JSON.stringify(brandColors) : null}::jsonb, brand_colors),
          brand_logos = COALESCE(${brandLogos ? JSON.stringify(brandLogos) : null}::jsonb, brand_logos),
          team = COALESCE(${team ? JSON.stringify(team) : null}::jsonb, team),
          genre = COALESCE(${genre}, genre),
          sub_genre = COALESCE(${subGenre}, sub_genre),
          status = COALESCE(${status}, status),
          is_public = COALESCE(${isPublic}, is_public),
          updated_at = NOW()
        WHERE id = ${id} AND deleted_at IS NULL
      `;
    } catch (e: any) {
      throw new Error("Project update failed: " + e.message);
    }

    // Update or create story
    if (story) {
      try {
        console.log("Saving story for project:", id);
        
        const existingStory = await sql`SELECT id FROM stories WHERE project_id = ${id}`;
        
        // Validate structure value (must be valid enum)
        const validStructures = ['hero', 'cat', 'harmon', 'custom'];
        const storyStructure = validStructures.includes(story.structure) ? story.structure : 'hero';
        
        // Validate format value (must be valid enum or null)
        const validFormats = ['feature', 'series', 'short_movie', 'short_video'];
        const storyFormat = validFormats.includes(story.format) ? story.format : null;
        
        if (existingStory.length > 0) {
          await sql`
            UPDATE stories SET
              premise = ${story.premise || null},
              synopsis = ${story.synopsis || null},
              global_synopsis = ${story.globalSynopsis || null},
              genre = ${story.genre || null},
              sub_genre = ${story.subGenre || null},
              format = ${storyFormat},
              duration = ${story.duration || null},
              tone = ${story.tone || null},
              theme = ${story.theme || null},
              conflict_type = ${story.conflict || null},
              target_audience = ${story.targetAudience || null},
              structure = ${storyStructure},
              structure_beats = ${JSON.stringify(story.structureBeats || {})}::jsonb,
              key_actions = ${JSON.stringify(story.keyActions || {})}::jsonb,
              want_need_matrix = ${JSON.stringify(story.wantNeedMatrix || {})}::jsonb,
              ending_type = ${story.endingType || null},
              generated_script = ${story.generatedScript || null},
              updated_at = NOW()
            WHERE project_id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO stories (project_id, premise, synopsis, global_synopsis, genre, sub_genre, format, duration, tone, theme, conflict_type, target_audience, structure, structure_beats, key_actions, want_need_matrix, ending_type, generated_script)
            VALUES (${id}, ${story.premise || null}, ${story.synopsis || null}, ${story.globalSynopsis || null}, ${story.genre || null}, ${story.subGenre || null}, ${storyFormat}, ${story.duration || null}, ${story.tone || null}, ${story.theme || null}, ${story.conflict || null}, ${story.targetAudience || null}, ${storyStructure}, ${JSON.stringify(story.structureBeats || {})}::jsonb, ${JSON.stringify(story.keyActions || {})}::jsonb, ${JSON.stringify(story.wantNeedMatrix || {})}::jsonb, ${story.endingType || null}, ${story.generatedScript || null})
          `;
        }
      } catch (e: any) {
        throw new Error("Story save failed: " + e.message);
      }
    }

    // Update or create universe
    if (universe) {
      const existingUniverse = await sql`SELECT id FROM universes WHERE project_id = ${id}`;
      
      if (existingUniverse.length > 0) {
        await sql`
          UPDATE universes SET
            name = ${universe.name},
            period = ${universe.period},
            era = ${universe.era},
            location = ${universe.location},
            world_type = ${universe.worldType},
            technology_level = ${universe.technologyLevel},
            magic_system = ${universe.magicSystem},
            environment = ${universe.environment},
            society = ${universe.society},
            private_life = ${universe.privateLife},
            government = ${universe.government},
            economy = ${universe.economy},
            culture = ${universe.culture},
            updated_at = NOW()
          WHERE project_id = ${id}
        `;
      } else {
        await sql`
          INSERT INTO universes (project_id, name, period, era, location, world_type, technology_level, magic_system, environment, society, private_life, government, economy, culture)
          VALUES (${id}, ${universe.name}, ${universe.period}, ${universe.era}, ${universe.location}, ${universe.worldType}, ${universe.technologyLevel}, ${universe.magicSystem}, ${universe.environment}, ${universe.society}, ${universe.privateLife}, ${universe.government}, ${universe.economy}, ${universe.culture})
        `;
      }
    }

    // Update moodboards
    if (moodboardPrompts || moodboardImages) {
      const beats = Object.keys({ ...moodboardPrompts, ...moodboardImages });
      for (let i = 0; i < beats.length; i++) {
        const beat = beats[i];
        const existing = await sql`SELECT id FROM moodboards WHERE project_id = ${id} AND beat_name = ${beat}`;
        
        if (existing.length > 0) {
          await sql`
            UPDATE moodboards SET
              prompt = ${moodboardPrompts?.[beat] || null},
              image_url = ${moodboardImages?.[beat] || null},
              updated_at = NOW()
            WHERE project_id = ${id} AND beat_name = ${beat}
          `;
        } else if (moodboardPrompts?.[beat] || moodboardImages?.[beat]) {
          await sql`
            INSERT INTO moodboards (project_id, beat_name, beat_order, prompt, image_url)
            VALUES (${id}, ${beat}, ${i}, ${moodboardPrompts?.[beat] || null}, ${moodboardImages?.[beat] || null})
          `;
        }
      }
    }

    // Update animations
    if (animationPrompts || animationPreviews) {
      const scenes = Object.keys({ ...animationPrompts, ...animationPreviews });
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const existing = await sql`SELECT id FROM animations WHERE project_id = ${id} AND scene_name = ${scene}`;
        
        if (existing.length > 0) {
          await sql`
            UPDATE animations SET
              prompt = ${animationPrompts?.[scene] || null},
              preview_url = ${animationPreviews?.[scene] || null},
              updated_at = NOW()
            WHERE project_id = ${id} AND scene_name = ${scene}
          `;
        } else if (animationPrompts?.[scene] || animationPreviews?.[scene]) {
          await sql`
            INSERT INTO animations (project_id, scene_name, scene_order, prompt, preview_url)
            VALUES (${id}, ${scene}, ${i}, ${animationPrompts?.[scene] || null}, ${animationPreviews?.[scene] || null})
          `;
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { error: "Failed to update project: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await sql`
      UPDATE projects SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
