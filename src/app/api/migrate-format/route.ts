import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // Step 1: Check current column type
    const check = await sql`
      SELECT data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'stories' AND column_name = 'format'
    `;
    results.push(`Current type: ${check[0]?.data_type} (${check[0]?.udt_name})`);
    
    if (check[0]?.data_type === 'USER-DEFINED') {
      // Step 2: Convert enum to TEXT first
      await sql`ALTER TABLE stories ALTER COLUMN format TYPE TEXT USING format::TEXT`;
      results.push("✓ Converted from enum to TEXT");
    }
    
    // Step 3: Convert to VARCHAR(100)
    await sql`ALTER TABLE stories ALTER COLUMN format TYPE VARCHAR(100)`;
    results.push("✓ Converted to VARCHAR(100)");
    
    // Step 4: Drop old enum type
    try {
      await sql`DROP TYPE IF EXISTS story_format CASCADE`;
      results.push("✓ Dropped old enum type");
    } catch (e: any) {
      results.push("⚠ Could not drop enum: " + e.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Format column migrated successfully",
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
    const check = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'stories' AND column_name = 'format'
    `;
    
    return NextResponse.json({ 
      message: "Format column status",
      column: check[0] || "not found",
      needsMigration: check[0]?.data_type === 'USER-DEFINED'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
