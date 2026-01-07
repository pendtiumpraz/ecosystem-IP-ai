import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET - Get universe for story version
// PUT - Save/update universe for story version

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, versionId } = await params;

        // Get universe for this story version
        const universe = await sql`
          SELECT * FROM universe_versions
          WHERE story_version_id = ${versionId}
          LIMIT 1
        `;

        if (universe.length === 0) {
            // No universe yet - return empty
            return NextResponse.json({
                universe: null,
                message: "No universe found for this story version"
            });
        }

        return NextResponse.json({
            universe: mapUniverseToResponse(universe[0]),
        });
    } catch (error) {
        console.error("Error fetching universe:", error);
        return NextResponse.json(
            { error: "Failed to fetch universe" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId, versionId } = await params;
        const body = await request.json();

        // Check if universe exists for this story version
        const existing = await sql`
          SELECT id FROM universe_versions 
          WHERE story_version_id = ${versionId}
        `;

        if (existing.length === 0) {
            // Create new universe
            const result = await sql`
              INSERT INTO universe_versions (
                story_version_id, project_id,
                universe_name, period,
                room_cave, house_castle, private_interior,
                family_inner_circle, neighborhood_environment,
                town_district_city, working_office_school,
                country, government_system,
                labor_law, rules_of_work,
                society_and_system, sociocultural_system,
                environment_landscape, sociopolitic_economy, kingdom_tribe_communal
              ) VALUES (
                ${versionId}, ${projectId},
                ${body.universeName || null}, ${body.period || null},
                ${body.roomCave || null}, ${body.houseCastle || null}, ${body.privateInterior || null},
                ${body.familyInnerCircle || null}, ${body.neighborhoodEnvironment || null},
                ${body.townDistrictCity || null}, ${body.workingOfficeSchool || null},
                ${body.country || null}, ${body.governmentSystem || null},
                ${body.laborLaw || null}, ${body.rulesOfWork || null},
                ${body.societyAndSystem || null}, ${body.socioculturalSystem || null},
                ${body.environmentLandscape || null}, ${body.sociopoliticEconomy || null}, ${body.kingdomTribeCommunal || null}
              )
              RETURNING *
            `;

            return NextResponse.json({
                success: true,
                universe: mapUniverseToResponse(result[0]),
                created: true
            });
        } else {
            // Update existing universe
            const result = await sql`
              UPDATE universe_versions SET
                universe_name = ${body.universeName || null},
                period = ${body.period || null},
                room_cave = ${body.roomCave || null},
                house_castle = ${body.houseCastle || null},
                private_interior = ${body.privateInterior || null},
                family_inner_circle = ${body.familyInnerCircle || null},
                neighborhood_environment = ${body.neighborhoodEnvironment || null},
                town_district_city = ${body.townDistrictCity || null},
                working_office_school = ${body.workingOfficeSchool || null},
                country = ${body.country || null},
                government_system = ${body.governmentSystem || null},
                labor_law = ${body.laborLaw || null},
                rules_of_work = ${body.rulesOfWork || null},
                society_and_system = ${body.societyAndSystem || null},
                sociocultural_system = ${body.socioculturalSystem || null},
                environment_landscape = ${body.environmentLandscape || null},
                sociopolitic_economy = ${body.sociopoliticEconomy || null},
                kingdom_tribe_communal = ${body.kingdomTribeCommunal || null},
                updated_at = NOW()
              WHERE story_version_id = ${versionId}
              RETURNING *
            `;

            return NextResponse.json({
                success: true,
                universe: mapUniverseToResponse(result[0]),
                updated: true
            });
        }
    } catch (error) {
        console.error("Error saving universe:", error);
        return NextResponse.json(
            { error: "Failed to save universe" },
            { status: 500 }
        );
    }
}

// Helper to map database row to response object
function mapUniverseToResponse(row: any) {
    return {
        id: row.id,
        storyVersionId: row.story_version_id,
        projectId: row.project_id,
        // Identity
        universeName: row.universe_name,
        period: row.period,
        // Level 1: Private Interior
        roomCave: row.room_cave,
        houseCastle: row.house_castle,
        privateInterior: row.private_interior,
        // Level 2: Family
        familyInnerCircle: row.family_inner_circle,
        // Level 3: Neighborhood
        neighborhoodEnvironment: row.neighborhood_environment,
        // Level 4: City
        townDistrictCity: row.town_district_city,
        workingOfficeSchool: row.working_office_school,
        // Level 5: Government
        country: row.country,
        governmentSystem: row.government_system,
        // Level 6: Law & Rules
        laborLaw: row.labor_law,
        rulesOfWork: row.rules_of_work,
        // Level 7: Culture
        societyAndSystem: row.society_and_system,
        socioculturalSystem: row.sociocultural_system,
        // Level 8: World
        environmentLandscape: row.environment_landscape,
        sociopoliticEconomy: row.sociopolitic_economy,
        kingdomTribeCommunal: row.kingdom_tribe_communal,
        // Timestamps
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}
