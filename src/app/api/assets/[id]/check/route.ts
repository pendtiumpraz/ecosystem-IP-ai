/**
 * GET /api/assets/[id]/check
 * Check if an asset is still accessible
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { checkAssetAccessibility } from "@/lib/asset-link-service";

interface RouteParams {
    params: Promise<{ id: string }>;
}

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

        // Check accessibility
        const result = await checkAssetAccessibility(id);

        return NextResponse.json({
            success: true,
            data: {
                mediaId: result.mediaId,
                isAccessible: result.isAccessible,
                lastCheckedAt: result.lastCheckedAt.toISOString(),
                // Include helpful message if not accessible
                message: result.isAccessible
                    ? "Asset is accessible"
                    : "Asset is no longer accessible. Please replace with a new URL."
            }
        });

    } catch (error) {
        console.error("Error checking asset accessibility:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
