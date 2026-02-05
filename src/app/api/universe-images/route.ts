/**
 * Universe Images API
 * GET - List images for a project/story with versioning
 * PATCH - Set active version
 * DELETE - Soft delete or restore
 * 
 * Following pattern from cover-versions/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List universe field images
export async function GET(request: NextRequest) {
    try {
        const projectId = request.nextUrl.searchParams.get("projectId");
        const storyId = request.nextUrl.searchParams.get("storyId");
        const fieldKey = request.nextUrl.searchParams.get("fieldKey");
        const includeDeleted = request.nextUrl.searchParams.get("includeDeleted") === "true";
        const onlyDeleted = request.nextUrl.searchParams.get("onlyDeleted") === "true";

        if (!projectId) {
            return NextResponse.json(
                { success: false, error: "projectId is required" },
                { status: 400 }
            );
        }

        let images;

        if (onlyDeleted) {
            // Get only deleted images
            images = await sql`
                SELECT * FROM universe_field_images
                WHERE project_id = ${projectId}
                  AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${storyId || null}, '00000000-0000-0000-0000-000000000000')
                  ${fieldKey ? sql`AND field_key = ${fieldKey}` : sql``}
                  AND deleted_at IS NOT NULL
                ORDER BY field_key, deleted_at DESC
            `;
        } else if (includeDeleted) {
            // Get all images including deleted
            images = await sql`
                SELECT * FROM universe_field_images
                WHERE project_id = ${projectId}
                  AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${storyId || null}, '00000000-0000-0000-0000-000000000000')
                  ${fieldKey ? sql`AND field_key = ${fieldKey}` : sql``}
                ORDER BY field_key, version_number DESC
            `;
        } else {
            // Get only active (non-deleted) images
            images = await sql`
                SELECT * FROM universe_field_images
                WHERE project_id = ${projectId}
                  AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${storyId || null}, '00000000-0000-0000-0000-000000000000')
                  ${fieldKey ? sql`AND field_key = ${fieldKey}` : sql``}
                  AND deleted_at IS NULL
                ORDER BY field_key, version_number DESC
            `;
        }

        // Group images by field_key
        const imagesByField: Record<string, any[]> = {};
        const deletedByField: Record<string, any[]> = {};

        for (const img of images) {
            const mapped = {
                id: img.id,
                projectId: img.project_id,
                storyId: img.story_id,
                fieldKey: img.field_key,
                levelNumber: img.level_number,
                versionNumber: img.version_number,
                imageUrl: img.image_url,
                thumbnailUrl: img.thumbnail_url,
                enhancedPrompt: img.enhanced_prompt,
                originalDescription: img.original_description,
                style: img.style,
                modelUsed: img.model_used,
                provider: img.provider,
                creditCost: img.credit_cost,
                isActive: img.is_active,
                createdAt: img.created_at,
                updatedAt: img.updated_at,
                deletedAt: img.deleted_at,
                isDeleted: !!img.deleted_at,
            };

            if (img.deleted_at) {
                if (!deletedByField[img.field_key]) deletedByField[img.field_key] = [];
                deletedByField[img.field_key].push(mapped);
            } else {
                if (!imagesByField[img.field_key]) imagesByField[img.field_key] = [];
                imagesByField[img.field_key].push(mapped);
            }
        }

        return NextResponse.json({
            success: true,
            images: imagesByField,
            deletedImages: deletedByField,
            total: images.length,
        });

    } catch (error) {
        console.error("[UniverseImages] GET Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch universe images" },
            { status: 500 }
        );
    }
}

// PATCH - Set active version
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { imageId, projectId, storyId, fieldKey } = body;

        if (!imageId) {
            return NextResponse.json(
                { success: false, error: "imageId is required" },
                { status: 400 }
            );
        }

        // Get the image to find its field_key
        const imageResult = await sql`
            SELECT project_id, story_id, field_key FROM universe_field_images
            WHERE id = ${imageId}
        `;

        if (imageResult.length === 0) {
            return NextResponse.json(
                { success: false, error: "Image not found" },
                { status: 404 }
            );
        }

        const img = imageResult[0];

        // Deactivate all versions for this field
        await sql`
            UPDATE universe_field_images
            SET is_active = FALSE, updated_at = NOW()
            WHERE project_id = ${img.project_id}
              AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${img.story_id}, '00000000-0000-0000-0000-000000000000')
              AND field_key = ${img.field_key}
              AND deleted_at IS NULL
        `;

        // Activate the selected version
        const result = await sql`
            UPDATE universe_field_images
            SET is_active = TRUE, updated_at = NOW()
            WHERE id = ${imageId}
            RETURNING id, image_url, is_active, field_key, version_number
        `;

        return NextResponse.json({
            success: true,
            image: {
                id: result[0].id,
                imageUrl: result[0].image_url,
                isActive: result[0].is_active,
                fieldKey: result[0].field_key,
                versionNumber: result[0].version_number,
            },
        });

    } catch (error) {
        console.error("[UniverseImages] PATCH Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update universe image" },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete or restore
export async function DELETE(request: NextRequest) {
    try {
        const imageId = request.nextUrl.searchParams.get("imageId");
        const action = request.nextUrl.searchParams.get("action"); // 'delete' or 'restore'

        if (!imageId) {
            return NextResponse.json(
                { success: false, error: "imageId is required" },
                { status: 400 }
            );
        }

        if (action === "restore") {
            // Restore the image
            const result = await sql`
                UPDATE universe_field_images
                SET deleted_at = NULL, updated_at = NOW()
                WHERE id = ${imageId}
                RETURNING id, field_key, version_number, image_url
            `;

            if (result.length === 0) {
                return NextResponse.json(
                    { success: false, error: "Image not found" },
                    { status: 404 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Image restored",
                image: {
                    id: result[0].id,
                    fieldKey: result[0].field_key,
                    versionNumber: result[0].version_number,
                    imageUrl: result[0].image_url,
                },
            });
        } else {
            // Soft delete
            const result = await sql`
                UPDATE universe_field_images
                SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
                WHERE id = ${imageId}
                RETURNING id, project_id, story_id, field_key, is_active
            `;

            if (result.length === 0) {
                return NextResponse.json(
                    { success: false, error: "Image not found" },
                    { status: 404 }
                );
            }

            const deleted = result[0];

            // If this was active, set another version as active
            const latestVersion = await sql`
                SELECT id, image_url FROM universe_field_images
                WHERE project_id = ${deleted.project_id}
                  AND COALESCE(story_id, '00000000-0000-0000-0000-000000000000') = COALESCE(${deleted.story_id}, '00000000-0000-0000-0000-000000000000')
                  AND field_key = ${deleted.field_key}
                  AND deleted_at IS NULL
                ORDER BY version_number DESC
                LIMIT 1
            `;

            if (latestVersion.length > 0) {
                await sql`
                    UPDATE universe_field_images
                    SET is_active = TRUE, updated_at = NOW()
                    WHERE id = ${latestVersion[0].id}
                `;
            }

            return NextResponse.json({
                success: true,
                message: "Image deleted",
                fieldKey: deleted.field_key,
            });
        }

    } catch (error) {
        console.error("[UniverseImages] DELETE Error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to process universe image" },
            { status: 500 }
        );
    }
}
