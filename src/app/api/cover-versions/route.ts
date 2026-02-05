import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET - List cover versions for a project
export async function GET(request: NextRequest) {
    try {
        const projectId = request.nextUrl.searchParams.get('projectId');
        const includeDeleted = request.nextUrl.searchParams.get('includeDeleted') === 'true';
        const onlyDeleted = request.nextUrl.searchParams.get('onlyDeleted') === 'true';

        if (!projectId) {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
        }

        let versions;
        let countResult;

        if (onlyDeleted) {
            // Get only deleted versions
            versions = await sql`
        SELECT 
          id, project_id, version_number, image_url, thumbnail_url,
          prompt, style, resolution, width, height,
          generation_mode, reference_image_url, is_active,
          provider, credit_cost, created_at, deleted_at
        FROM cover_versions
        WHERE project_id = ${projectId} AND deleted_at IS NOT NULL
        ORDER BY deleted_at DESC
      `;
            countResult = await sql`
        SELECT COUNT(*) as count FROM cover_versions 
        WHERE project_id = ${projectId} AND deleted_at IS NOT NULL
      `;
        } else if (includeDeleted) {
            // Get all versions including deleted
            versions = await sql`
        SELECT 
          id, project_id, version_number, image_url, thumbnail_url,
          prompt, style, resolution, width, height,
          generation_mode, reference_image_url, is_active,
          provider, credit_cost, created_at, deleted_at
        FROM cover_versions
        WHERE project_id = ${projectId}
        ORDER BY version_number DESC
      `;
            countResult = await sql`
        SELECT COUNT(*) as count FROM cover_versions 
        WHERE project_id = ${projectId}
      `;
        } else {
            // Get only active (non-deleted) versions
            versions = await sql`
        SELECT 
          id, project_id, version_number, image_url, thumbnail_url,
          prompt, style, resolution, width, height,
          generation_mode, reference_image_url, is_active,
          provider, credit_cost, created_at
        FROM cover_versions
        WHERE project_id = ${projectId} AND deleted_at IS NULL
        ORDER BY version_number DESC
      `;
            countResult = await sql`
        SELECT COUNT(*) as count FROM cover_versions 
        WHERE project_id = ${projectId} AND deleted_at IS NULL
      `;
        }

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
                deletedAt: v.deleted_at || null,
                isDeleted: !!v.deleted_at,
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

// DELETE - Soft delete a cover version OR restore if action=restore
export async function DELETE(request: NextRequest) {
    try {
        const versionId = request.nextUrl.searchParams.get('versionId');
        const action = request.nextUrl.searchParams.get('action'); // 'delete' or 'restore'

        if (!versionId) {
            return NextResponse.json({ error: 'versionId is required' }, { status: 400 });
        }

        if (action === 'restore') {
            // Restore the version
            const result = await sql`
        UPDATE cover_versions 
        SET deleted_at = NULL, updated_at = NOW()
        WHERE id = ${versionId}
        RETURNING id, project_id, image_url, version_number
      `;

            if (result.length === 0) {
                return NextResponse.json({ error: 'Version not found' }, { status: 404 });
            }

            return NextResponse.json({
                success: true,
                message: 'Cover version restored',
                version: {
                    id: result[0].id,
                    projectId: result[0].project_id,
                    imageUrl: result[0].image_url,
                    versionNumber: result[0].version_number,
                },
            });
        } else {
            // Soft delete
            const result = await sql`
        UPDATE cover_versions 
        SET deleted_at = NOW(), is_active = FALSE, updated_at = NOW()
        WHERE id = ${versionId}
        RETURNING id, project_id, is_active
      `;

            if (result.length === 0) {
                return NextResponse.json({ error: 'Version not found' }, { status: 404 });
            }

            // If this was the active version, set another version as active
            if (result[0].is_active === false) {
                const projectId = result[0].project_id;
                const latestVersion = await sql`
          SELECT id, image_url FROM cover_versions 
          WHERE project_id = ${projectId} AND deleted_at IS NULL
          ORDER BY version_number DESC
          LIMIT 1
        `;

                if (latestVersion.length > 0) {
                    await sql`
            UPDATE cover_versions 
            SET is_active = TRUE, updated_at = NOW()
            WHERE id = ${latestVersion[0].id}
          `;
                    await sql`
            UPDATE projects 
            SET cover_image = ${latestVersion[0].image_url}, updated_at = NOW()
            WHERE id = ${projectId}
          `;
                } else {
                    // No versions left, clear cover_image
                    await sql`
            UPDATE projects 
            SET cover_image = NULL, updated_at = NOW()
            WHERE id = ${projectId}
          `;
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Cover version deleted',
            });
        }
    } catch (error) {
        console.error('Error processing cover version:', error);
        return NextResponse.json({ error: 'Failed to process cover version' }, { status: 500 });
    }
}
