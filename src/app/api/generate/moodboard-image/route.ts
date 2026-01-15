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
            referenceAssetId,
            // Character-based generation
            characterImageUrl,
            characterDetails
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
            referenceAssetId,
            characterImageUrl,
            characterDetails
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

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        console.error("[MOODBOARD-IMAGE] Error generating moodboard image:", {
            message: errorMessage,
            stack: errorStack,
            error
        });
        return NextResponse.json(
            { success: false, error: `Generation failed: ${errorMessage}` },
            { status: 500 }
        );
    }
}
