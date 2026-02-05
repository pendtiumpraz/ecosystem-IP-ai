import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - List cover versions for a project
export async function GET(request: NextRequest) {
    try {
        const projectId = request.nextUrl.searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }

        const versions = await sql`
      SELECT 
        id, project_id, version_number, image_url, thumbnail_url,
        prompt, style, resolution, width, height,
        generation_mode, reference_image_url, is_active,
        provider, credit_cost, created_at
      FROM cover_versions
      WHERE project_id = ${projectId} AND deleted_at IS NULL
      ORDER BY version_number DESC
    `;

        // Get total count
        const countResult = await sql`
      SELECT COUNT(*) as count FROM cover_versions 
      WHERE project_id = ${projectId} AND deleted_at IS NULL
    `;

        return NextResponse.json({
            success: true,
            versions: versions.map(v => ({
                id: v.id,
                projectId: v.project_id,
                versionNumber: v.version_number,
                imageUrl: v.image_url,
                thumbnailUrl: v.thumbnail_url,
                prompt: v.prompt,
                style: v.style,
                resolution: v.resolution,
                width: v.width,
                height: v.height,
                generationMode: v.generation_mode,
                referenceImageUrl: v.reference_image_url,
                isActive: v.is_active,
                provider: v.provider,
                creditCost: v.credit_cost,
                createdAt: v.created_at,
            })),
            total: parseInt(countResult[0]?.count || '0'),
        });
    } catch (error) {
        console.error('Error fetching cover versions:', error);
        return NextResponse.json({ error: 'Failed to fetch cover versions' }, { status: 500 });
    }
}

// POST - Create a new cover version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            projectId,
            imageUrl,
            thumbnailUrl,
            prompt,
            style,
            resolution,
            width,
            height,
            generationMode,
            referenceImageUrl,
            provider,
            creditCost,
        } = body;

        if (!projectId || !imageUrl) {
            return NextResponse.json(
                { error: 'projectId and imageUrl are required' },
                { status: 400 }
            );
        }

        // Get next version number
        const maxVersion = await sql`
      SELECT COALESCE(MAX(version_number), 0) as max_version 
      FROM cover_versions 
      WHERE project_id = ${projectId} AND deleted_at IS NULL
    `;
        const nextVersionNumber = parseInt(maxVersion[0]?.max_version || '0') + 1;

        // Deactivate all other versions for this project
        await sql`
      UPDATE cover_versions 
      SET is_active = FALSE, updated_at = NOW()
      WHERE project_id = ${projectId} AND deleted_at IS NULL
    `;

        // Insert new version as active
        const result = await sql`
      INSERT INTO cover_versions (
        project_id, version_number, image_url, thumbnail_url,
        prompt, style, resolution, width, height,
        generation_mode, reference_image_url, is_active,
        provider, credit_cost
      ) VALUES (
        ${projectId}, ${nextVersionNumber}, ${imageUrl}, ${thumbnailUrl || null},
        ${prompt || null}, ${style || null}, ${resolution || null}, ${width || null}, ${height || null},
        ${generationMode || 'text2image'}, ${referenceImageUrl || null}, TRUE,
        ${provider || null}, ${creditCost || 0}
      )
      RETURNING id, version_number
    `;

        // Also update the project's main cover_image field with the new active version
        await sql`
      UPDATE projects 
      SET cover_image = ${imageUrl}, updated_at = NOW()
      WHERE id = ${projectId}
    `;

        return NextResponse.json({
            success: true,
            version: {
                id: result[0].id,
                versionNumber: result[0].version_number,
                imageUrl,
                isActive: true,
            },
        });
    } catch (error) {
        console.error('Error creating cover version:', error);
        return NextResponse.json({ error: 'Failed to create cover version' }, { status: 500 });
    }
}

// PATCH - Update a cover version (e.g., set as active)
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { versionId, projectId, isActive } = body;

        if (!versionId) {
            return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
        }

        // If setting as active, deactivate all others first
        if (isActive && projectId) {
            await sql`
        UPDATE cover_versions 
        SET is_active = FALSE, updated_at = NOW()
        WHERE project_id = ${projectId} AND deleted_at IS NULL
      `;
        }

        // Update the version
        const result = await sql`
      UPDATE cover_versions 
      SET is_active = ${isActive ?? true}, updated_at = NOW()
      WHERE id = ${versionId} AND deleted_at IS NULL
      RETURNING id, image_url, is_active
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Version not found' }, { status: 404 });
        }

        // If set as active, update project's main cover_image
        if (isActive && projectId) {
            await sql`
        UPDATE projects 
        SET cover_image = ${result[0].image_url}, updated_at = NOW()
        WHERE id = ${projectId}
      `;
        }

        return NextResponse.json({
            success: true,
            version: {
                id: result[0].id,
                imageUrl: result[0].image_url,
                isActive: result[0].is_active,
            },
        });
    } catch (error) {
        console.error('Error updating cover version:', error);
        return NextResponse.json({ error: 'Failed to update cover version' }, { status: 500 });
    }
}

// DELETE - Soft delete a cover version
export async function DELETE(request: NextRequest) {
    try {
        const versionId = request.nextUrl.searchParams.get('versionId');

        if (!versionId) {
            return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
        }

        await sql`
      UPDATE cover_versions 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${versionId}
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting cover version:', error);
        return NextResponse.json({ error: 'Failed to delete cover version' }, { status: 500 });
    }
}
