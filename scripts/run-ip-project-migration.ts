// Migration script to add IP Project format, genre & structure fields
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load from .env.local
dotenv.config({ path: '.env.local' });

async function migrate() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in .env.local!');
        process.exit(1);
    }

    console.log('🔄 Connecting to database...');
    const sql = neon(process.env.DATABASE_URL);

    try {
        console.log('\n📦 Adding Format & Duration fields...');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "medium_type" varchar(100)`;
        console.log('   ✅ medium_type added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "duration" varchar(50)`;
        console.log('   ✅ duration added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "custom_duration" integer`;
        console.log('   ✅ custom_duration added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "target_scenes" integer`;
        console.log('   ✅ target_scenes added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "episode_count" integer`;
        console.log('   ✅ episode_count added');

        console.log('\n📦 Adding Genre & Structure fields...');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "main_genre" varchar(100)`;
        console.log('   ✅ main_genre added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "theme" varchar(255)`;
        console.log('   ✅ theme added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "tone" varchar(100)`;
        console.log('   ✅ tone added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "core_conflict" varchar(100)`;
        console.log('   ✅ core_conflict added');

        await sql`ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "story_structure" varchar(100)`;
        console.log('   ✅ story_structure added');

        console.log('\n📦 Creating indexes...');

        await sql`CREATE INDEX IF NOT EXISTS "idx_projects_main_genre" ON "projects" ("main_genre")`;
        console.log('   ✅ idx_projects_main_genre created');

        await sql`CREATE INDEX IF NOT EXISTS "idx_projects_story_structure" ON "projects" ("story_structure")`;
        console.log('   ✅ idx_projects_story_structure created');

        console.log('\n✅ All IP Project fields migrations SUCCESS!');
    } catch (error: any) {
        console.error('❌ Migration FAILED:', error.message);
        process.exit(1);
    }
}

migrate();
