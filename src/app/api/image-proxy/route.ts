import { NextRequest, NextResponse } from 'next/server';

// Proxy API to download images from external URLs (bypass CORS)
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL required' }, { status: 400 });
    }

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch image' }, { status: response.status });
        }

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/png';

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600',
            },
        });
    } catch (error: any) {
        console.error('Image proxy error:', error);
        return NextResponse.json({ error: error.message || 'Proxy error' }, { status: 500 });
    }
}
