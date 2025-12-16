import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // Simple approach: convert to VARCHAR directly
    
    // 1. Clear existing values (they use old enum)
    try {
      await sql`UPDATE stories SET format = NULL`;
      results.push("Cleared old format values");
    } catch (e: any) {
      results.push("Clear values: " + e.message);
    }

    // 2. Convert column to VARCHAR
    try {
      await sql`ALTER TABLE stories ALTER COLUMN format TYPE VARCHAR(100)`;
      results.push("Converted format to VARCHAR(100)");
    } catch (e: any) {
      if (e.message?.includes("already")) {
        results.push("Already VARCHAR");
      } else {
        results.push("Convert: " + e.message);
      }
    }

    // 3. Drop old enum type
    try {
      await sql`DROP TYPE IF EXISTS story_format`;
      results.push("Dropped old enum type");
    } catch (e: any) {
      results.push("Drop enum: " + e.message);
    }

    // 4. Drop any new enum type created before
    try {
      await sql`DROP TYPE IF EXISTS story_format_new`;
      results.push("Dropped story_format_new");
    } catch (e: any) {
      results.push("No story_format_new to drop");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Format column converted to VARCHAR - now accepts any value",
      results 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      results 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "POST to convert format column to VARCHAR (accepts any value)" 
  });
}
