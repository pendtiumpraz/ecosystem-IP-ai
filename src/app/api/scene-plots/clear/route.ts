import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// DELETE /api/scene-plots/clear?storyVersionId=xxx
// Clears all scene plots for a specific story version
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const storyVersionId = searchParams.get('storyVersionId');

        if (!storyVersionId) {
            return NextResponse.json(
                { error: 'storyVersionId is required' },
                { status: 400 }
            );
        }

        // Delete all scene plots for this story version
        const result = await sql`
            DELETE FROM scene_plots
            WHERE story_version_id::text = ${storyVersionId}::text
            RETURNING id
        `;

        // Also clear scene distribution from project's storyboard_config
        // First get the project_id from story_versions
        const storyVersion = await sql`
            SELECT project_id FROM story_versions WHERE id = ${storyVersionId}
        `;

        if (storyVersion.length > 0) {
            const projectId = storyVersion[0].project_id;
            // Clear the scene distribution in storyboard_config
            await sql`
                UPDATE projects
                SET storyboard_config = storyboard_config - 'sceneDistribution' - 'totalScenes'
                WHERE id = ${projectId}::uuid
            `;
        }

        console.log(`[Clear Scenes] Deleted ${result.length} scene plots for story version ${storyVersionId}`);

        return NextResponse.json({
            success: true,
            deletedCount: result.length,
            storyVersionId
        });
    } catch (error) {
        console.error('Error clearing scene plots:', error);
        return NextResponse.json(
            { error: 'Failed to clear scene plots' },
            { status: 500 }
        );
    }
}
