/**
 * POST /api/temp-upload
 * Upload temporary image for AI generation reference
 * Files are stored in /tmp and auto-deleted by OS
 */

import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { randomUUID } from "crypto";

// Store files in public/temp for easy access via URL
const TEMP_DIR = path.join(process.cwd(), "public", "temp");

// Cleanup old files older than 10 minutes
async function cleanupOldFiles() {
    try {
        const { readdir, stat, unlink } = await import("fs/promises");
        if (!existsSync(TEMP_DIR)) return;

        const files = await readdir(TEMP_DIR);
        const now = Date.now();
        const maxAge = 10 * 60 * 1000; // 10 minutes

        for (const file of files) {
            const filePath = path.join(TEMP_DIR, file);
            const fileStat = await stat(filePath);
            if (now - fileStat.mtimeMs > maxAge) {
                await unlink(filePath);
                console.log(`[TempUpload] Cleaned up old file: ${file}`);
            }
        }
    } catch (e) {
        // Ignore cleanup errors
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { base64Data, filename } = body;

        if (!base64Data) {
            return NextResponse.json(
                { success: false, error: "base64Data required" },
                { status: 400 }
            );
        }

        // Ensure temp directory exists
        if (!existsSync(TEMP_DIR)) {
            await mkdir(TEMP_DIR, { recursive: true });
        }

        // Cleanup old files in background
        cleanupOldFiles();

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
        const uniqueFilename = `${randomUUID()}.${ext}`;
        const filePath = path.join(TEMP_DIR, uniqueFilename);

        // Write file
        await writeFile(filePath, buffer);
        console.log(`[TempUpload] Saved temp file: ${uniqueFilename}, size: ${buffer.length} bytes`);

        // Get the host from request for absolute URL
        const host = request.headers.get("host") || "localhost:3000";
        const protocol = request.headers.get("x-forwarded-proto") || "http";
        const publicUrl = `${protocol}://${host}/temp/${uniqueFilename}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            filename: uniqueFilename,
            size: buffer.length,
            expiresIn: "10 minutes"
        });

    } catch (error) {
        console.error("[TempUpload] Error:", error);
        return NextResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 }
        );
    }
}
