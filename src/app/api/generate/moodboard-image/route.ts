/**
 * POST /api/generate/moodboard-image
 * Generate moodboard image using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { generateMoodboardImage } from "@/lib/ai-media-generation";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            moodboardId,
            projectId,
            projectName,
            beatName,
            prompt,
            style,
            referenceAssetId
        } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        if (!moodboardId) {
            return NextResponse.json(
                { success: false, error: "Moodboard ID required" },
                { status: 400 }
            );
        }

        if (!beatName || !prompt) {
            return NextResponse.json(
                { success: false, error: "Beat name and prompt required" },
                { status: 400 }
            );
        }

        // Generate moodboard image
        const result = await generateMoodboardImage({
            userId,
            moodboardId,
            projectId,
            projectName,
            beatName,
            prompt,
            style,
            referenceAssetId
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
        console.error("Error generating moodboard image:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
