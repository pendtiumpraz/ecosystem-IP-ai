const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS universe_field_images (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL,
        story_id UUID,
        field_key VARCHAR(100) NOT NULL,
        level_number INTEGER NOT NULL DEFAULT 0,
        version_number INTEGER NOT NULL DEFAULT 1,
        image_url TEXT,
        thumbnail_url TEXT,
        enhanced_prompt TEXT,
        original_description TEXT,
        style VARCHAR(100),
        model_used VARCHAR(100),
        provider VARCHAR(100),
        credit_cost INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        deleted_at TIMESTAMP
      )
    `;
    console.log('Table created successfully');

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_universe_images_project ON universe_field_images(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_universe_images_story ON universe_field_images(story_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_universe_images_field ON universe_field_images(field_key)`;

    console.log('Indexes created successfully');

    // Create prompts table
    await sql`
          CREATE TABLE IF NOT EXISTS universe_field_prompts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL,
            story_id UUID,
            field_key VARCHAR(100) NOT NULL,
            level_number INTEGER NOT NULL DEFAULT 0,
            enhanced_prompt TEXT,
            prompt_reference TEXT,
            original_description TEXT,
            model_used VARCHAR(100),
            provider VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          )
        `;
    console.log('Prompts table created successfully');

    await sql`CREATE INDEX IF NOT EXISTS idx_universe_prompts_project ON universe_field_prompts(project_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_universe_prompts_story ON universe_field_prompts(story_id)`;

    console.log('Migration completed!');
  } catch (error) {
    console.error('Migration error:', error.message);
  }
}

runMigration();
