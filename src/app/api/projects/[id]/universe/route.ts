import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// GET universe formula
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns the project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const universe = await sql`
    SELECT * FROM universe_formulas WHERE project_id = ${id}
  `;

  return NextResponse.json(universe[0] || null);
}

// POST/PUT universe formula
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  // Verify user owns the project
  const project = await sql`
    SELECT id FROM projects 
    WHERE id = ${id} AND user_id = ${userId} AND deleted_at IS NULL
  `;

  if (project.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const data = await request.json();
  
  // Check if universe exists
  const existing = await sql`
    SELECT id FROM universe_formulas WHERE project_id = ${id}
  `;

  if (existing.length > 0) {
    // Update
    const updated = await sql`
      UPDATE universe_formulas SET
        working_office_school = ${data.workingOfficeSchool || null},
        town_district_city = ${data.townDistrictCity || null},
        neighborhood_environment = ${data.neighborhoodEnvironment || null},
        rules_of_work = ${data.rulesOfWork || null},
        labor_law = ${data.laborLaw || null},
        country = ${data.country || null},
        government_system = ${data.governmentSystem || null},
        universe_name = ${data.universeName || null},
        period = ${data.period || null},
        environment_landscape = ${data.environmentLandscape || null},
        society_and_system = ${data.societyAndSystem || null},
        private_interior = ${data.privateInterior || null},
        sociopolitic_economy = ${data.sociopoliticEconomy || null},
        sociocultural_system = ${data.socioculturalSystem || null},
        house_castle = ${data.houseCastle || null},
        room_cave = ${data.roomCave || null},
        family_inner_circle = ${data.familyInnerCircle || null},
        kingdom_tribe_communal = ${data.kingdomTribeCommunal || null},
        updated_at = NOW()
      WHERE id = ${existing[0].id}
      RETURNING *
    `;
    return NextResponse.json(updated[0]);
  } else {
    // Create
    const created = await sql`
      INSERT INTO universe_formulas (
        project_id,
        working_office_school, town_district_city, neighborhood_environment,
        rules_of_work, labor_law, country, government_system,
        universe_name, period,
        environment_landscape, society_and_system, private_interior,
        sociopolitic_economy, sociocultural_system,
        house_castle, room_cave, family_inner_circle, kingdom_tribe_communal
      )
      VALUES (
        ${id},
        ${data.workingOfficeSchool || null}, ${data.townDistrictCity || null}, ${data.neighborhoodEnvironment || null},
        ${data.rulesOfWork || null}, ${data.laborLaw || null}, ${data.country || null}, ${data.governmentSystem || null},
        ${data.universeName || null}, ${data.period || null},
        ${data.environmentLandscape || null}, ${data.societyAndSystem || null}, ${data.privateInterior || null},
        ${data.sociopoliticEconomy || null}, ${data.socioculturalSystem || null},
        ${data.houseCastle || null}, ${data.roomCave || null}, ${data.familyInnerCircle || null}, ${data.kingdomTribeCommunal || null}
      )
      RETURNING *
    `;
    return NextResponse.json(created[0]);
  }
}
