import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/moodboard?storyVersionId=xxx
// POST /api/creator/projects/[id]/moodboard - Create new moodboard
// PATCH /api/creator/projects/[id]/moodboard - Update moodboard settings

interface MoodboardItem {
    id: string;
    beatKey: string;
    beatLabel: string;
    beatContent: string | null;
    beatIndex: number;
    keyActionIndex: number;
    keyActionDescription: string | null;
    charactersInvolved: string[];
    universeLevel: string | null;
    prompt: string | null;
    negativePrompt: string | null;
    imageUrl: string | null;
    videoPrompt: string | null;
    videoUrl: string | null;
    status: string;
}

interface Moodboard {
    id: string;
    projectId: string;
    storyVersionId: string;
    artStyle: string;
    keyActionCount: number;
    items: MoodboardItem[];
    createdAt: string;
    updatedAt: string;
}

// GET - Fetch moodboard for a story version
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const storyVersionId = searchParams.get("storyVersionId");

        if (!storyVersionId) {
            return NextResponse.json(
                { error: "storyVersionId is required" },
                { status: 400 }
            );
        }

        // Get moodboard for this story version
        const moodboards = await sql`
      SELECT * FROM moodboards
      WHERE project_id = ${projectId}
        AND story_version_id = ${storyVersionId}
        AND deleted_at IS NULL
      LIMIT 1
    `;

        if (moodboards.length === 0) {
            // No moodboard exists yet, return null (frontend can create one)
            return NextResponse.json({ moodboard: null });
        }

        const moodboard = moodboards[0];

        // Get all items for this moodboard
        const items = await sql`
      SELECT * FROM moodboard_items
      WHERE moodboard_id = ${moodboard.id}
      ORDER BY beat_index ASC, key_action_index ASC
    `;

        // Map to response format
        const response: Moodboard = {
            id: moodboard.id,
            projectId: moodboard.project_id,
            storyVersionId: moodboard.story_version_id,
            artStyle: moodboard.art_style,
            keyActionCount: moodboard.key_action_count,
            items: items.map((item) => ({
                id: item.id,
                beatKey: item.beat_key,
                beatLabel: item.beat_label,
                beatContent: item.beat_content,
                beatIndex: item.beat_index,
                keyActionIndex: item.key_action_index,
                keyActionDescription: item.key_action_description,
                charactersInvolved: item.characters_involved || [],
                universeLevel: item.universe_level,
                prompt: item.prompt,
                negativePrompt: item.negative_prompt,
                imageUrl: item.image_url,
                videoPrompt: item.video_prompt,
                videoUrl: item.video_url,
                status: item.status,
            })),
            createdAt: moodboard.created_at,
            updatedAt: moodboard.updated_at,
        };

        return NextResponse.json({ moodboard: response });
    } catch (error) {
        console.error("Error fetching moodboard:", error);
        return NextResponse.json(
            { error: "Failed to fetch moodboard" },
            { status: 500 }
        );
    }
}

// POST - Create new moodboard for a story version
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const body = await request.json();

        const { storyVersionId, artStyle = "realistic", keyActionCount = 7 } = body;

        if (!storyVersionId) {
            return NextResponse.json(
                { error: "storyVersionId is required" },
                { status: 400 }
            );
        }

        // Check if moodboard already exists for this story version
        const existing = await sql`
      SELECT id FROM moodboards
      WHERE story_version_id = ${storyVersionId}
        AND deleted_at IS NULL
    `;

        if (existing.length > 0) {
            return NextResponse.json(
                { error: "Moodboard already exists for this story version" },
                { status: 409 }
            );
        }

        // Verify story version exists and belongs to this project
        const storyVersion = await sql`
      SELECT sv.*, p.id as proj_id
      FROM story_versions sv
      JOIN projects p ON p.id = sv.project_id
      WHERE sv.id = ${storyVersionId}
        AND sv.project_id = ${projectId}
        AND sv.deleted_at IS NULL
    `;

        if (storyVersion.length === 0) {
            return NextResponse.json(
                { error: "Story version not found" },
                { status: 404 }
            );
        }

        // Check prerequisites
        const project = await sql`
      SELECT universe FROM projects WHERE id = ${projectId}
    `;

        const hasUniverse = project[0]?.universe && Object.keys(project[0].universe).length > 0;
        const hasStoryBeats = storyVersion[0].structure && Object.keys(storyVersion[0].structure).length > 0;
        const hasCharacters = storyVersion[0].character_ids && storyVersion[0].character_ids.length > 0;

        if (!hasStoryBeats) {
            return NextResponse.json(
                {
                    error: "Story beats are required before creating a moodboard",
                    missingPrerequisites: { hasUniverse, hasStoryBeats, hasCharacters }
                },
                { status: 400 }
            );
        }

        // Create moodboard
        const newMoodboard = await sql`
      INSERT INTO moodboards (project_id, story_version_id, art_style, key_action_count)
      VALUES (${projectId}, ${storyVersionId}, ${artStyle}, ${keyActionCount})
      RETURNING *
    `;

        const moodboard = newMoodboard[0];

        // Initialize moodboard items from story beats
        const structure = storyVersion[0].structure;
        const structureType = storyVersion[0].structure_type || "harmon";

        // Get beat keys based on structure type
        const beatConfigs = getBeatConfigs(structureType);
        const items: any[] = [];

        let beatIndex = 1;
        for (const beatConfig of beatConfigs) {
            const beatContent = structure[beatConfig.key] || "";

            // Create key_action_count items per beat
            for (let actionIndex = 1; actionIndex <= keyActionCount; actionIndex++) {
                items.push({
                    moodboard_id: moodboard.id,
                    beat_key: beatConfig.key,
                    beat_label: beatConfig.label,
                    beat_content: beatContent,
                    beat_index: beatIndex,
                    key_action_index: actionIndex,
                    status: "empty",
                });
            }
            beatIndex++;
        }

        // Batch insert items
        if (items.length > 0) {
            for (const item of items) {
                await sql`
          INSERT INTO moodboard_items (
            moodboard_id, beat_key, beat_label, beat_content, 
            beat_index, key_action_index, status
          )
          VALUES (
            ${item.moodboard_id}, ${item.beat_key}, ${item.beat_label}, 
            ${item.beat_content}, ${item.beat_index}, ${item.key_action_index}, 
            ${item.status}
          )
        `;
            }
        }

        return NextResponse.json({
            moodboard: {
                id: moodboard.id,
                projectId: moodboard.project_id,
                storyVersionId: moodboard.story_version_id,
                artStyle: moodboard.art_style,
                keyActionCount: moodboard.key_action_count,
                itemCount: items.length,
                createdAt: moodboard.created_at,
            },
            message: `Moodboard created with ${items.length} items`,
        });
    } catch (error) {
        console.error("Error creating moodboard:", error);
        return NextResponse.json(
            { error: "Failed to create moodboard" },
            { status: 500 }
        );
    }
}

// PATCH - Update moodboard settings
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const body = await request.json();

        const { moodboardId, artStyle, keyActionCount } = body;

        if (!moodboardId) {
            return NextResponse.json(
                { error: "moodboardId is required" },
                { status: 400 }
            );
        }

        // Verify moodboard belongs to this project
        const existing = await sql`
      SELECT * FROM moodboards
      WHERE id = ${moodboardId}
        AND project_id = ${projectId}
        AND deleted_at IS NULL
    `;

        if (existing.length === 0) {
            return NextResponse.json(
                { error: "Moodboard not found" },
                { status: 404 }
            );
        }

        // Update moodboard settings
        const updateFields: string[] = [];
        const updates: any = {};

        if (artStyle !== undefined) {
            updates.art_style = artStyle;
        }

        if (keyActionCount !== undefined) {
            // Validate keyActionCount
            if (keyActionCount < 3 || keyActionCount > 10) {
                return NextResponse.json(
                    { error: "keyActionCount must be between 3 and 10" },
                    { status: 400 }
                );
            }
            updates.key_action_count = keyActionCount;

            // TODO: If keyActionCount changes, we may need to add/remove items
            // For now, just update the setting
        }

        const updated = await sql`
      UPDATE moodboards
      SET 
        art_style = COALESCE(${artStyle}, art_style),
        key_action_count = COALESCE(${keyActionCount}, key_action_count),
        updated_at = NOW()
      WHERE id = ${moodboardId}
      RETURNING *
    `;

        return NextResponse.json({
            moodboard: {
                id: updated[0].id,
                artStyle: updated[0].art_style,
                keyActionCount: updated[0].key_action_count,
                updatedAt: updated[0].updated_at,
            },
        });
    } catch (error) {
        console.error("Error updating moodboard:", error);
        return NextResponse.json(
            { error: "Failed to update moodboard" },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete moodboard
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const moodboardId = searchParams.get("moodboardId");

        if (!moodboardId) {
            return NextResponse.json(
                { error: "moodboardId is required" },
                { status: 400 }
            );
        }

        // Soft delete moodboard
        await sql`
      UPDATE moodboards
      SET deleted_at = NOW()
      WHERE id = ${moodboardId}
        AND project_id = ${projectId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting moodboard:", error);
        return NextResponse.json(
            { error: "Failed to delete moodboard" },
            { status: 500 }
        );
    }
}

// Helper function to get beat configurations based on structure type
function getBeatConfigs(structureType: string): { key: string; label: string }[] {
    const harmonBeats = [
        { key: "youZone", label: "You / Zone" },
        { key: "needDesire", label: "Need / Desire" },
        { key: "go", label: "Go" },
        { key: "searchAdapt", label: "Search / Adapt" },
        { key: "findTake", label: "Find / Take" },
        { key: "payPrice", label: "Pay the Price" },
        { key: "returnChange", label: "Return / Change" },
        { key: "newCapability", label: "New Capability" },
    ];

    const saveTheCatBeats = [
        { key: "openingImage", label: "Opening Image" },
        { key: "themeStated", label: "Theme Stated" },
        { key: "setup", label: "Setup" },
        { key: "catalyst", label: "Catalyst" },
        { key: "debate", label: "Debate" },
        { key: "breakIntoTwo", label: "Break Into Two" },
        { key: "bStory", label: "B Story" },
        { key: "funAndGames", label: "Fun and Games" },
        { key: "midpoint", label: "Midpoint" },
        { key: "badGuysCloseIn", label: "Bad Guys Close In" },
        { key: "allIsLost", label: "All Is Lost" },
        { key: "darkNightOfSoul", label: "Dark Night of Soul" },
        { key: "breakIntoThree", label: "Break Into Three" },
        { key: "finale", label: "Finale" },
        { key: "finalImage", label: "Final Image" },
    ];

    const heroJourneyBeats = [
        { key: "ordinaryWorld", label: "Ordinary World" },
        { key: "callToAdventure", label: "Call to Adventure" },
        { key: "refusalOfCall", label: "Refusal of Call" },
        { key: "meetingMentor", label: "Meeting the Mentor" },
        { key: "crossingThreshold", label: "Crossing the Threshold" },
        { key: "testsAlliesEnemies", label: "Tests, Allies, Enemies" },
        { key: "approachInmostCave", label: "Approach to Inmost Cave" },
        { key: "ordeal", label: "Ordeal" },
        { key: "reward", label: "Reward" },
        { key: "roadBack", label: "Road Back" },
        { key: "resurrection", label: "Resurrection" },
        { key: "returnWithElixir", label: "Return with Elixir" },
    ];

    switch (structureType) {
        case "savethecat":
        case "save_the_cat":
            return saveTheCatBeats;
        case "herosjourney":
        case "heros_journey":
            return heroJourneyBeats;
        case "harmon":
        default:
            return harmonBeats;
    }
}
