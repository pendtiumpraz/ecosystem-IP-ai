import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// Helper to convert Google Drive link to direct video link
function convertToDriveViewLink(url: string): string {
    // Handle various Google Drive URL formats

    // Format: https://drive.google.com/file/d/FILE_ID/view
    const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileIdMatch) {
        return `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
    }

    // Format: https://drive.google.com/open?id=FILE_ID
    const openIdMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (openIdMatch) {
        return `https://drive.google.com/uc?export=download&id=${openIdMatch[1]}`;
    }

    // Format: https://drive.google.com/uc?id=FILE_ID
    if (url.includes('drive.google.com/uc')) {
        return url;
    }

    // Return as-is if not a Google Drive URL
    return url;
}

// POST - Add video from external link
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { clipId, externalUrl, source = 'external_link' } = body;

        if (!clipId || !externalUrl) {
            return NextResponse.json({
                error: 'clipId and externalUrl are required'
            }, { status: 400 });
        }

        // Convert Google Drive links to viewable format
        let videoUrl = externalUrl;
        let driveFileId = null;

        if (externalUrl.includes('drive.google.com')) {
            videoUrl = convertToDriveViewLink(externalUrl);

            // Extract file ID for tracking
            const fileIdMatch = externalUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                externalUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
            if (fileIdMatch) {
                driveFileId = fileIdMatch[1];
            }
        }

        // Get next version number
        const existing = await sql`
            SELECT COALESCE(MAX(version_number), 0) as max_version
            FROM clip_video_versions
            WHERE clip_id = ${clipId}
        `;
        const nextVersion = (existing[0]?.max_version || 0) + 1;

        // Deactivate all other versions
        await sql`
            UPDATE clip_video_versions 
            SET is_active = false 
            WHERE clip_id = ${clipId}
        `;

        // Create new version
        const result = await sql`
            INSERT INTO clip_video_versions (
                clip_id, version_number, source, video_url, external_url, 
                drive_file_id, is_active
            ) VALUES (
                ${clipId}, ${nextVersion}, ${source}, ${videoUrl}, ${externalUrl},
                ${driveFileId}, true
            )
            RETURNING *
        `;

        const newVersion = result[0];

        // Update clip's active video
        await sql`
            UPDATE animation_clips SET
                active_video_version_id = ${newVersion.id},
                video_url = ${videoUrl},
                status = 'completed',
                updated_at = NOW()
            WHERE id = ${clipId}
        `;

        return NextResponse.json({
            success: true,
            version: newVersion,
            videoUrl,
            message: `Added video from link (v${nextVersion})`
        });
    } catch (error: any) {
        console.error('Error adding video from link:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
