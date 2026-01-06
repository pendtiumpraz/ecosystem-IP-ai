// Run story versions migration - Fixed for VARCHAR id
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
    require('dotenv').config({ path: '.env.local' });

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL not found in environment');
        process.exit(1);
    }

    const sql = neon(databaseUrl);

    console.log('🔄 Running story_versions migration...\n');

    try {
        // Step 0: Check stories table structure
        console.log('0. Checking stories table structure...');
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'stories'
      ORDER BY ordinal_position
    `;
        console.log('   Stories table columns:');
        columns.slice(0, 10).forEach(c => console.log(`   - ${c.column_name}: ${c.data_type}`));
        console.log('   ...\n');

        // Step 1: Drop and recreate table with correct types
        console.log('1. Creating story_versions table (with VARCHAR ids to match stories)...');

        // Drop if exists to start fresh
        await sql`DROP TABLE IF EXISTS story_versions`;

        await sql`
      CREATE TABLE story_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        story_id VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        version_number INTEGER NOT NULL DEFAULT 1,
        version_name VARCHAR(255),
        is_active BOOLEAN DEFAULT FALSE,
        premise TEXT,
        synopsis TEXT,
        global_synopsis TEXT,
        genre VARCHAR(100),
        sub_genre VARCHAR(100),
        format VARCHAR(100),
        duration VARCHAR(100),
        tone VARCHAR(100),
        theme VARCHAR(255),
        conflict TEXT,
        target_audience VARCHAR(255),
        ending_type VARCHAR(100),
        structure VARCHAR(100),
        cat_beats JSONB DEFAULT '{}',
        hero_beats JSONB DEFAULT '{}',
        harmon_beats JSONB DEFAULT '{}',
        tension_levels JSONB DEFAULT '{}',
        want_need_matrix JSONB DEFAULT '{}',
        beat_characters JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_by VARCHAR(255),
        deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
      )
    `;
        console.log('   ✅ Table created\n');

        // Step 2: Migrate existing stories
        console.log('2. Migrating existing stories data...');

        await sql`
      INSERT INTO story_versions (
        story_id, project_id, version_number, version_name, is_active,
        premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
        tone, theme, target_audience, ending_type, structure,
        cat_beats, hero_beats, harmon_beats, tension_levels, want_need_matrix,
        created_at, updated_at
      )
      SELECT 
        id AS story_id, 
        project_id, 
        1 AS version_number, 
        COALESCE(structure, 'Save the Cat') || ' v1' AS version_name,
        TRUE AS is_active,
        premise, synopsis, global_synopsis, genre, sub_genre, format, duration,
        tone, theme, target_audience, ending_type,
        COALESCE(structure, 'Save the Cat') AS structure,
        CASE WHEN structure = 'Save the Cat' OR structure IS NULL 
             THEN COALESCE(structure_beats, '{}')::jsonb 
             ELSE '{}'::jsonb END AS cat_beats,
        CASE WHEN structure = 'The Hero''s Journey' 
             THEN COALESCE(structure_beats, '{}')::jsonb 
             ELSE '{}'::jsonb END AS hero_beats,
        CASE WHEN structure = 'Dan Harmon Story Circle' 
             THEN COALESCE(structure_beats, '{}')::jsonb 
             ELSE '{}'::jsonb END AS harmon_beats,
        COALESCE(tension_levels, '{}')::jsonb,
        COALESCE(want_need_matrix, '{}')::jsonb,
        created_at, updated_at
      FROM stories
    `;
        console.log('   ✅ Data migrated\n');

        // Step 3: Create indexes
        console.log('3. Creating indexes...');
        await sql`CREATE INDEX IF NOT EXISTS idx_story_versions_story ON story_versions(story_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_story_versions_project ON story_versions(project_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_story_versions_active ON story_versions(story_id, is_active) WHERE deleted_at IS NULL`;
        await sql`CREATE INDEX IF NOT EXISTS idx_story_versions_not_deleted ON story_versions(project_id) WHERE deleted_at IS NULL`;
        console.log('   ✅ Indexes created\n');

        // Step 4: Verify
        console.log('4. Verifying migration...');
        const count = await sql`SELECT COUNT(*) as count FROM story_versions WHERE deleted_at IS NULL`;
        console.log(`   ✅ Total story versions: ${count[0].count}\n`);

        // Show sample
        const sample = await sql`SELECT version_name, structure, premise FROM story_versions LIMIT 3`;
        if (sample.length > 0) {
            console.log('   Sample data:');
            sample.forEach((s, i) => {
                console.log(`   ${i + 1}. ${s.version_name} - ${(s.premise || 'No premise').substring(0, 50)}...`);
            });
        }

        console.log('\n🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
