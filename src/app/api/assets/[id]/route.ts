/**
 * GET /api/assets/[id] - Get asset details
 * PUT /api/assets/[id] - Replace asset with new Drive URL
 * DELETE /api/assets/[id] - Delete asset
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { replaceAsset, deleteAsset } from "@/lib/asset-link-service";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET - Get asset details
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        const [media] = await db.select().from(generatedMedia)
            .where(and(
                eq(generatedMedia.id, id),
                eq(generatedMedia.userId, userId)
            ))
            .limit(1);

        if (!media) {
            return NextResponse.json(
                { success: false, error: "Asset not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: media
        });

    } catch (error) {
        console.error("Error getting asset:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PUT - Replace asset with new Drive URL
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { userId, newDriveUrl } = body;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        if (!newDriveUrl) {
            return NextResponse.json(
                { success: false, error: "Missing newDriveUrl" },
                { status: 400 }
            );
        }

        // Verify ownership
        const [existingMedia] = await db.select().from(generatedMedia)
            .where(and(
                eq(generatedMedia.id, id),
                eq(generatedMedia.userId, userId)
            ))
            .limit(1);

        if (!existingMedia) {
            return NextResponse.json(
                { success: false, error: "Asset not found" },
                { status: 404 }
            );
        }

        // Replace the asset
        const result = await replaceAsset({
            mediaId: id,
            newDriveUrl
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
                sourceType: result.media?.sourceType,
                urls: result.urls,
                isAccessible: result.media?.isAccessible
            }
        });

    } catch (error) {
        console.error("Error replacing asset:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

// DELETE - Delete asset
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const { id } = await params;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        // Verify ownership
        const [existingMedia] = await db.select().from(generatedMedia)
            .where(and(
                eq(generatedMedia.id, id),
                eq(generatedMedia.userId, userId)
            ))
            .limit(1);

        if (!existingMedia) {
            return NextResponse.json(
                { success: false, error: "Asset not found" },
                { status: 404 }
            );
        }

        const success = await deleteAsset(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: "Failed to delete asset" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Asset deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting asset:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
