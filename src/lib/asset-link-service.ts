/**
 * Asset Link Service
 * - Link existing Drive files to entities (character, moodboard, animation)
 * - Replace broken/missing assets with new Drive URLs
 * - Check asset accessibility
 * - Support both generated and manually linked assets
 */

import { db } from "@/db";
import { generatedMedia, type GeneratedMedia, type NewGeneratedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
    extractDriveFileId,
    generateDriveUrls,
    checkDriveFileAccessible,
    getPublicDriveFileInfo,
    downloadDriveFile,
    type DriveUrls
} from "./google-drive";

// ============ TYPES ============

export interface LinkAssetParams {
    userId: string;
    projectId?: string;
    entityType: 'character' | 'moodboard' | 'animation' | 'reference';
    entityId: string;
    driveUrl: string;
    mediaType: 'image' | 'video';
    fileName?: string;
}

export interface LinkAssetResult {
    success: boolean;
    media?: GeneratedMedia;
    error?: string;
    urls?: DriveUrls;
}

export interface ReplaceAssetParams {
    mediaId: string;
    newDriveUrl: string;
}

export interface AccessibilityCheckResult {
    mediaId: string;
    isAccessible: boolean;
    lastCheckedAt: Date;
}

// ============ LINK ASSET ============

/**
 * Link an existing Google Drive file to an entity
 * User pastes 1 URL → System generates 3 URLs → Save to database
 */
export async function linkDriveAsset(params: LinkAssetParams): Promise<LinkAssetResult> {
    const { userId, projectId, entityType, entityId, driveUrl, mediaType, fileName } = params;

    // 1. Extract file ID from URL
    const fileId = extractDriveFileId(driveUrl);
    if (!fileId) {
        return {
            success: false,
            error: "Invalid Google Drive URL. Please use a valid sharing link."
        };
    }

    // 2. Generate all URLs from the file ID
    const urls = generateDriveUrls(fileId);

    // 3. Check if file is publicly accessible
    const isAccessible = await checkDriveFileAccessible(fileId);
    if (!isAccessible) {
        return {
            success: false,
            error: 'File is not publicly accessible. Please set sharing to "Anyone with the link can view".'
        };
    }

    // 4. Get file info (optional - for metadata)
    const fileInfo = await getPublicDriveFileInfo(fileId);

    // 5. Determine file name
    const finalFileName = fileName || `linked_${entityType}_${Date.now()}${getExtension(fileInfo.contentType || mediaType)}`;

    // 6. Save to database
    try {
        const [media] = await db.insert(generatedMedia).values({
            userId,
            projectId,
            entityType,
            entityId,
            mediaType,
            fileName: finalFileName,
            mimeType: fileInfo.contentType,
            fileSizeBytes: fileInfo.contentLength,

            // Source type
            sourceType: 'linked',

            // Drive storage
            driveFileId: fileId,
            driveWebViewLink: driveUrl,

            // Generated URLs
            downloadUrl: urls.downloadUrl,
            thumbnailUrl: urls.thumbnailUrl,
            publicUrl: urls.publicUrl,

            // Link info
            originalDriveUrl: driveUrl,
            linkedAt: new Date(),

            // Status
            isAccessible: true,
            lastCheckedAt: new Date(),
        }).returning();

        return {
            success: true,
            media,
            urls
        };
    } catch (error) {
        console.error("Error linking asset:", error);
        return {
            success: false,
            error: "Failed to save asset to database."
        };
    }
}

// ============ REPLACE ASSET ============

/**
 * Replace an asset that is no longer accessible with a new Drive URL
 */
export async function replaceAsset(params: ReplaceAssetParams): Promise<LinkAssetResult> {
    const { mediaId, newDriveUrl } = params;

    // 1. Get existing media
    const [existingMedia] = await db.select().from(generatedMedia)
        .where(eq(generatedMedia.id, mediaId))
        .limit(1);

    if (!existingMedia) {
        return {
            success: false,
            error: "Asset not found."
        };
    }

    // 2. Extract file ID from new URL
    const fileId = extractDriveFileId(newDriveUrl);
    if (!fileId) {
        return {
            success: false,
            error: "Invalid Google Drive URL."
        };
    }

    // 3. Generate URLs
    const urls = generateDriveUrls(fileId);

    // 4. Check accessibility
    const isAccessible = await checkDriveFileAccessible(fileId);
    if (!isAccessible) {
        return {
            success: false,
            error: 'File is not publicly accessible. Please set sharing to "Anyone with the link can view".'
        };
    }

    // 5. Get file info
    const fileInfo = await getPublicDriveFileInfo(fileId);

    // 6. Update database
    try {
        const [updatedMedia] = await db.update(generatedMedia)
            .set({
                sourceType: 'replaced',
                driveFileId: fileId,
                driveWebViewLink: newDriveUrl,
                downloadUrl: urls.downloadUrl,
                thumbnailUrl: urls.thumbnailUrl,
                publicUrl: urls.publicUrl,
                originalDriveUrl: newDriveUrl,
                linkedAt: new Date(),
                mimeType: fileInfo.contentType,
                fileSizeBytes: fileInfo.contentLength,
                isAccessible: true,
                lastCheckedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(generatedMedia.id, mediaId))
            .returning();

        return {
            success: true,
            media: updatedMedia,
            urls
        };
    } catch (error) {
        console.error("Error replacing asset:", error);
        return {
            success: false,
            error: "Failed to update asset."
        };
    }
}

// ============ CHECK ACCESSIBILITY ============

/**
 * Check if an asset is still accessible
 */
export async function checkAssetAccessibility(mediaId: string): Promise<AccessibilityCheckResult> {
    const [media] = await db.select().from(generatedMedia)
        .where(eq(generatedMedia.id, mediaId))
        .limit(1);

    if (!media?.driveFileId) {
        return {
            mediaId,
            isAccessible: false,
            lastCheckedAt: new Date()
        };
    }

    const isAccessible = await checkDriveFileAccessible(media.driveFileId);
    const now = new Date();

    // Update database
    await db.update(generatedMedia)
        .set({
            isAccessible,
            lastCheckedAt: now
        })
        .where(eq(generatedMedia.id, mediaId));

    return {
        mediaId,
        isAccessible,
        lastCheckedAt: now
    };
}

/**
 * Batch check accessibility for multiple assets
 */
export async function checkMultipleAssetAccessibility(mediaIds: string[]): Promise<AccessibilityCheckResult[]> {
    const results: AccessibilityCheckResult[] = [];

    for (const mediaId of mediaIds) {
        const result = await checkAssetAccessibility(mediaId);
        results.push(result);
    }

    return results;
}

// ============ GET ASSETS ============

type EntityType = 'character' | 'moodboard' | 'animation' | 'reference';

/**
 * Get all assets for an entity
 */
export async function getEntityAssets(
    entityType: string,
    entityId: string
): Promise<GeneratedMedia[]> {
    const assets = await db.select().from(generatedMedia)
        .where(and(
            eq(generatedMedia.entityType, entityType as EntityType),
            eq(generatedMedia.entityId, entityId)
        ))
        .orderBy(generatedMedia.createdAt);

    return assets;
}

/**
 * Get primary asset for an entity
 */
export async function getPrimaryAsset(
    entityType: string,
    entityId: string
): Promise<GeneratedMedia | undefined> {
    const [asset] = await db.select().from(generatedMedia)
        .where(and(
            eq(generatedMedia.entityType, entityType as EntityType),
            eq(generatedMedia.entityId, entityId),
            eq(generatedMedia.isPrimary, true)
        ))
        .limit(1);

    return asset;
}

/**
 * Set an asset as primary for its entity
 */
export async function setPrimaryAsset(mediaId: string): Promise<void> {
    const [media] = await db.select().from(generatedMedia)
        .where(eq(generatedMedia.id, mediaId))
        .limit(1);

    if (!media) return;

    // Unset all other assets as primary
    await db.update(generatedMedia)
        .set({ isPrimary: false })
        .where(and(
            eq(generatedMedia.entityType, media.entityType),
            eq(generatedMedia.entityId, media.entityId)
        ));

    // Set this asset as primary
    await db.update(generatedMedia)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(eq(generatedMedia.id, mediaId));
}

/**
 * Delete an asset
 */
export async function deleteAsset(mediaId: string): Promise<boolean> {
    try {
        await db.delete(generatedMedia)
            .where(eq(generatedMedia.id, mediaId));
        return true;
    } catch (error) {
        console.error("Error deleting asset:", error);
        return false;
    }
}

// ============ DOWNLOAD FOR GENERATION ============

/**
 * Download asset for AI generation (I2I, I2V)
 * Returns base64 encoded image/video
 */
export async function downloadAssetForGeneration(mediaId: string): Promise<{
    success: boolean;
    buffer?: Buffer;
    base64?: string;
    mimeType?: string;
    error?: string;
}> {
    const [media] = await db.select().from(generatedMedia)
        .where(eq(generatedMedia.id, mediaId))
        .limit(1);

    if (!media?.driveFileId) {
        return {
            success: false,
            error: "Asset not found or has no Drive file ID."
        };
    }

    const buffer = await downloadDriveFile(media.driveFileId);

    if (!buffer) {
        // Mark as inaccessible
        await db.update(generatedMedia)
            .set({ isAccessible: false, lastCheckedAt: new Date() })
            .where(eq(generatedMedia.id, mediaId));

        return {
            success: false,
            error: "Failed to download file. It may no longer be accessible."
        };
    }

    return {
        success: true,
        buffer,
        base64: buffer.toString('base64'),
        mimeType: media.mimeType || 'image/png'
    };
}

// ============ HELPERS ============

function getExtension(mimeTypeOrMediaType: string): string {
    const extensions: Record<string, string> = {
        'image/png': '.png',
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/webp': '.webp',
        'image/gif': '.gif',
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'video/quicktime': '.mov',
        'image': '.png',
        'video': '.mp4'
    };

    return extensions[mimeTypeOrMediaType] || '';
}
