import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/scene-shots/reorder - Reorder shots within a scene
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shotOrders } = body;

        if (!shotOrders || !Array.isArray(shotOrders)) {
            return NextResponse.json({ error: 'shotOrders array is required' }, { status: 400 });
        }

        // Update each shot's shot_number
        for (const item of shotOrders) {
            await sql`
                UPDATE scene_shots 
                SET shot_number = ${item.shot_number}, updated_at = NOW()
                WHERE id = ${item.id} AND deleted_at IS NULL
            `;
        }

        return NextResponse.json({ success: true, updated: shotOrders.length });
    } catch (error: any) {
        console.error('Error reordering shots:', error?.message);
        return NextResponse.json({ error: 'Failed to reorder shots', details: error?.message }, { status: 500 });
    }
}
