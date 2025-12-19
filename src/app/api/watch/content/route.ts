import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const genre = searchParams.get("genre") || "";
    const status = searchParams.get("status") || "";

    const offset = (page - 1) * limit;

    let query = sql`
      SELECT 
        c.*,
        u.name as creator_name,
        u.email as creator_email,
        COUNT(DISTINCT v.id) as view_count,
        COUNT(DISTINCT l.id) as like_count,
        COUNT(DISTINCT co.id) as comment_count
      FROM watch_content c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN watch_views v ON c.id = v.content_id
      LEFT JOIN watch_likes l ON c.id = l.content_id
      LEFT JOIN watch_comments co ON c.id = co.content_id
      WHERE c.deleted_at IS NULL
    `;

    // Apply filters
    if (id) {
      query = sql`${query} AND c.id = ${id}`;
    }

    if (search) {
      query = sql`${query} AND (c.title ILIKE ${'%' + search + '%'} OR c.description ILIKE ${'%' + search + '%'})`;
    }

    if (genre) {
      query = sql`${query} AND c.genre = ${genre}`;
    }

    if (status) {
      query = sql`${query} AND c.status = ${status}`;
    }

    query = sql`${query}
      GROUP BY c.id, u.name, u.email
      ORDER BY c.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const totalQuery = sql`
      SELECT COUNT(*) as count FROM watch_content WHERE deleted_at IS NULL
    `;

    const [content, totalResult] = await Promise.all([query, totalQuery]);
    const total = Number(totalResult[0]?.count || 0);

    return NextResponse.json({
      success: true,
      content: content.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        thumbnailUrl: c.thumbnail_url,
        videoUrl: c.video_url,
        duration: c.duration,
        genre: c.genre,
        status: c.status,
        isPublic: c.is_public,
        creatorName: c.creator_name,
        creatorEmail: c.creator_email,
        viewCount: Number(c.view_count || 0),
        likeCount: Number(c.like_count || 0),
        commentCount: Number(c.comment_count || 0),
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List watch content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch watch content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, videoUrl, thumbnailUrl, duration, genre, status, isPublic } = body;

    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, error: "Title and video URL required" },
        { status: 400 }
      );
    }

    const content = await sql`
      INSERT INTO watch_content (
        user_id, title, description, video_url, thumbnail_url, 
        duration, genre, status, is_public
      )
      VALUES (
        ${body.userId || null}, ${title}, ${description || null}, ${videoUrl}, 
        ${thumbnailUrl || null}, ${duration || null}, ${genre || null}, 
        ${status || 'published'}, ${isPublic ?? true}
      )
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      content: {
        id: content[0].id,
        title: content[0].title,
        description: content[0].description,
        videoUrl: content[0].video_url,
        thumbnailUrl: content[0].thumbnail_url,
        duration: content[0].duration,
        genre: content[0].genre,
        status: content[0].status,
        isPublic: content[0].is_public,
        createdAt: content[0].created_at,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create watch content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create watch content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, videoUrl, thumbnailUrl, duration, genre, status, isPublic } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Content ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE watch_content
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        video_url = COALESCE(${videoUrl}, video_url),
        thumbnail_url = COALESCE(${thumbnailUrl}, thumbnail_url),
        duration = COALESCE(${duration}, duration),
        genre = COALESCE(${genre}, genre),
        status = COALESCE(${status}, status),
        is_public = COALESCE(${isPublic}, is_public),
        updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Content not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      content: {
        id: updated[0].id,
        title: updated[0].title,
        description: updated[0].description,
        videoUrl: updated[0].video_url,
        thumbnailUrl: updated[0].thumbnail_url,
        duration: updated[0].duration,
        genre: updated[0].genre,
        status: updated[0].status,
        isPublic: updated[0].is_public,
        updatedAt: updated[0].updated_at,
      },
    });
  } catch (error) {
    console.error("Update watch content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update watch content" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Content ID required" },
        { status: 400 }
      );
    }

    // Soft delete
    await sql`
      UPDATE watch_content 
      SET deleted_at = NOW(), updated_at = NOW() 
      WHERE id = ${id} AND deleted_at IS NULL
    `;

    return NextResponse.json({
      success: true,
      message: "Content deleted",
    });
  } catch (error) {
    console.error("Delete watch content error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete watch content" },
      { status: 500 }
    );
  }
}