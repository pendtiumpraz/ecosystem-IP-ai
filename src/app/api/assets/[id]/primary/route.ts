/**
 * POST /api/assets/[id]/primary
 * Set an asset as the primary asset for its entity
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { setPrimaryAsset } from "@/lib/asset-link-service";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const body = await request.json();
        const { userId } = body;
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

        // Set as primary
        await setPrimaryAsset(id);

        return NextResponse.json({
            success: true,
            message: "Asset set as primary"
        });

    } catch (error) {
        console.error("Error setting primary asset:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
