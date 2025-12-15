import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

async function setupDatabase() {
  console.log("🔧 Setting up database schema...\n");

  // Create enums
  try {
    await sql`CREATE TYPE IF NOT EXISTS story_structure AS ENUM ('hero', 'cat', 'harmon', 'custom')`;
    await sql`CREATE TYPE IF NOT EXISTS story_format AS ENUM ('feature', 'series', 'short_movie', 'short_video')`;
    console.log("  ✅ Created story enums");
  } catch (e) {
    console.log("  ⚠️ Story enums might already exist");
  }

  // Create stories table
  await sql`
    CREATE TABLE IF NOT EXISTS stories (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      premise TEXT,
      synopsis TEXT,
      global_synopsis TEXT,
      format VARCHAR(50),
      duration VARCHAR(50),
      genre VARCHAR(100),
      sub_genre VARCHAR(100),
      tone VARCHAR(100),
      intensity VARCHAR(50),
      theme VARCHAR(255),
      sub_theme VARCHAR(255),
      moral_values TEXT,
      local_values TEXT,
      plot TEXT,
      structure VARCHAR(50) DEFAULT 'hero',
      structure_beats JSONB,
      key_actions JSONB,
      want_need_matrix JSONB,
      ending_type VARCHAR(100),
      twist TEXT,
      target_audience VARCHAR(255),
      target_market VARCHAR(255),
      generated_script TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("  ✅ Created stories table");

  // Create characters table
  await sql`
    CREATE TABLE IF NOT EXISTS characters (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      role VARCHAR(100),
      archetype VARCHAR(100),
      age VARCHAR(50),
      gender VARCHAR(50),
      description TEXT,
      personality_traits JSONB,
      backstory TEXT,
      goals TEXT,
      conflicts TEXT,
      relationships JSONB,
      visual_description TEXT,
      voice_description TEXT,
      reference_images JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("  ✅ Created characters table");

  // Create universes table
  await sql`
    CREATE TABLE IF NOT EXISTS universes (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      time_period VARCHAR(255),
      primary_locations JSONB,
      rules_and_systems JSONB,
      cultural_elements JSONB,
      technology_level TEXT,
      visual_style TEXT,
      reference_images JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("  ✅ Created universes table");

  // Create moodboards table
  await sql`
    CREATE TABLE IF NOT EXISTS moodboards (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      description TEXT,
      images JSONB,
      color_palette JSONB,
      style_notes TEXT,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("  ✅ Created moodboards table");

  // Create animations table
  await sql`
    CREATE TABLE IF NOT EXISTS animations (
      id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id VARCHAR(36) NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(100),
      description TEXT,
      video_url TEXT,
      thumbnail_url TEXT,
      duration INTEGER,
      status VARCHAR(50) DEFAULT 'draft',
      settings JSONB,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    )
  `;
  console.log("  ✅ Created animations table");

  console.log("\n✅ Database schema setup complete!");
}

setupDatabase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Setup failed:", err);
    process.exit(1);
  });
