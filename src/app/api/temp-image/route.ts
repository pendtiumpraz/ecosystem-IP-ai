/**
 * Temporary image storage in database
 * POST - Upload base64 image, get public URL
 * GET - Serve image by ID
 * 
 * Auto-cleanup after 5 minutes via lazy cleanup
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";

const sql = neon(process.env.DATABASE_URL!);

// Lazy cleanup - delete old temp images
async function cleanupOldImages() {
    try {
        await sql`
            DELETE FROM temp_images 
            WHERE created_at < NOW() - INTERVAL '5 minutes'
        `;
    } catch (e) {
        // Ignore - table might not exist yet
    }
}

// Ensure table exists
async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS temp_images (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
        )
    `;
}

// POST - Upload image and get URL
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { base64Data } = body;

        if (!base64Data) {
            return NextResponse.json(
                { success: false, error: "base64Data required" },
                { status: 400 }
            );
        }

        // Parse base64 data URL
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
            return NextResponse.json(
                { success: false, error: "Invalid base64 data URL format" },
                { status: 400 }
            );
        }

        const mimeType = matches[1];
        const base64 = matches[2];
        const id = randomUUID();

        // Ensure table exists and cleanup old images
        await ensureTable();
        cleanupOldImages(); // Fire and forget

        // Store in database
        await sql`
            INSERT INTO temp_images (id, data, mime_type)
            VALUES (${id}, ${base64}, ${mimeType})
        `;

        // Build public URL
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const publicUrl = `${protocol}://${host}/api/temp-image/${id}`;

        console.log(`[TempImage] Stored temp image: ${id}, size: ${base64.length} chars`);

        return NextResponse.json({
            success: true,
            url: publicUrl,
            id,
            expiresIn: "5 minutes"
        });

    } catch (error) {
        console.error("[TempImage] Upload error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
