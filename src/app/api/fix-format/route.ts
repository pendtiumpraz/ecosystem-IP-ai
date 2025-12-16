import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // Check current column type
    const columnInfo = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'stories' AND column_name = 'format'
    `;
    results.push("Current column type: " + JSON.stringify(columnInfo[0] || "not found"));
    
    // 1. If it's an enum, convert to TEXT first
    if (columnInfo[0]?.data_type === 'USER-DEFINED') {
      try {
        await sql`ALTER TABLE stories ALTER COLUMN format TYPE TEXT USING format::TEXT`;
        results.push("Converted from enum to TEXT");
      } catch (e: any) {
        results.push("Enum to TEXT: " + e.message);
      }
    }
    
    // 2. Convert to VARCHAR if not already
    try {
      await sql`ALTER TABLE stories ALTER COLUMN format TYPE VARCHAR(100)`;
      results.push("Converted to VARCHAR(100)");
    } catch (e: any) {
      if (e.message?.includes("already")) {
        results.push("Already VARCHAR");
      } else {
        results.push("To VARCHAR: " + e.message);
      }
    }

    // 3. Drop old enum types
    try {
      await sql`DROP TYPE IF EXISTS story_format CASCADE`;
      results.push("Dropped story_format enum");
    } catch (e: any) {
      results.push("Drop story_format: " + e.message);
    }
    
    try {
      await sql`DROP TYPE IF EXISTS story_format_new CASCADE`;
      results.push("Dropped story_format_new");
    } catch (e: any) {
      // Ignore
    }

    // 4. Verify final state
    const finalInfo = await sql`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'stories' AND column_name = 'format'
    `;
    results.push("Final column: " + JSON.stringify(finalInfo[0] || "not found"));

    return NextResponse.json({ 
      success: true, 
      message: "Format column migration complete",
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
  try {
    // Check current column type
    const columnInfo = await sql`
      SELECT column_name, data_type, udt_name, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name = 'stories' AND column_name = 'format'
    `;
    
    // Check sample data
    const sampleData = await sql`
      SELECT id, project_id, format FROM stories LIMIT 5
    `;
    
    return NextResponse.json({ 
      message: "Format column status",
      columnInfo: columnInfo[0] || "not found",
      sampleData,
      needsMigration: columnInfo[0]?.data_type === 'USER-DEFINED'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
