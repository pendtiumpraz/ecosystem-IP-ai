/**
 * GET /api/assets/entity/[entityType]/[entityId]
 * Get all assets for a specific entity
 */

import { NextRequest, NextResponse } from "next/server";
import { getEntityAssets, getPrimaryAsset } from "@/lib/asset-link-service";

interface RouteParams {
    params: Promise<{ entityType: string; entityId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");
        const { entityType, entityId } = await params;

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
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

        // Get all assets for this entity
        const assets = await getEntityAssets(entityType, entityId);

        // Filter by userId (ownership check)
        const userAssets = assets.filter(a => a.userId === userId);

        // Get primary asset
        const primaryAsset = await getPrimaryAsset(entityType, entityId);

        return NextResponse.json({
            success: true,
            data: {
                assets: userAssets,
                primaryAssetId: primaryAsset?.id || null,
                count: userAssets.length
            }
        });

    } catch (error) {
        console.error("Error getting entity assets:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
