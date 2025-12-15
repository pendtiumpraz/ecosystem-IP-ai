import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List published contents (public, no auth required)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const genre = searchParams.get("genre");
    const limit = parseInt(searchParams.get("limit") || "20");

    let contents;
    if (type && type !== "all") {
      contents = await sql`
        SELECT id, project_id, title, type, genre, rating, release_year, 
               duration_minutes, synopsis, poster_url, banner_url, status
        FROM contents 
        WHERE status = 'published' AND type = ${type}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      contents = await sql`
        SELECT id, project_id, title, type, genre, rating, release_year,
               duration_minutes, synopsis, poster_url, banner_url, status
        FROM contents 
        WHERE status = 'published'
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      success: true,
      contents: contents.map(c => ({
        id: c.id,
        projectId: c.project_id,
        title: c.title,
        type: c.type,
        genre: c.genre,
        rating: c.rating,
        releaseYear: c.release_year,
        durationMinutes: c.duration_minutes,
        synopsis: c.synopsis,
        posterUrl: c.poster_url,
        bannerUrl: c.banner_url,
      })),
    });
  } catch (error) {
    console.error("Fetch contents error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch contents" },
      { status: 500 }
    );
  }
}
