require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
    console.log('Creating cover_versions table...');

    await sql`
    CREATE TABLE IF NOT EXISTS cover_versions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id TEXT NOT NULL,
      version_number INTEGER NOT NULL DEFAULT 1,
      image_url TEXT NOT NULL,
      thumbnail_url TEXT,
      prompt TEXT,
      style TEXT,
      resolution TEXT,
      width INTEGER,
      height INTEGER,
      generation_mode TEXT DEFAULT 'text2image',
      reference_image_url TEXT,
      is_active BOOLEAN DEFAULT FALSE,
      provider TEXT,
      credit_cost INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      deleted_at TIMESTAMP WITH TIME ZONE
    )
  `;

    console.log('Creating indexes...');

    // Index for project lookup
    await sql`
    CREATE INDEX IF NOT EXISTS idx_cover_versions_project_id 
    ON cover_versions(project_id) 
    WHERE deleted_at IS NULL
  `;

    // Index for active version
    await sql`
    CREATE INDEX IF NOT EXISTS idx_cover_versions_active 
    ON cover_versions(project_id, is_active) 
    WHERE deleted_at IS NULL AND is_active = TRUE
  `;

    console.log('Migration completed successfully!');
}

migrate().catch(console.error);
