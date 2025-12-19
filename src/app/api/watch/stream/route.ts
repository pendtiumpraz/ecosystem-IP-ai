import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const quality = searchParams.get("quality") || "720p";

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Content ID required" },
        { status: 400 }
      );
    }

    // Get content details
    const content = await sql`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email
      FROM watch_content c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ${id} AND c.deleted_at IS NULL
    `;

    if (content.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    const videoData = content[0];

    // Get streaming URL based on quality
    const streamingUrl = getStreamingUrl(videoData.video_url, quality);

    return NextResponse.json({
      success: true,
      content: {
        id: videoData.id,
        title: videoData.title,
        description: videoData.description,
        creatorName: videoData.creator_name,
        creatorEmail: videoData.creator_email,
        streamingUrl,
        quality,
        duration: videoData.duration,
        status: videoData.status,
      },
    });
  } catch (error) {
    console.error("Stream content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to stream content" },
      { status: 500 }
    );
  }
}

function getStreamingUrl(videoUrl: string, quality: string): string {
  // This would typically integrate with a CDN or streaming service
  // For now, return a placeholder URL
  const qualityMap = {
    '360p': 'low',
    '480p': 'medium',
    '720p': 'high',
    '1080p': 'very-high',
    '4k': 'ultra-high',
  } as const;

  const qualityKey = qualityMap[quality.toLowerCase() as keyof typeof qualityMap] || 'high';
  
  // In a real implementation, this would return actual streaming URLs
  return `${videoUrl}?quality=${qualityKey}`;
}