/**
 * Character Image Version Visual Grids API
 * Update visual grids (poses, expressions, gestures) for a specific image version
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// PATCH - Update visual grids for an image version
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: versionId } = await context.params;
        const body = await request.json();
        const { keyPoses, facialExpressions, emotionGestures } = body;

        // Update each field if provided
        if (keyPoses !== undefined) {
            await sql`
                UPDATE character_image_versions 
                SET key_poses = ${JSON.stringify(keyPoses)}::jsonb, updated_at = NOW()
                WHERE id = ${versionId}
            `;
        }

        if (facialExpressions !== undefined) {
            await sql`
                UPDATE character_image_versions 
                SET facial_expressions = ${JSON.stringify(facialExpressions)}::jsonb, updated_at = NOW()
                WHERE id = ${versionId}
            `;
        }

        if (emotionGestures !== undefined) {
            await sql`
                UPDATE character_image_versions 
                SET emotion_gestures = ${JSON.stringify(emotionGestures)}::jsonb, updated_at = NOW()
                WHERE id = ${versionId}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update image version grids error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to update visual grids" },
            { status: 500 }
        );
    }
}

// GET - Get visual grids for an image version
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: versionId } = await context.params;

        const [version] = await sql`
            SELECT key_poses, facial_expressions, emotion_gestures 
            FROM character_image_versions 
            WHERE id = ${versionId}
        `;

        if (!version) {
            return NextResponse.json(
                { success: false, error: "Image version not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            keyPoses: version.key_poses || {},
            facialExpressions: version.facial_expressions || {},
            emotionGestures: version.emotion_gestures || {},
        });
    } catch (error) {
        console.error("Get image version grids error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to get visual grids" },
            { status: 500 }
        );
    }
}
