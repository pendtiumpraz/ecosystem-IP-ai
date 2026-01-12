/**
 * Asset Upload API
 * Upload file to user's Google Drive and create generated_media record
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import {
    getOrCreateModoFolder,
    uploadFileToDrive,
    generateDriveUrls,
} from "@/lib/google-drive";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const userId = formData.get("userId") as string;
        const entityType = (formData.get("entityType") as string) || "reference";
        const entityId = (formData.get("entityId") as string) || "uploaded";
        const projectId = formData.get("projectId") as string | null;

        // Validate
        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        if (!userId) {
            return NextResponse.json(
                { success: false, error: "userId required" },
                { status: 400 }
            );
        }

        // Get user's Drive token
        const [token] = await sql`
            SELECT access_token, refresh_token, token_expires_at, drive_folder_id
            FROM user_google_drive_tokens
            WHERE user_id = ${userId} AND is_active = TRUE
        `;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Google Drive not connected. Please connect your Drive first." },
                { status: 400 }
            );
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const mimeType = file.type || "image/png";
        const fileName = file.name || `upload_${Date.now()}.png`;

        // Get or create folder
        let folderId = token.drive_folder_id;
        if (!folderId) {
            folderId = await getOrCreateModoFolder(token.access_token);
            // Update user's folder ID
            await sql`
                UPDATE user_google_drive_tokens 
                SET drive_folder_id = ${folderId}
                WHERE user_id = ${userId}
            `;
        }

        // Upload to Drive (accessToken, folderId, fileName, fileData, mimeType)
        const uploadResult = await uploadFileToDrive(
            token.access_token,
            folderId,
            fileName,
            buffer,
            mimeType
        );

        if (!uploadResult || !uploadResult.id) {
            return NextResponse.json(
                { success: false, error: "Failed to upload to Google Drive" },
                { status: 500 }
            );
        }

        // Generate URLs
        const urls = generateDriveUrls(uploadResult.id);

        // Validate entity type
        const validEntityTypes = ["character", "moodboard", "animation", "reference"] as const;
        const validatedEntityType = validEntityTypes.includes(entityType as typeof validEntityTypes[number])
            ? (entityType as typeof validEntityTypes[number])
            : "reference";

        // Save to generated_media
        const [media] = await db.insert(generatedMedia).values({
            userId,
            projectId: projectId || undefined,
            entityType: validatedEntityType,
            entityId,
            mediaType: mimeType.startsWith("video") ? "video" : "image",
            fileName,
            mimeType,
            fileSizeBytes: buffer.length,
            sourceType: "linked",
            driveFileId: uploadResult.id,
            driveWebViewLink: uploadResult.webViewLink || null,
            downloadUrl: urls.downloadUrl,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,
            isAccessible: true,
            isPrimary: false,
            linkedAt: new Date(),
            lastCheckedAt: new Date(),
        }).returning();

        return NextResponse.json({
            success: true,
            mediaId: media.id,
            driveFileId: uploadResult.id,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,
            downloadUrl: urls.downloadUrl,
        });

    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}

