/**
 * POST /api/generate/animation
 * Generate animation (Image-to-Video) using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { generateAnimation } from "@/lib/ai-media-generation";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            animationId,
            projectId,
            projectName,
            sourceAssetId,
            motionPrompt,
            duration
        } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        if (!animationId) {
            return NextResponse.json(
                { success: false, error: "Animation ID required" },
                { status: 400 }
            );
        }

        if (!sourceAssetId) {
            return NextResponse.json(
                { success: false, error: "Source asset ID required (image to animate)" },
                { status: 400 }
            );
        }

        if (!motionPrompt) {
            return NextResponse.json(
                { success: false, error: "Motion prompt required" },
                { status: 400 }
            );
        }

        // Generate animation
        const result = await generateAnimation({
            userId,
            animationId,
            projectId,
            projectName,
            sourceAssetId,
            motionPrompt,
            duration
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
                mediaId: result.mediaId,
                thumbnailUrl: result.thumbnailUrl,
                publicUrl: result.publicUrl,
                creditCost: result.creditCost
            }
        });

    } catch (error) {
        console.error("Error generating animation:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
