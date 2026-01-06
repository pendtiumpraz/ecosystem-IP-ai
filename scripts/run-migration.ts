// Migration script to add character_relations column
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
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS character_relations jsonb DEFAULT '[]'`;
    console.log('✅ character_relations column added.');

    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS tension_levels jsonb DEFAULT '{}'`;
    console.log('✅ tension_levels column added (for Arc View graph).');

    console.log('✅ All migrations SUCCESS!');
  } catch (error: any) {
    console.error('❌ Migration FAILED:', error.message);
    process.exit(1);
  }
}

migrate();
