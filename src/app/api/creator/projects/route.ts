import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List projects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID required" },
        { status: 400 }
      );
    }

    let projects;
    if (status && status !== "all") {
      projects = await sql`
        SELECT * FROM projects 
        WHERE user_id = ${userId} AND status = ${status} AND deleted_at IS NULL
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      projects = await sql`
        SELECT * FROM projects 
        WHERE user_id = ${userId} AND deleted_at IS NULL
        ORDER BY updated_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const countResult = await sql`
      SELECT COUNT(*) as count FROM projects WHERE user_id = ${userId} AND deleted_at IS NULL
    `;

    return NextResponse.json({
      success: true,
      projects: projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        thumbnailUrl: p.thumbnail_url,
        coverImage: p.cover_image,
        genre: p.genre,
        mainGenre: p.main_genre,
        subGenre: p.sub_genre,
        status: p.status,
        studioName: p.studio_name,
        ipOwner: p.ip_owner,
        isPublic: p.is_public,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      })),
      total: Number(countResult[0]?.count || 0),
    });
  } catch (error) {
    console.error("List projects error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST - Create project
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, title, description, genre, subGenre, studioName, ipOwner } = body;

    if (!userId || !title) {
      return NextResponse.json(
        { success: false, error: "User ID and title required" },
        { status: 400 }
      );
    }

    const newProject = await sql`
      INSERT INTO projects (user_id, title, description, genre, sub_genre, studio_name, ip_owner, status)
      VALUES (${userId}, ${title}, ${description || null}, ${genre || null}, ${subGenre || null}, ${studioName || null}, ${ipOwner || null}, 'draft')
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      project: {
        id: newProject[0].id,
        title: newProject[0].title,
        description: newProject[0].description,
        genre: newProject[0].genre,
        subGenre: newProject[0].sub_genre,
        status: newProject[0].status,
        createdAt: newProject[0].created_at,
      },
    });
  } catch (error) {
    console.error("Create project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create project" },
      { status: 500 }
    );
  }
}

// PUT - Update project
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, userId, title, description, genre, subGenre, status, studioName, ipOwner, isPublic } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, error: "Project ID and User ID required" },
        { status: 400 }
      );
    }

    const updated = await sql`
      UPDATE projects 
      SET 
        title = COALESCE(${title}, title),
        description = COALESCE(${description}, description),
        genre = COALESCE(${genre}, genre),
        sub_genre = COALESCE(${subGenre}, sub_genre),
        status = COALESCE(${status}, status),
        studio_name = COALESCE(${studioName}, studio_name),
        ip_owner = COALESCE(${ipOwner}, ip_owner),
        is_public = COALESCE(${isPublic}, is_public),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      project: updated[0],
    });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update project" },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete project
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { success: false, error: "Project ID and User ID required" },
        { status: 400 }
      );
    }

    // SOFT DELETE - set deleted_at timestamp instead of actual delete
    const deleted = await sql`
      UPDATE projects 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
      RETURNING id
    `;

    if (deleted.length === 0) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
