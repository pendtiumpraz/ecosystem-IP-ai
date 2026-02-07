import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/scene-plots/update-distribution - Update scene distribution
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { projectId, distribution, totalScenes } = body;

        if (!projectId || !distribution) {
            return NextResponse.json(
                { error: 'projectId and distribution are required' },
                { status: 400 }
            );
        }

        // Get current storyboard config
        const projectResult = await sql`
            SELECT storyboard_config FROM projects WHERE id = ${projectId}
        `;

        const currentConfig = projectResult[0]?.storyboard_config || {};

        // Update storyboard config with new distribution
        const updatedConfig = {
            ...currentConfig,
            totalScenes: totalScenes || distribution.reduce((sum: number, d: any) => sum + d.sceneCount, 0),
            sceneDistribution: distribution,
            lastModifiedAt: new Date().toISOString()
        };

        await sql`
            UPDATE projects 
            SET storyboard_config = ${JSON.stringify(updatedConfig)}::jsonb,
                updated_at = NOW()
            WHERE id = ${projectId}
        `;

        return NextResponse.json({
            success: true,
            distribution,
            totalScenes: updatedConfig.totalScenes
        });
    } catch (error) {
        console.error('Error updating scene distribution:', error);
        return NextResponse.json(
            { error: 'Failed to update scene distribution' },
            { status: 500 }
        );
    }
}
