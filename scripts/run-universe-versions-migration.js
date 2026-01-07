/**
 * Universe Versions Migration Script
 * Creates universe_versions table linked to story_versions
 * Each story version can have its own universe
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment');
        process.exit(1);
    }

    const sql = neon(process.env.DATABASE_URL);

    console.log('🚀 Starting Universe Versions Migration...\n');

    try {
        // Step 1: Create universe_versions table
        console.log('1. Creating universe_versions table...');

        await sql`
      CREATE TABLE IF NOT EXISTS universe_versions (
        id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
        story_version_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        
        -- Identity (Center)
        universe_name TEXT,
        period TEXT,
        
        -- Level 1: Private Interior
        room_cave TEXT,
        house_castle TEXT,
        private_interior TEXT,
        
        -- Level 2: Family
        family_inner_circle TEXT,
        
        -- Level 3: Neighborhood
        neighborhood_environment TEXT,
        
        -- Level 4: City
        town_district_city TEXT,
        working_office_school TEXT,
        
        -- Level 5: Government
        country TEXT,
        government_system TEXT,
        
        -- Level 6: Law & Rules
        labor_law TEXT,
        rules_of_work TEXT,
        
        -- Level 7: Culture
        society_and_system TEXT,
        sociocultural_system TEXT,
        
        -- Level 8: World
        environment_landscape TEXT,
        sociopolitic_economy TEXT,
        kingdom_tribe_communal TEXT,
        
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
        console.log('   ✅ Table created\n');

        // Step 2: Create indexes
        console.log('2. Creating indexes...');

        await sql`
      CREATE INDEX IF NOT EXISTS idx_universe_story_version 
      ON universe_versions(story_version_id)
    `;

        await sql`
      CREATE INDEX IF NOT EXISTS idx_universe_project 
      ON universe_versions(project_id)
    `;
        console.log('   ✅ Indexes created\n');

        // Step 3: Migrate existing universe data from projects table (if exists)
        console.log('3. Checking for existing universe data to migrate...');

        try {
            // Check if there's universe data in projects table
            const projectsWithUniverse = await sql`
              SELECT p.id as project_id, p.universe
              FROM projects p
              WHERE p.universe IS NOT NULL AND p.universe != '{}'::jsonb
            `;

            if (projectsWithUniverse.length > 0) {
                console.log(`   Found ${projectsWithUniverse.length} projects with universe data`);

                for (const project of projectsWithUniverse) {
                    // Get the first active story version for this project
                    const storyVersion = await sql`
                      SELECT id FROM story_versions 
                      WHERE project_id = ${project.project_id} 
                      AND is_active = TRUE 
                      AND deleted_at IS NULL
                      LIMIT 1
                    `;

                    if (storyVersion.length > 0) {
                        const universe = project.universe || {};

                        // Check if universe already exists for this story version
                        const existing = await sql`
                          SELECT id FROM universe_versions 
                          WHERE story_version_id = ${storyVersion[0].id}
                        `;

                        if (existing.length === 0) {
                            await sql`
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
                                ${storyVersion[0].id}, ${project.project_id},
                                ${universe.universeName || null}, ${universe.period || null},
                                ${universe.roomCave || null}, ${universe.houseCastle || null}, ${universe.privateInterior || null},
                                ${universe.familyInnerCircle || null}, ${universe.neighborhoodEnvironment || null},
                                ${universe.townDistrictCity || null}, ${universe.workingOfficeSchool || null},
                                ${universe.country || null}, ${universe.governmentSystem || null},
                                ${universe.laborLaw || null}, ${universe.rulesOfWork || null},
                                ${universe.societyAndSystem || null}, ${universe.socioculturalSystem || null},
                                ${universe.environmentLandscape || null}, ${universe.sociopoliticEconomy || null}, ${universe.kingdomTribeCommunal || null}
                              )
                            `;
                            console.log(`   ✅ Migrated universe for project ${project.project_id}`);
                        } else {
                            console.log(`   ⏭️ Universe already exists for story version ${storyVersion[0].id}`);
                        }
                    }
                }
            } else {
                console.log('   No existing universe data to migrate');
            }
        } catch (migrationError) {
            // projects table might not have universe column - that's OK
            console.log('   No universe column in projects table - skipping migration');
        }
        console.log('   ✅ Migration step complete\n');

        // Step 4: Verify
        console.log('4. Verifying migration...');
        const count = await sql`SELECT COUNT(*) as count FROM universe_versions`;
        console.log(`   ✅ Total universe versions: ${count[0].count}\n`);

        console.log('🎉 Universe Versions Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
