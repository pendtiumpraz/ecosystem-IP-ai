import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function POST() {
  const results: string[] = [];
  
  try {
    // 1. Migrate characters.role from enum to VARCHAR
    results.push("=== MIGRATING characters.role ===");
    try {
      const checkRole = await sql`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'characters' AND column_name = 'role'
      `;
      
      if (checkRole[0]?.data_type === 'USER-DEFINED') {
        await sql`ALTER TABLE characters ALTER COLUMN role TYPE TEXT USING role::TEXT`;
        results.push("✓ Converted role from enum to TEXT");
        
        await sql`ALTER TABLE characters ALTER COLUMN role TYPE VARCHAR(100)`;
        results.push("✓ Converted role to VARCHAR(100)");
        
        try {
          await sql`DROP TYPE IF EXISTS character_role CASCADE`;
          results.push("✓ Dropped character_role enum");
        } catch (e: any) {
          results.push("⚠ Could not drop character_role enum: " + e.message);
        }
      } else {
        results.push("✓ Role already migrated");
      }
    } catch (e: any) {
      results.push("❌ Role migration error: " + e.message);
    }

    // 2. Migrate stories.structure from enum to VARCHAR
    results.push("\n=== MIGRATING stories.structure ===");
    try {
      const checkStructure = await sql`
        SELECT data_type FROM information_schema.columns 
        WHERE table_name = 'stories' AND column_name = 'structure'
      `;
      
      if (checkStructure[0]?.data_type === 'USER-DEFINED') {
        await sql`ALTER TABLE stories ALTER COLUMN structure TYPE TEXT USING structure::TEXT`;
        results.push("✓ Converted structure from enum to TEXT");
        
        await sql`ALTER TABLE stories ALTER COLUMN structure TYPE VARCHAR(100)`;
        results.push("✓ Converted structure to VARCHAR(100)");
        
        try {
          await sql`DROP TYPE IF EXISTS story_structure CASCADE`;
          results.push("✓ Dropped story_structure enum");
        } catch (e: any) {
          results.push("⚠ Could not drop story_structure enum: " + e.message);
        }
      } else {
        results.push("✓ Structure already migrated");
      }
    } catch (e: any) {
      results.push("❌ Structure migration error: " + e.message);
    }

    return NextResponse.json({ 
      success: true, 
      message: "All enum migrations completed",
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
    const enums = await sql`
      SELECT 
        c.table_name,
        c.column_name,
        c.data_type,
        c.udt_name
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' 
        AND c.data_type = 'USER-DEFINED'
        AND c.table_name IN ('characters', 'stories', 'universes')
      ORDER BY c.table_name, c.column_name
    `;
    
    return NextResponse.json({ 
      message: "User-defined (enum) columns that need migration",
      enums,
      needsMigration: enums.length > 0
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
