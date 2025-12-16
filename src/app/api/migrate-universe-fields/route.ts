import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // Migrate environment from JSONB to TEXT
    results.push("=== MIGRATING universes.environment ===");
    try {
      const checkEnv = await sql`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'universes' AND column_name = 'environment'
      `;
      
      if (checkEnv[0]?.data_type === 'jsonb') {
        // Convert JSONB to TEXT
        await sql`ALTER TABLE universes ALTER COLUMN environment TYPE TEXT USING environment::TEXT`;
        results.push("✓ Converted environment from JSONB to TEXT");
      } else {
        results.push("✓ Environment already TEXT");
      }
    } catch (e: any) {
      results.push("❌ Environment migration error: " + e.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Universe fields migrated successfully",
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
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'universes' 
        AND column_name IN ('environment', 'society', 'government', 'economy', 'culture', 'private_life')
      ORDER BY column_name
    `;
    
    return NextResponse.json({ 
      message: "Universe text fields status",
      columns: check
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
