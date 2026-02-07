const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runStatement(name, statement) {
    try {
        await sql(statement);
        console.log(`   ✅ ${name}`);
        return true;
    } catch (err) {
        if (err.message.includes('already exists')) {
            console.log(`   ⏭️  ${name} (already exists)`);
            return true;
        }
        console.log(`   ❌ ${name}: ${err.message}`);
        return false;
    }
}

async function main() {
    console.log('🚀 Running Storyboard Migrations (Step by Step)...\n');

    // 1. scene_image_versions table
    console.log('📦 scene_image_versions:');
    await runStatement('CREATE TABLE', `
    CREATE TABLE IF NOT EXISTS scene_image_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      thumbnail_url TEXT,
      prompt TEXT,
      provider VARCHAR(100),
      model VARCHAR(100),
      credit_cost INTEGER DEFAULT 0,
      generation_mode VARCHAR(50) DEFAULT 'i2i',
      reference_images JSONB DEFAULT '[]',
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP,
      UNIQUE(scene_id, version_number)
    )
  `);
    await runStatement('INDEX scene', `CREATE INDEX IF NOT EXISTS idx_scene_image_versions_scene ON scene_image_versions(scene_id, version_number)`);
    await runStatement('INDEX active', `CREATE INDEX IF NOT EXISTS idx_scene_image_versions_active ON scene_image_versions(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL`);

    // 2. scene_script_versions table
    console.log('\n📦 scene_script_versions:');
    await runStatement('CREATE TABLE', `
    CREATE TABLE IF NOT EXISTS scene_script_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
      version_number INTEGER NOT NULL,
      script_content TEXT NOT NULL,
      word_count INTEGER DEFAULT 0,
      dialogue_count INTEGER DEFAULT 0,
      context_snapshot JSONB DEFAULT '{}',
      provider VARCHAR(100),
      model VARCHAR(100),
      credit_cost INTEGER DEFAULT 0,
      prompt TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      is_manual_edit BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP,
      UNIQUE(scene_id, version_number)
    )
  `);
    await runStatement('INDEX scene', `CREATE INDEX IF NOT EXISTS idx_scene_script_versions_scene ON scene_script_versions(scene_id, version_number)`);
    await runStatement('INDEX active', `CREATE INDEX IF NOT EXISTS idx_scene_script_versions_active ON scene_script_versions(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL`);

    // 3. scene_clips table
    console.log('\n📦 scene_clips:');
    await runStatement('CREATE TABLE', `
    CREATE TABLE IF NOT EXISTS scene_clips (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      scene_id UUID NOT NULL REFERENCES scene_plots(id) ON DELETE CASCADE,
      shot_id UUID REFERENCES scene_shots(id) ON DELETE SET NULL,
      image_version_id UUID REFERENCES scene_image_versions(id) ON DELETE SET NULL,
      version_number INTEGER NOT NULL,
      video_url TEXT,
      thumbnail_url TEXT,
      duration INTEGER,
      camera_movement VARCHAR(50),
      movement_direction VARCHAR(50),
      movement_speed VARCHAR(50) DEFAULT 'normal',
      prompt TEXT,
      seed_prompt_data JSONB DEFAULT '{}',
      provider VARCHAR(100) DEFAULT 'seedance',
      model VARCHAR(100),
      credit_cost INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'pending',
      error_message TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      deleted_at TIMESTAMP,
      UNIQUE(scene_id, version_number)
    )
  `);
    await runStatement('INDEX scene', `CREATE INDEX IF NOT EXISTS idx_scene_clips_scene ON scene_clips(scene_id, version_number)`);
    await runStatement('INDEX shot', `CREATE INDEX IF NOT EXISTS idx_scene_clips_shot ON scene_clips(shot_id)`);
    await runStatement('INDEX active', `CREATE INDEX IF NOT EXISTS idx_scene_clips_active ON scene_clips(scene_id, is_active) WHERE is_active = TRUE AND deleted_at IS NULL`);

    // 4. Add storyboard_config to projects
    console.log('\n📦 projects.storyboard_config:');
    await runStatement('ADD COLUMN', `ALTER TABLE projects ADD COLUMN IF NOT EXISTS storyboard_config JSONB DEFAULT '{}'`);

    // 5. Add deleted_at to scene_shots if not exists
    console.log('\n📦 scene_shots.deleted_at:');
    await runStatement('ADD COLUMN', `ALTER TABLE scene_shots ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`);

    // Verify
    console.log('\n🔍 Verifying tables...');
    const tables = await sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'scene_%'
    ORDER BY table_name
  `;
    console.log('   Tables:', tables.map(t => t.table_name).join(', '));

    console.log('\n✨ Migrations complete!');
}

main().catch(console.error);
