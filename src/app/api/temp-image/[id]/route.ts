/**
 * GET /api/temp-image/[id]
 * Serve temporary image from database
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Get image from database
        const result = await sql`
            SELECT data, mime_type FROM temp_images WHERE id = ${id}
        `;

        if (result.length === 0) {
            return NextResponse.json(
                { error: "Image not found or expired" },
                { status: 404 }
            );
        }

        const { data, mime_type } = result[0];
        const buffer = Buffer.from(data, "base64");

        // Return image with proper headers
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                "Content-Type": mime_type,
                "Content-Length": buffer.length.toString(),
                "Cache-Control": "public, max-age=300", // Cache for 5 min
            },
        });

    } catch (error) {
        console.error("[TempImage] Serve error:", error);
        return NextResponse.json(
            { error: "Failed to serve image" },
            { status: 500 }
        );
    }
}
