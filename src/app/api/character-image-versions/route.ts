/**
 * Character Image Versions API
 * GET - List versions for a character
 * POST - Save a new version
 * PUT - Set active version
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all versions for a character
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const characterId = searchParams.get("characterId");
        const projectId = searchParams.get("projectId");
        const userId = searchParams.get("userId");

        if (!characterId) {
            return NextResponse.json(
                { success: false, error: "characterId required" },
                { status: 400 }
            );
        }

        const versions = await sql`
            SELECT * FROM character_image_versions
            WHERE character_id = ${characterId}
            ${projectId ? sql`AND project_id = ${projectId}` : sql``}
            ${userId ? sql`AND user_id = ${userId}` : sql``}
            ORDER BY version_number DESC, created_at DESC
        `;

        return NextResponse.json({
            success: true,
            versions,
            activeVersion: versions.find((v: any) => v.is_active) || versions[0] || null,
        });
    } catch (error) {
        console.error("Error fetching character image versions:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch versions" },
            { status: 500 }
        );
    }
}

// POST - Create a new image version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            characterId,
            projectId,
            userId,
            versionName,
            imageUrl,
            thumbnailUrl,
            driveFileId,
            driveWebViewLink,
            // Generation settings
            template,
            artStyle,
            aspectRatio,
            actionPose,
            characterRefUrl,
            backgroundRefUrl,
            additionalPrompt,
            fullPromptUsed,
            characterDataSnapshot,
            // AI info
            modelUsed,
            modelProvider,
            creditCost,
            generationTimeMs,
        } = body;

        // Validation
        if (!characterId || !projectId || !userId || !imageUrl) {
            return NextResponse.json(
                { success: false, error: "characterId, projectId, userId, and imageUrl are required" },
                { status: 400 }
            );
        }

        // Get next version number
        const versionCountResult = await sql`
            SELECT COALESCE(MAX(version_number), 0) as max_version
            FROM character_image_versions
            WHERE character_id = ${characterId}
        `;
        const nextVersionNumber = (versionCountResult[0]?.max_version || 0) + 1;

        // Deactivate all other versions for this character
        await sql`
            UPDATE character_image_versions
            SET is_active = FALSE, updated_at = NOW()
            WHERE character_id = ${characterId}
        `;

        // Insert new version (set as active)
        const result = await sql`
            INSERT INTO character_image_versions (
                character_id, project_id, user_id,
                version_name, version_number, is_active,
                image_url, thumbnail_url, drive_file_id, drive_web_view_link,
                template, art_style, aspect_ratio, action_pose,
                character_ref_url, background_ref_url,
                additional_prompt, full_prompt_used,
                character_data_snapshot,
                model_used, model_provider, credit_cost, generation_time_ms,
                created_at, updated_at
            ) VALUES (
                ${characterId}, ${projectId}, ${userId},
                ${versionName || `Version ${nextVersionNumber}`}, ${nextVersionNumber}, TRUE,
                ${imageUrl}, ${thumbnailUrl || imageUrl}, ${driveFileId || null}, ${driveWebViewLink || null},
                ${template || null}, ${artStyle || null}, ${aspectRatio || null}, ${actionPose || null},
                ${characterRefUrl || null}, ${backgroundRefUrl || null},
                ${additionalPrompt || null}, ${fullPromptUsed || null},
                ${characterDataSnapshot ? JSON.stringify(characterDataSnapshot) : null},
                ${modelUsed || null}, ${modelProvider || null}, ${creditCost || 0}, ${generationTimeMs || null},
                NOW(), NOW()
            )
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            version: result[0],
            versionNumber: nextVersionNumber,
        });
    } catch (error: any) {
        console.error("Error creating character image version:", error);
        console.error("Error details:", {
            message: error?.message,
            code: error?.code,
            detail: error?.detail,
        });
        return NextResponse.json(
            { success: false, error: `Failed to create version: ${error?.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}

// PUT - Set a version as active
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { versionId, characterId } = body;

        if (!versionId || !characterId) {
            return NextResponse.json(
                { success: false, error: "versionId and characterId required" },
                { status: 400 }
            );
        }

        // Deactivate all versions for this character
        await sql`
            UPDATE character_image_versions
            SET is_active = FALSE, updated_at = NOW()
            WHERE character_id = ${characterId}
        `;

        // Activate the selected version
        const result = await sql`
            UPDATE character_image_versions
            SET is_active = TRUE, updated_at = NOW()
            WHERE id = ${versionId}
            RETURNING *
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { success: false, error: "Version not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            activeVersion: result[0],
        });
    } catch (error) {
        console.error("Error setting active version:", error);
        return NextResponse.json(
            { success: false, error: "Failed to set active version" },
            { status: 500 }
        );
    }
}

// DELETE - Delete a version
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const versionId = searchParams.get("versionId");

        if (!versionId) {
            return NextResponse.json(
                { success: false, error: "versionId required" },
                { status: 400 }
            );
        }

        await sql`
            DELETE FROM character_image_versions
            WHERE id = ${versionId}
        `;

        return NextResponse.json({
            success: true,
            message: "Version deleted",
        });
    } catch (error) {
        console.error("Error deleting version:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete version" },
            { status: 500 }
        );
    }
}
