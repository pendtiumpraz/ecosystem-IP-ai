/**
 * POST /api/assets/link
 * Link an existing Google Drive file to an entity
 */

import { NextRequest, NextResponse } from "next/server";
import { linkDriveAsset } from "@/lib/asset-link-service";

export async function POST(request: NextRequest) {
    try {
        // Parse request body
        const body = await request.json();
        const { userId, entityType, entityId, driveUrl, mediaType, projectId, fileName } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        if (!entityType || !entityId || !driveUrl || !mediaType) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Missing required fields: entityType, entityId, driveUrl, mediaType"
                },
                { status: 400 }
            );
        }

        // Validate entityType
        const validEntityTypes = ['character', 'moodboard', 'animation', 'reference'];
        if (!validEntityTypes.includes(entityType)) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Invalid entityType. Must be one of: ${validEntityTypes.join(', ')}`
                },
                { status: 400 }
            );
        }

        // Validate mediaType
        if (!['image', 'video'].includes(mediaType)) {
            return NextResponse.json(
                { success: false, error: "Invalid mediaType. Must be 'image' or 'video'" },
                { status: 400 }
            );
        }

        // Link the asset
        const result = await linkDriveAsset({
            userId,
            projectId,
            entityType,
            entityId,
            driveUrl,
            mediaType,
            fileName
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                id: result.media?.id,
                fileName: result.media?.fileName,
                mediaType: result.media?.mediaType,
                sourceType: result.media?.sourceType,
                urls: result.urls,
                isAccessible: result.media?.isAccessible
            }
        });

    } catch (error) {
        console.error("Error linking asset:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
