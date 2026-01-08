import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// PATCH /api/creator/projects/[id]/moodboard/items/[itemId]
// Update a specific moodboard item (prompt, image, etc.)

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, itemId } = await params;
        const body = await request.json();

        const {
            keyActionDescription,
            charactersInvolved,
            universeLevel,
            prompt,
            negativePrompt,
            imageUrl,
            videoPrompt,
            videoUrl,
        } = body;

        // Verify item exists and belongs to a moodboard in this project
        const existingItem = await sql`
      SELECT mi.*, m.project_id
      FROM moodboard_items mi
      JOIN moodboards m ON m.id = mi.moodboard_id
      WHERE mi.id = ${itemId}
        AND m.project_id = ${projectId}
        AND m.deleted_at IS NULL
    `;

        if (existingItem.length === 0) {
            return NextResponse.json(
                { error: "Moodboard item not found" },
                { status: 404 }
            );
        }

        const item = existingItem[0];

        // Determine new status based on what's being updated
        let newStatus = item.status;
        if (videoUrl !== undefined && videoUrl) {
            newStatus = "has_video";
        } else if (imageUrl !== undefined && imageUrl) {
            newStatus = "has_image";
        } else if (prompt !== undefined && prompt) {
            newStatus = "has_prompt";
        } else if (keyActionDescription !== undefined && keyActionDescription) {
            newStatus = "has_description";
        }

        // If image is being updated, save previous for undo
        let previousImageUrl = item.previous_image_url;
        let editCount = item.edit_count || 0;
        if (imageUrl !== undefined && imageUrl !== item.image_url && item.image_url) {
            previousImageUrl = item.image_url;
            editCount++;
        }

        // Update the item
        const updated = await sql`
      UPDATE moodboard_items
      SET 
        key_action_description = COALESCE(${keyActionDescription}, key_action_description),
        characters_involved = COALESCE(${charactersInvolved}, characters_involved),
        universe_level = COALESCE(${universeLevel}, universe_level),
        prompt = COALESCE(${prompt}, prompt),
        negative_prompt = COALESCE(${negativePrompt}, negative_prompt),
        image_url = COALESCE(${imageUrl}, image_url),
        video_prompt = COALESCE(${videoPrompt}, video_prompt),
        video_url = COALESCE(${videoUrl}, video_url),
        previous_image_url = ${previousImageUrl},
        edit_count = ${editCount},
        status = ${newStatus},
        updated_at = NOW()
      WHERE id = ${itemId}
      RETURNING *
    `;

        return NextResponse.json({
            item: {
                id: updated[0].id,
                beatKey: updated[0].beat_key,
                beatLabel: updated[0].beat_label,
                keyActionIndex: updated[0].key_action_index,
                keyActionDescription: updated[0].key_action_description,
                charactersInvolved: updated[0].characters_involved,
                universeLevel: updated[0].universe_level,
                prompt: updated[0].prompt,
                negativePrompt: updated[0].negative_prompt,
                imageUrl: updated[0].image_url,
                videoPrompt: updated[0].video_prompt,
                videoUrl: updated[0].video_url,
                previousImageUrl: updated[0].previous_image_url,
                editCount: updated[0].edit_count,
                status: updated[0].status,
                updatedAt: updated[0].updated_at,
            },
        });
    } catch (error) {
        console.error("Error updating moodboard item:", error);
        return NextResponse.json(
            { error: "Failed to update moodboard item" },
            { status: 500 }
        );
    }
}

// GET /api/creator/projects/[id]/moodboard/items/[itemId]
// Get a specific moodboard item
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, itemId } = await params;

        const items = await sql`
      SELECT mi.*, m.art_style
      FROM moodboard_items mi
      JOIN moodboards m ON m.id = mi.moodboard_id
      WHERE mi.id = ${itemId}
        AND m.project_id = ${projectId}
        AND m.deleted_at IS NULL
    `;

        if (items.length === 0) {
            return NextResponse.json(
                { error: "Moodboard item not found" },
                { status: 404 }
            );
        }

        const item = items[0];

        return NextResponse.json({
            item: {
                id: item.id,
                moodboardId: item.moodboard_id,
                beatKey: item.beat_key,
                beatLabel: item.beat_label,
                beatContent: item.beat_content,
                beatIndex: item.beat_index,
                keyActionIndex: item.key_action_index,
                keyActionDescription: item.key_action_description,
                charactersInvolved: item.characters_involved,
                universeLevel: item.universe_level,
                prompt: item.prompt,
                negativePrompt: item.negative_prompt,
                imageUrl: item.image_url,
                videoPrompt: item.video_prompt,
                videoUrl: item.video_url,
                previousImageUrl: item.previous_image_url,
                editCount: item.edit_count,
                status: item.status,
                artStyle: item.art_style,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            },
        });
    } catch (error) {
        console.error("Error fetching moodboard item:", error);
        return NextResponse.json(
            { error: "Failed to fetch moodboard item" },
            { status: 500 }
        );
    }
}

// DELETE - Revert to previous image (undo)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; itemId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, itemId } = await params;
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");

        if (action === "revert") {
            // Revert to previous image
            const items = await sql`
        SELECT mi.*, m.project_id
        FROM moodboard_items mi
        JOIN moodboards m ON m.id = mi.moodboard_id
        WHERE mi.id = ${itemId}
          AND m.project_id = ${projectId}
      `;

            if (items.length === 0 || !items[0].previous_image_url) {
                return NextResponse.json(
                    { error: "No previous image to revert to" },
                    { status: 400 }
                );
            }

            await sql`
        UPDATE moodboard_items
        SET 
          image_url = previous_image_url,
          previous_image_url = NULL,
          updated_at = NOW()
        WHERE id = ${itemId}
      `;

            return NextResponse.json({ success: true, message: "Reverted to previous image" });
        } else if (action === "clear_image") {
            // Clear image only
            await sql`
        UPDATE moodboard_items
        SET 
          image_url = NULL,
          status = CASE 
            WHEN prompt IS NOT NULL THEN 'has_prompt'
            WHEN key_action_description IS NOT NULL THEN 'has_description'
            ELSE 'empty'
          END,
          updated_at = NOW()
        WHERE id = ${itemId}
      `;

            return NextResponse.json({ success: true, message: "Image cleared" });
        } else if (action === "clear_all") {
            // Clear all generated content for this item
            await sql`
        UPDATE moodboard_items
        SET 
          key_action_description = NULL,
          characters_involved = NULL,
          universe_level = NULL,
          prompt = NULL,
          negative_prompt = NULL,
          image_url = NULL,
          video_prompt = NULL,
          video_url = NULL,
          previous_image_url = NULL,
          edit_count = 0,
          status = 'empty',
          updated_at = NOW()
        WHERE id = ${itemId}
      `;

            return NextResponse.json({ success: true, message: "All content cleared" });
        }

        return NextResponse.json(
            { error: "Invalid action. Use ?action=revert|clear_image|clear_all" },
            { status: 400 }
        );
    } catch (error) {
        console.error("Error processing moodboard item action:", error);
        return NextResponse.json(
            { error: "Failed to process action" },
            { status: 500 }
        );
    }
}
