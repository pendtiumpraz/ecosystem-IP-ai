/**
 * API: /api/moodboard-item-versions
 * 
 * GET - Fetch all versions for a moodboard item
 * POST - Create new version (for uploads)
 * PATCH - Set active version
 * DELETE - Soft delete version
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - Fetch versions for a moodboard item
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const moodboardId = searchParams.get("moodboardId");
        const itemId = searchParams.get("itemId");
        const includeDeleted = searchParams.get("includeDeleted") === "true";

        if (!moodboardId || !itemId) {
            return NextResponse.json(
                { error: "moodboardId and itemId are required" },
                { status: 400 }
            );
        }

        let versions;
        if (includeDeleted) {
            versions = await sql`
                SELECT 
                    id,
                    version_number,
                    is_active,
                    image_url,
                    thumbnail_url,
                    drive_file_id,
                    prompt_used,
                    model_used,
                    art_style,
                    aspect_ratio,
                    credit_cost,
                    source_type,
                    created_at,
                    deleted_at
                FROM moodboard_item_image_versions
                WHERE moodboard_id = ${moodboardId}
                    AND moodboard_item_id = ${itemId}
                ORDER BY version_number DESC
            `;
        } else {
            versions = await sql`
                SELECT 
                    id,
                    version_number,
                    is_active,
                    image_url,
                    thumbnail_url,
                    drive_file_id,
                    prompt_used,
                    model_used,
                    art_style,
                    aspect_ratio,
                    credit_cost,
                    source_type,
                    created_at,
                    deleted_at
                FROM moodboard_item_image_versions
                WHERE moodboard_id = ${moodboardId}
                    AND moodboard_item_id = ${itemId}
                    AND deleted_at IS NULL
                ORDER BY version_number DESC
            `;
        }

        // Get active version
        const activeVersion = versions.find((v: any) => v.is_active);

        return NextResponse.json({
            success: true,
            versions,
            activeVersion,
            totalCount: versions.length,
        });
    } catch (error: any) {
        console.error("[MOODBOARD-VERSIONS] GET error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch versions" },
            { status: 500 }
        );
    }
}

// POST - Create new version (for uploads or new generations)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            moodboardId,
            itemId,
            imageUrl,
            thumbnailUrl,
            promptUsed,
            modelUsed,
            artStyle,
            aspectRatio,
            creditCost,
            sourceType = "generated",
            setAsActive = true,
        } = body;

        if (!moodboardId || !itemId || !imageUrl) {
            return NextResponse.json(
                { error: "moodboardId, itemId, and imageUrl are required" },
                { status: 400 }
            );
        }

        // Get next version number
        const versionResult = await sql`
            SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
            FROM moodboard_item_image_versions
            WHERE moodboard_id = ${moodboardId}
                AND moodboard_item_id = ${itemId}
        `;
        const nextVersion = versionResult[0]?.next_version || 1;

        // If setting as active, deactivate all other versions first
        if (setAsActive) {
            await sql`
                UPDATE moodboard_item_image_versions
                SET is_active = false
                WHERE moodboard_id = ${moodboardId}
                    AND moodboard_item_id = ${itemId}
            `;
        }

        // Create new version
        const [newVersion] = await sql`
            INSERT INTO moodboard_item_image_versions (
                moodboard_id,
                moodboard_item_id,
                version_number,
                is_active,
                image_url,
                thumbnail_url,
                prompt_used,
                model_used,
                art_style,
                aspect_ratio,
                credit_cost,
                source_type
            ) VALUES (
                ${moodboardId},
                ${itemId},
                ${nextVersion},
                ${setAsActive},
                ${imageUrl},
                ${thumbnailUrl || imageUrl},
                ${promptUsed || null},
                ${modelUsed || null},
                ${artStyle || null},
                ${aspectRatio || null},
                ${creditCost || 0},
                ${sourceType}
            )
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            version: newVersion,
        });
    } catch (error: any) {
        console.error("[MOODBOARD-VERSIONS] POST error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to create version" },
            { status: 500 }
        );
    }
}

// PATCH - Set active version or restore deleted
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { versionId, action } = body;

        if (!versionId) {
            return NextResponse.json(
                { error: "versionId is required" },
                { status: 400 }
            );
        }

        if (action === "activate") {
            // Get version to find moodboard and item IDs
            const [version] = await sql`
                SELECT moodboard_id, moodboard_item_id 
                FROM moodboard_item_image_versions 
                WHERE id = ${versionId}
            `;

            if (!version) {
                return NextResponse.json(
                    { error: "Version not found" },
                    { status: 404 }
                );
            }

            // Deactivate all versions for this item
            await sql`
                UPDATE moodboard_item_image_versions
                SET is_active = false
                WHERE moodboard_id = ${version.moodboard_id}
                    AND moodboard_item_id = ${version.moodboard_item_id}
            `;

            // Activate the selected version
            const [updated] = await sql`
                UPDATE moodboard_item_image_versions
                SET is_active = true
                WHERE id = ${versionId}
                RETURNING *
            `;

            // Also update the moodboard_items table with active image
            await sql`
                UPDATE moodboard_items
                SET image_url = ${updated.image_url},
                    status = 'has_image'
                WHERE id = ${version.moodboard_item_id}
            `;

            return NextResponse.json({
                success: true,
                version: updated,
            });
        } else if (action === "restore") {
            // Restore soft-deleted version
            const [restored] = await sql`
                UPDATE moodboard_item_image_versions
                SET deleted_at = NULL
                WHERE id = ${versionId}
                RETURNING *
            `;

            return NextResponse.json({
                success: true,
                version: restored,
            });
        }

        return NextResponse.json(
            { error: "Invalid action. Use 'activate' or 'restore'" },
            { status: 400 }
        );
    } catch (error: any) {
        console.error("[MOODBOARD-VERSIONS] PATCH error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to update version" },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete version
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const versionId = searchParams.get("versionId");

        if (!versionId) {
            return NextResponse.json(
                { error: "versionId is required" },
                { status: 400 }
            );
        }

        // Soft delete
        const [deleted] = await sql`
            UPDATE moodboard_item_image_versions
            SET deleted_at = NOW()
            WHERE id = ${versionId}
            RETURNING *
        `;

        if (!deleted) {
            return NextResponse.json(
                { error: "Version not found" },
                { status: 404 }
            );
        }

        // If this was active, activate the most recent non-deleted version
        if (deleted.is_active) {
            await sql`
                UPDATE moodboard_item_image_versions
                SET is_active = true
                WHERE id = (
                    SELECT id FROM moodboard_item_image_versions
                    WHERE moodboard_id = ${deleted.moodboard_id}
                        AND moodboard_item_id = ${deleted.moodboard_item_id}
                        AND deleted_at IS NULL
                        AND id != ${versionId}
                    ORDER BY version_number DESC
                    LIMIT 1
                )
            `;

            // Update moodboard_items with new active image
            const [newActive] = await sql`
                SELECT image_url FROM moodboard_item_image_versions
                WHERE moodboard_id = ${deleted.moodboard_id}
                    AND moodboard_item_id = ${deleted.moodboard_item_id}
                    AND is_active = true
                LIMIT 1
            `;

            if (newActive) {
                await sql`
                    UPDATE moodboard_items
                    SET image_url = ${newActive.image_url}
                    WHERE id = ${deleted.moodboard_item_id}
                `;
            } else {
                // No more versions, clear image
                await sql`
                    UPDATE moodboard_items
                    SET image_url = NULL,
                        status = CASE 
                            WHEN prompt IS NOT NULL THEN 'has_prompt'
                            WHEN key_action_description IS NOT NULL THEN 'has_description'
                            ELSE 'empty'
                        END
                    WHERE id = ${deleted.moodboard_item_id}
                `;
            }
        }

        return NextResponse.json({
            success: true,
            deleted,
        });
    } catch (error: any) {
        console.error("[MOODBOARD-VERSIONS] DELETE error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to delete version" },
            { status: 500 }
        );
    }
}
