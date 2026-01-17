import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - List video versions for a clip
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const clipId = searchParams.get('clipId');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID required' }, { status: 400 });
        }

        let versions;
        if (includeDeleted) {
            versions = await sql`
                SELECT * FROM clip_video_versions
                WHERE clip_id = ${clipId}
                ORDER BY version_number DESC
            `;
        } else {
            versions = await sql`
                SELECT * FROM clip_video_versions
                WHERE clip_id = ${clipId} AND deleted_at IS NULL
                ORDER BY version_number DESC
            `;
        }

        return NextResponse.json({ versions });
    } catch (error: any) {
        console.error('Error fetching clip video versions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - Create new video version (from generation, upload, or link)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            clipId,
            source, // 'generated' | 'uploaded' | 'external_link'
            videoUrl,
            thumbnailUrl,
            externalUrl,
            driveFileId,
            originalFileName,
            prompt,
            cameraMotion,
            duration,
            jobId,
            setAsActive = true
        } = body;

        if (!clipId) {
            return NextResponse.json({ error: 'Clip ID required' }, { status: 400 });
        }

        // Get next version number
        const existing = await sql`
            SELECT COALESCE(MAX(version_number), 0) as max_version
            FROM clip_video_versions
            WHERE clip_id = ${clipId}
        `;
        const nextVersion = (existing[0]?.max_version || 0) + 1;

        // If setting as active, deactivate all other versions first
        if (setAsActive) {
            await sql`
                UPDATE clip_video_versions 
                SET is_active = false 
                WHERE clip_id = ${clipId}
            `;
        }

        // Create new version
        const result = await sql`
            INSERT INTO clip_video_versions (
                clip_id, version_number, source, video_url, thumbnail_url,
                external_url, drive_file_id, original_file_name,
                prompt, camera_motion, duration, job_id, is_active
            ) VALUES (
                ${clipId}, ${nextVersion}, ${source || 'generated'}, ${videoUrl || null}, ${thumbnailUrl || null},
                ${externalUrl || null}, ${driveFileId || null}, ${originalFileName || null},
                ${prompt || null}, ${cameraMotion || 'static'}, ${duration || 6}, ${jobId || null}, ${setAsActive}
            )
            RETURNING *
        `;

        const newVersion = result[0];

        // Update clip's active video version and video_url for backwards compatibility
        if (setAsActive && videoUrl) {
            await sql`
                UPDATE animation_clips SET
                    active_video_version_id = ${newVersion.id},
                    video_url = ${videoUrl},
                    thumbnail_url = ${thumbnailUrl || null},
                    status = 'completed',
                    updated_at = NOW()
                WHERE id = ${clipId}
            `;
        }

        return NextResponse.json({
            success: true,
            version: newVersion,
            message: `Created version ${nextVersion}`
        });
    } catch (error: any) {
        console.error('Error creating clip video version:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH - Update version (set active, restore, etc.)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, setActive, videoUrl } = body;

        if (!id) {
            return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
        }

        // Get version info
        const versionResult = await sql`
            SELECT * FROM clip_video_versions WHERE id = ${id}
        `;

        if (versionResult.length === 0) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        const version = versionResult[0];

        if (setActive) {
            // Deactivate all other versions
            await sql`
                UPDATE clip_video_versions 
                SET is_active = false 
                WHERE clip_id = ${version.clip_id}
            `;

            // Activate this version
            await sql`
                UPDATE clip_video_versions 
                SET is_active = true, deleted_at = NULL
                WHERE id = ${id}
            `;

            // Update clip's video_url for backwards compatibility
            const effectiveVideoUrl = version.video_url || version.external_url;
            if (effectiveVideoUrl) {
                await sql`
                    UPDATE animation_clips SET
                        active_video_version_id = ${id},
                        video_url = ${effectiveVideoUrl},
                        thumbnail_url = ${version.thumbnail_url || null},
                        status = 'completed',
                        updated_at = NOW()
                    WHERE id = ${version.clip_id}
                `;
            }
        }

        if (videoUrl !== undefined) {
            await sql`
                UPDATE clip_video_versions 
                SET video_url = ${videoUrl}
                WHERE id = ${id}
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating clip video version:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - Soft delete a version
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const restore = searchParams.get('restore') === 'true';

        if (!id) {
            return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
        }

        if (restore) {
            await sql`
                UPDATE clip_video_versions 
                SET deleted_at = NULL 
                WHERE id = ${id}
            `;
            return NextResponse.json({ success: true, message: 'Version restored' });
        } else {
            // Soft delete
            await sql`
                UPDATE clip_video_versions 
                SET deleted_at = NOW(), is_active = false 
                WHERE id = ${id}
            `;

            // If this was active, clear the clip's video_url
            const version = await sql`SELECT clip_id FROM clip_video_versions WHERE id = ${id}`;
            if (version.length > 0) {
                // Check if there's another active version
                const active = await sql`
                    SELECT id, video_url, external_url, thumbnail_url 
                    FROM clip_video_versions 
                    WHERE clip_id = ${version[0].clip_id} AND is_active = true AND deleted_at IS NULL
                `;

                if (active.length === 0) {
                    // No active version, clear clip's video
                    await sql`
                        UPDATE animation_clips SET
                            active_video_version_id = NULL,
                            video_url = NULL,
                            thumbnail_url = NULL,
                            status = CASE WHEN video_prompt IS NOT NULL THEN 'prompt_ready' ELSE 'pending' END,
                            updated_at = NOW()
                        WHERE id = ${version[0].clip_id}
                    `;
                }
            }

            return NextResponse.json({ success: true, message: 'Version deleted' });
        }
    } catch (error: any) {
        console.error('Error deleting clip video version:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
