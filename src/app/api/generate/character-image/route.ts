/**
 * POST /api/generate/character-image
 * Generate character image using AI
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCharacterImage } from "@/lib/ai-media-generation";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            userId,
            characterId,
            projectId,
            projectName,
            characterData,
            referenceAssetId,
            additionalPrompt,
            style
        } = body;

        // Validate required fields
        if (!userId) {
            return NextResponse.json(
                { success: false, error: "User ID required" },
                { status: 400 }
            );
        }

        if (!characterId) {
            return NextResponse.json(
                { success: false, error: "Character ID required" },
                { status: 400 }
            );
        }

        if (!characterData || !characterData.name) {
            return NextResponse.json(
                { success: false, error: "Character data with name required" },
                { status: 400 }
            );
        }

        // Generate character image
        const result = await generateCharacterImage({
            userId,
            characterId,
            projectId,
            projectName,
            characterData,
            referenceAssetId,
            additionalPrompt,
            style
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            queued: false,
            generationId: `char_${characterId}_${Date.now()}`,
            resultUrl: result.publicUrl,
            result: result.publicUrl,
            resultType: "url",
            data: {
                mediaId: result.mediaId,
                thumbnailUrl: result.thumbnailUrl,
                publicUrl: result.publicUrl,
                creditCost: result.creditCost
            },
            creditCost: result.creditCost
        });

    } catch (error) {
        console.error("Error generating character image:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
