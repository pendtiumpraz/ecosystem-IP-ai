import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  try {
    // Check universes table columns
    const universeColumns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'universes'
      ORDER BY ordinal_position
    `;
    
    // Check characters table columns
    const characterColumns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'characters'
      ORDER BY ordinal_position
    `;

    // Check stories table columns
    const storyColumns = await sql`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_name = 'stories'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({ 
      universes: universeColumns,
      characters: characterColumns,
      stories: storyColumns
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
