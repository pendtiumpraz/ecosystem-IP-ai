import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - List animation versions for a moodboard
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const moodboardId = searchParams.get('moodboardId');
        const includeDeleted = searchParams.get('includeDeleted') === 'true';

        if (!moodboardId) {
            return NextResponse.json({ error: 'Moodboard ID required' }, { status: 400 });
        }

        let versions;
        if (includeDeleted) {
            versions = await sql`
                SELECT 
                    id, moodboard_id as "moodboardId", version_number as "versionNumber", name,
                    default_duration as "defaultDuration", default_fps as "defaultFps",
                    default_resolution as "defaultResolution", generate_audio as "generateAudio",
                    transition_type as "transitionType", transition_duration as "transitionDuration",
                    effect_preset as "effectPreset", status, total_clips as "totalClips",
                    completed_clips as "completedClips", created_at as "createdAt",
                    updated_at as "updatedAt", deleted_at as "deletedAt"
                FROM animation_versions
                WHERE moodboard_id = ${moodboardId}
                ORDER BY version_number DESC
            `;
        } else {
            versions = await sql`
                SELECT 
                    id, moodboard_id as "moodboardId", version_number as "versionNumber", name,
                    default_duration as "defaultDuration", default_fps as "defaultFps",
                    default_resolution as "defaultResolution", generate_audio as "generateAudio",
                    transition_type as "transitionType", transition_duration as "transitionDuration",
                    effect_preset as "effectPreset", status, total_clips as "totalClips",
                    completed_clips as "completedClips", created_at as "createdAt",
                    updated_at as "updatedAt", deleted_at as "deletedAt"
                FROM animation_versions
                WHERE moodboard_id = ${moodboardId} AND deleted_at IS NULL
                ORDER BY version_number DESC
            `;
        }

        return NextResponse.json({ versions });
    } catch (error: any) {
        console.error('Error fetching animation versions:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch versions' }, { status: 500 });
    }
}

// POST - Create new animation version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { moodboardId, name, copyFromMoodboard } = body;

        if (!moodboardId) {
            return NextResponse.json({ error: 'Moodboard ID required' }, { status: 400 });
        }

        // Get next version number
        const maxVersion = await sql`
            SELECT COALESCE(MAX(version_number), 0) as max_version
            FROM animation_versions
            WHERE moodboard_id = ${moodboardId}
        `;
        const nextVersion = (maxVersion[0]?.max_version || 0) + 1;

        // Create animation version
        const result = await sql`
            INSERT INTO animation_versions (moodboard_id, version_number, name, status)
            VALUES (${moodboardId}, ${nextVersion}, ${name || `Animation v${nextVersion}`}, 'draft')
            RETURNING id, version_number as "versionNumber", name
        `;

        const newVersion = result[0];

        // If copyFromMoodboard is true, create clips from moodboard items
        if (copyFromMoodboard) {
            const moodboardItems = await sql`
                SELECT id, beat_key, beat_label, key_action_index, key_action_description, image_url
                FROM moodboard_items
                WHERE moodboard_id = ${moodboardId} AND image_url IS NOT NULL
                ORDER BY beat_key, key_action_index
            `;

            let clipOrder = 0;
            for (const item of moodboardItems) {
                await sql`
                    INSERT INTO animation_clips (
                        animation_version_id, moodboard_item_id, beat_key, beat_label,
                        clip_order, source_image_url, key_action_description, status
                    ) VALUES (
                        ${newVersion.id}, ${item.id}, ${item.beat_key}, ${item.beat_label},
                        ${clipOrder++}, ${item.image_url}, ${item.key_action_description}, 'pending'
                    )
                `;
            }

            // Update total clips count
            await sql`
                UPDATE animation_versions SET total_clips = ${clipOrder} WHERE id = ${newVersion.id}
            `;
        }

        return NextResponse.json({
            success: true,
            version: newVersion,
            message: `Animation v${nextVersion} created successfully`
        });
    } catch (error: any) {
        console.error('Error creating animation version:', error);
        return NextResponse.json({ error: error.message || 'Failed to create version' }, { status: 500 });
    }
}

// PATCH - Update animation version
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, defaultDuration, defaultFps, defaultResolution, generateAudio,
            transitionType, transitionDuration, effectPreset, status } = body;

        if (!id) {
            return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
        }

        await sql`
            UPDATE animation_versions SET
                name = COALESCE(${name}, name),
                default_duration = COALESCE(${defaultDuration}, default_duration),
                default_fps = COALESCE(${defaultFps}, default_fps),
                default_resolution = COALESCE(${defaultResolution}, default_resolution),
                generate_audio = COALESCE(${generateAudio}, generate_audio),
                transition_type = COALESCE(${transitionType}, transition_type),
                transition_duration = COALESCE(${transitionDuration}, transition_duration),
                effect_preset = COALESCE(${effectPreset ? JSON.stringify(effectPreset) : null}, effect_preset),
                status = COALESCE(${status}, status),
                updated_at = NOW()
            WHERE id = ${id}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating animation version:', error);
        return NextResponse.json({ error: error.message || 'Failed to update version' }, { status: 500 });
    }
}

// DELETE - Soft delete animation version
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
        }

        await sql`
            UPDATE animation_versions SET deleted_at = NOW() WHERE id = ${id}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting animation version:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete version' }, { status: 500 });
    }
}
