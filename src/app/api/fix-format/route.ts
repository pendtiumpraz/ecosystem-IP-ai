import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // 1. Create new enum with correct values matching frontend
    try {
      await sql`
        CREATE TYPE story_format_new AS ENUM (
          'feature-film',
          'short-film', 
          'series-episodic',
          'series-serial',
          'limited-series',
          'web-series',
          'anime',
          'documentary'
        )
      `;
      results.push("Created new enum story_format_new");
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        results.push("Enum story_format_new already exists");
      } else {
        throw e;
      }
    }

    // 2. Drop default if exists
    try {
      await sql`ALTER TABLE stories ALTER COLUMN format DROP DEFAULT`;
      results.push("Dropped default");
    } catch (e) {
      results.push("No default to drop");
    }

    // 3. Convert column to new enum (set old values to null first)
    try {
      await sql`UPDATE stories SET format = NULL WHERE format IS NOT NULL`;
      results.push("Cleared old format values");
    } catch (e) {
      results.push("No values to clear");
    }

    // 4. Change column type
    try {
      await sql`ALTER TABLE stories ALTER COLUMN format TYPE story_format_new USING NULL`;
      results.push("Changed column to new enum type");
    } catch (e: any) {
      // Try dropping old enum and renaming
      try {
        await sql`ALTER TABLE stories ALTER COLUMN format TYPE VARCHAR(100)`;
        await sql`DROP TYPE IF EXISTS story_format`;
        await sql`ALTER TYPE story_format_new RENAME TO story_format`;
        await sql`ALTER TABLE stories ALTER COLUMN format TYPE story_format USING format::story_format`;
        results.push("Converted via VARCHAR workaround");
      } catch (e2: any) {
        results.push("Column conversion: " + e2.message);
      }
    }

    // 5. Try to drop old enum
    try {
      await sql`DROP TYPE IF EXISTS story_format CASCADE`;
      results.push("Dropped old enum");
    } catch (e) {
      results.push("Could not drop old enum");
    }

    // 6. Rename new enum to standard name
    try {
      await sql`ALTER TYPE story_format_new RENAME TO story_format`;
      results.push("Renamed enum to story_format");
    } catch (e) {
      results.push("Enum already named correctly");
    }

    return NextResponse.json({ 
      success: true, 
      message: "Format enum updated",
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
    message: "POST to fix format enum. New values: feature-film, short-film, series-episodic, series-serial, limited-series, web-series, anime, documentary" 
  });
}
