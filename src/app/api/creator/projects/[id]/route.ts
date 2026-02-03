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

    // Get moodboards (V2 uses separate API, this is for legacy data)
    let moodboards: any[] = [];
    try {
      // Try legacy moodboards query first
      moodboards = await sql`
        SELECT * FROM moodboards WHERE project_id = ${id} ORDER BY created_at
      `;
    } catch (e) {
      // If table doesn't have expected columns, return empty
      console.log("Legacy moodboards query failed, using empty array");
      moodboards = [];
    }

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

    // Parse structure beats - all 3 saved separately
    const structureBeats = stories[0]?.structure_beats || {};
    const keyActions = stories[0]?.key_actions || {};

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
      // All 3 structures saved separately
      heroBeats: structureBeats.hero || structureBeats,
      catBeats: structureBeats.cat || {},
      harmonBeats: structureBeats.harmon || {},
      heroKeyActions: keyActions.hero || keyActions,
      catKeyActions: keyActions.cat || {},
      harmonKeyActions: keyActions.harmon || {},
      // Arc View tension levels
      tensionLevels: stories[0].tension_levels || {},
      wantNeedMatrix: stories[0].want_need_matrix || {
        want: { external: "", known: "", specific: "", achieved: "" },
        need: { internal: "", unknown: "", universal: "", achieved: "" }
      },
      endingType: stories[0].ending_type,
      generatedScript: stories[0].generated_script,
      characterRelations: stories[0].character_relations || []
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
      // New IP Project fields
      mediumType: project.medium_type,
      duration: project.duration,
      customDuration: project.custom_duration,
      targetScenes: project.target_scenes,
      episodeCount: project.episode_count,
      mainGenre: project.main_genre,
      theme: project.theme,
      tone: project.tone,
      coreConflict: project.core_conflict,
      storyStructure: project.story_structure,
      // Get protagonist name from characters (not stored in projects table)
      protagonistName: transformedCharacters.find((c: any) => c.role?.toLowerCase() === 'protagonist')?.name || null,
      // Existing data
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
      // New IP Project fields
      mediumType, duration, customDuration, targetScenes, episodeCount,
      mainGenre, theme, tone, coreConflict, storyStructure, protagonistName,
      story, universe, moodboardPrompts, moodboardImages,
      animationPrompts, animationPreviews
    } = body;

    // Check if episodeCount or storyStructure is being changed after already set (locked fields)
    const existingProject = await sql`
      SELECT episode_count, story_structure FROM projects WHERE id = ${id} AND deleted_at IS NULL
    `;

    if (existingProject.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const currentProject = existingProject[0];
    const currentEpisodeCount = currentProject.episode_count;
    const currentStoryStructure = currentProject.story_structure;

    // Prevent changing locked fields
    if (currentEpisodeCount && episodeCount && episodeCount !== currentEpisodeCount) {
      return NextResponse.json(
        { error: "Episode count is locked and cannot be changed after initial selection" },
        { status: 400 }
      );
    }

    if (currentStoryStructure && storyStructure && storyStructure !== currentStoryStructure) {
      return NextResponse.json(
        { error: "Story structure is locked and cannot be changed after initial selection" },
        { status: 400 }
      );
    }

    // Determine if we need to create story versions (first time setting episodeCount)
    const isSettingEpisodeCountFirstTime = !currentEpisodeCount && episodeCount && episodeCount > 0;

    // Get story structure from: request > project > existing story version
    let finalStoryStructure = storyStructure || currentStoryStructure;
    if (!finalStoryStructure) {
      const existingVersionWithStructure = await sql`
        SELECT structure FROM story_versions 
        WHERE project_id = ${id} AND deleted_at IS NULL AND structure IS NOT NULL
        LIMIT 1
      `;
      if (existingVersionWithStructure.length > 0) {
        finalStoryStructure = existingVersionWithStructure[0].structure;
      }
    }

    // If setting episode count for first time, validate all required fields
    if (isSettingEpisodeCountFirstTime) {
      // Require story structure - check project OR existing story versions
      let hasStoryStructure = !!finalStoryStructure;

      // Also check if there's an existing story version with structure
      if (!hasStoryStructure) {
        const existingStoryVersion = await sql`
          SELECT structure FROM story_versions 
          WHERE project_id = ${id} AND deleted_at IS NULL AND structure IS NOT NULL
          LIMIT 1
        `;
        hasStoryStructure = existingStoryVersion.length > 0 && !!existingStoryVersion[0].structure;
      }

      if (!hasStoryStructure) {
        return NextResponse.json(
          { error: "Story structure must be selected before setting episode count" },
          { status: 400 }
        );
      }

      // Check current values or new values for genre fields
      const currentGenreFields = await sql`
        SELECT main_genre, theme, tone, core_conflict FROM projects WHERE id = ${id}
      `;
      const current = currentGenreFields[0] || {};

      const finalMainGenre = mainGenre || current.main_genre;
      const finalTheme = theme || current.theme;
      const finalTone = tone || current.tone;
      const finalCoreConflict = coreConflict || current.core_conflict;

      const missingFields = [];
      if (!finalMainGenre) missingFields.push("Main Genre");
      if (!finalTheme) missingFields.push("Theme");
      if (!finalTone) missingFields.push("Tone");
      if (!finalCoreConflict) missingFields.push("Core Conflict");

      if (missingFields.length > 0) {
        return NextResponse.json(
          { error: `Please fill in: ${missingFields.join(", ")} before setting episode count` },
          { status: 400 }
        );
      }
    }

    // Check for existing protagonist if protagonistName not provided
    let finalProtagonistName = protagonistName;
    if (isSettingEpisodeCountFirstTime && !protagonistName) {
      // Check if there's an existing protagonist character
      const existingProtag = await sql`
        SELECT name FROM characters 
        WHERE project_id = ${id} AND role = 'Protagonist' AND deleted_at IS NULL
        LIMIT 1
      `;
      if (existingProtag.length > 0) {
        finalProtagonistName = existingProtag[0].name;
        console.log(`Using existing protagonist character: ${finalProtagonistName}`);
      } else {
        return NextResponse.json(
          { error: "Protagonist name must be set before setting episode count. Create a Protagonist character first or set the name in IP Project." },
          { status: 400 }
        );
      }
    }

    // Update project - basic fields + new IP project fields
    try {
      await sql`
        UPDATE projects SET
          title = ${title || null},
          description = ${description || null},
          studio_name = ${studioName || null},
          logo_url = ${logoUrl || null},
          ip_owner = ${ipOwner || null},
          genre = ${genre || null},
          medium_type = COALESCE(${mediumType || null}, medium_type),
          duration = COALESCE(${duration || null}, duration),
          custom_duration = COALESCE(${customDuration || null}, custom_duration),
          target_scenes = COALESCE(${targetScenes || null}, target_scenes),
          episode_count = COALESCE(${episodeCount || null}, episode_count),
          main_genre = COALESCE(${mainGenre || null}, main_genre),
          sub_genre = COALESCE(${subGenre || null}, sub_genre),
          theme = COALESCE(${theme || null}, theme),
          tone = COALESCE(${tone || null}, tone),
          core_conflict = COALESCE(${coreConflict || null}, core_conflict),
          story_structure = COALESCE(${storyStructure || null}, story_structure),
          updated_at = NOW()
        WHERE id = ${id} AND deleted_at IS NULL
      `;
    } catch (e: any) {
      throw new Error("Project update failed: " + e.message);
    }

    // Get final episode count (from request or existing)
    const finalEpisodeCount = episodeCount || currentEpisodeCount;

    // Sync story versions to match episode count (create missing ones)
    if (finalEpisodeCount && finalEpisodeCount > 0) {
      try {
        // First, ensure a story record exists for this project
        const existingStory = await sql`SELECT id FROM stories WHERE project_id = ${id}`;
        let storyId: string;

        if (existingStory.length === 0) {
          // Create story record
          const newStory = await sql`
            INSERT INTO stories (project_id, structure) 
            VALUES (${id}, ${finalStoryStructure})
            RETURNING id
          `;
          storyId = newStory[0].id;
        } else {
          storyId = existingStory[0].id;
          // Update story structure
          await sql`UPDATE stories SET structure = ${finalStoryStructure} WHERE id = ${storyId}`;
        }

        // Auto-create protagonist character
        let protagonistId: string | null = null;
        if (finalProtagonistName) {
          const existingProtagonist = await sql`
            SELECT id FROM characters 
            WHERE project_id = ${id} AND role = 'Protagonist' AND deleted_at IS NULL
            LIMIT 1
          `;

          if (existingProtagonist.length === 0) {
            // Create new protagonist character
            const newCharacter = await sql`
              INSERT INTO characters (project_id, name, role)
              VALUES (${id}, ${finalProtagonistName}, 'Protagonist')
              RETURNING id
            `;
            protagonistId = newCharacter[0].id;
            console.log(`Created protagonist character: ${finalProtagonistName} (${protagonistId})`);
          } else {
            protagonistId = existingProtagonist[0].id;
            // Update name only if protagonistName was explicitly provided (not from existing character)
            if (protagonistName) {
              await sql`
                UPDATE characters SET name = ${protagonistName}, updated_at = NOW()
                WHERE id = ${protagonistId}
              `;
              console.log(`Updated existing protagonist: ${protagonistName} (${protagonistId})`);
            } else {
              console.log(`Using existing protagonist: ${existingProtagonist[0].id}`);
            }
          }
        }

        // Check existing story versions
        const existingVersions = await sql`
          SELECT version_number FROM story_versions 
          WHERE project_id = ${id} AND deleted_at IS NULL 
          ORDER BY version_number
        `;
        const existingCount = existingVersions.length;

        console.log(`Project ${id}: Found ${existingCount} existing story versions, target: ${finalEpisodeCount}`);

        // Only create versions that don't exist yet (delta)
        if (existingCount < finalEpisodeCount) {
          const versionsToCreate = finalEpisodeCount - existingCount;
          console.log(`Creating ${versionsToCreate} new story versions...`);

          // Prepare character IDs array for linking
          const characterIds = protagonistId ? [protagonistId] : [];

          for (let i = existingCount + 1; i <= finalEpisodeCount; i++) {
            const versionName = `Episode ${i}`;
            const isActive = existingCount === 0 && i === 1; // First episode is active only if no existing versions

            await sql`
              INSERT INTO story_versions (
                story_id, project_id, version_number, version_name, is_active,
                structure, structure_type, episode_number,
                cat_beats, hero_beats, harmon_beats, tension_levels, want_need_matrix, beat_characters,
                character_ids
              ) VALUES (
                ${storyId}, ${id}, ${i}, ${versionName}, ${isActive},
                ${finalStoryStructure}, ${finalStoryStructure}, ${i},
                '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
                ${characterIds.length > 0 ? sql`ARRAY[${characterIds[0]}]::uuid[]` : sql`'{}'::uuid[]`}
              )
            `;
          }

          console.log(`Created ${versionsToCreate} new story versions for project ${id} (total: ${episodeCount})`);
        } else {
          console.log(`Project ${id}: All ${episodeCount} story versions already exist`);
        }

        // Link protagonist to existing story versions that don't have characters
        if (protagonistId) {
          await sql`
            UPDATE story_versions 
            SET character_ids = ARRAY[${protagonistId}]::uuid[]
            WHERE project_id = ${id} 
              AND deleted_at IS NULL 
              AND (character_ids IS NULL OR character_ids = '{}')
          `;
          console.log(`Linked protagonist to story versions in project ${id}`);
        }
      } catch (e: any) {
        console.error("Error creating story versions:", e.message);
        // Don't fail the whole request, just log the error
      }
    }

    // Update or create story - FULL UPDATE including structure beats
    if (story) {
      try {
        const existingStory = await sql`SELECT id FROM stories WHERE project_id = ${id}`;

        // Prepare JSONB fields - save ALL 3 structures
        const allBeats = {
          hero: story.heroBeats || {},
          cat: story.catBeats || {},
          harmon: story.harmonBeats || {}
        };
        const allKeyActions = {
          hero: story.heroKeyActions || {},
          cat: story.catKeyActions || {},
          harmon: story.harmonKeyActions || {}
        };
        const structureBeatsJson = JSON.stringify(allBeats);
        const keyActionsJson = JSON.stringify(allKeyActions);
        const wantNeedMatrixJson = story.wantNeedMatrix ? JSON.stringify(story.wantNeedMatrix) : null;
        const tensionLevelsJson = story.tensionLevels ? JSON.stringify(story.tensionLevels) : '{}';
        const characterRelationsJson = story.characterRelations ? JSON.stringify(story.characterRelations) : '[]';

        console.log("Saving story - structure:", story.structure);
        console.log("Saving story - heroBeats:", Object.keys(story.heroBeats || {}));
        console.log("Saving story - catBeats:", Object.keys(story.catBeats || {}));
        console.log("Saving story - harmonBeats:", Object.keys(story.harmonBeats || {}));
        console.log("Saving story - format:", story.format);

        if (existingStory.length > 0) {
          // Full update including structure, structureBeats, keyActions, wantNeedMatrix, tensionLevels, FORMAT
          await sql`
            UPDATE stories SET
              premise = ${story.premise || null},
              synopsis = ${story.synopsis || null},
              global_synopsis = ${story.globalSynopsis || null},
              genre = ${story.genre || null},
              sub_genre = ${story.subGenre || null},
              format = ${story.format || null},
              duration = ${story.duration || null},
              tone = ${story.tone || null},
              theme = ${story.theme || null},
              conflict_type = ${story.conflict || null},
              target_audience = ${story.targetAudience || null},
              ending_type = ${story.endingType || null},
              structure = ${story.structure || 'hero'},
              structure_beats = ${structureBeatsJson}::jsonb,
              key_actions = ${keyActionsJson}::jsonb,
              want_need_matrix = ${wantNeedMatrixJson}::jsonb,
              tension_levels = ${tensionLevelsJson}::jsonb,
              character_relations = ${characterRelationsJson}::jsonb,
              updated_at = NOW()
            WHERE project_id = ${id}
          `;

          console.log("Story saved with format:", story.format);
        } else {
          // Insert with all fields including FORMAT and tension_levels
          await sql`
            INSERT INTO stories (
              project_id, premise, synopsis, global_synopsis, genre, sub_genre, format,
              duration, tone, theme, conflict_type, target_audience, ending_type,
              structure, structure_beats, key_actions, want_need_matrix, tension_levels, character_relations
            )
            VALUES (
              ${id}, ${story.premise || null}, ${story.synopsis || null}, ${story.globalSynopsis || null}, 
              ${story.genre || null}, ${story.subGenre || null}, ${story.format || null}, ${story.duration || null}, 
              ${story.tone || null}, ${story.theme || null}, ${story.conflict || null}, 
              ${story.targetAudience || null}, ${story.endingType || null},
              ${story.structure || 'hero'}, ${structureBeatsJson}::jsonb, ${keyActionsJson}::jsonb, ${wantNeedMatrixJson}::jsonb, ${tensionLevelsJson}::jsonb, ${characterRelationsJson}::jsonb
            )
          `;

          console.log("Story inserted with format:", story.format);
        }

        console.log("Story saved successfully!");
      } catch (e: any) {
        console.error("Story save error:", e.message);
        throw new Error("Story save failed: " + e.message);
      }
    }

    // Update or create universe - simplified
    if (universe && universe.name) {
      try {
        const existingUniverse = await sql`SELECT id FROM universes WHERE project_id = ${id}`;

        if (existingUniverse.length > 0) {
          await sql`
            UPDATE universes SET
              name = ${universe.name || null},
              period = ${universe.period || null},
              era = ${universe.era || null},
              location = ${universe.location || null},
              world_type = ${universe.worldType || null},
              technology_level = ${universe.technologyLevel || null},
              magic_system = ${universe.magicSystem || null},
              environment = ${universe.environment || null},
              society = ${universe.society || null},
              government = ${universe.government || null},
              economy = ${universe.economy || null},
              culture = ${universe.culture || null},
              private_life = ${universe.privateLife || null},
              updated_at = NOW()
            WHERE project_id = ${id}
          `;
        } else {
          await sql`
            INSERT INTO universes (
              project_id, name, period, era, location, world_type, technology_level, 
              magic_system, environment, society, government, economy, culture, private_life
            )
            VALUES (
              ${id}, ${universe.name || null}, ${universe.period || null}, ${universe.era || null}, 
              ${universe.location || null}, ${universe.worldType || null}, ${universe.technologyLevel || null}, 
              ${universe.magicSystem || null}, ${universe.environment || null}, ${universe.society || null}, 
              ${universe.government || null}, ${universe.economy || null}, ${universe.culture || null}, 
              ${universe.privateLife || null}
            )
          `;
        }
      } catch (e: any) {
        throw new Error("Universe save failed: " + e.message);
      }
    }

    // Update moodboards (legacy - moodboard V2 uses separate API)
    if (moodboardPrompts || moodboardImages) {
      try {
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
      } catch (e: any) {
        // Legacy moodboards table might not exist - moodboard V2 uses different API
        console.log("Legacy moodboards save skipped:", e.message);
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
