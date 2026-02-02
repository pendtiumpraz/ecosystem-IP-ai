/**
 * POST /api/temp-upload
 * Upload temporary image for AI generation reference
 * Uses Vercel Blob Storage for production compatibility
 */

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

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
        const buffer = Buffer.from(base64, "base64");

        // Generate unique filename
        const ext = mimeType.split("/")[1] || "png";
        const uniqueFilename = `temp-ref/${randomUUID()}.${ext}`;

        console.log(`[TempUpload] Uploading to Vercel Blob: ${uniqueFilename}, size: ${buffer.length} bytes`);

        // Upload to Vercel Blob Storage
        const blob = await put(uniqueFilename, buffer, {
            access: "public",
            contentType: mimeType,
        });

        console.log(`[TempUpload] Upload success: ${blob.url}`);

        return NextResponse.json({
            success: true,
            url: blob.url,
            filename: uniqueFilename,
            size: buffer.length,
        });

    } catch (error) {
        console.error("[TempUpload] Error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
