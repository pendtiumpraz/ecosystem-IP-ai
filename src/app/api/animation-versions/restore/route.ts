import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// POST - Restore a soft-deleted animation version
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'Version ID required' }, { status: 400 });
        }

        await sql`
            UPDATE animation_versions 
            SET deleted_at = NULL, updated_at = NOW() 
            WHERE id = ${id}
        `;

        return NextResponse.json({ success: true, message: 'Animation version restored' });
    } catch (error: any) {
        console.error('Error restoring animation version:', error);
        return NextResponse.json({ error: error.message || 'Failed to restore version' }, { status: 500 });
    }
}
