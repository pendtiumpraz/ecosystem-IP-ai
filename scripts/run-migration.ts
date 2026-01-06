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
    console.log('✅ Migration SUCCESS! character_relations column added to stories table.');
  } catch (error: any) {
    console.error('❌ Migration FAILED:', error.message);
    process.exit(1);
  }
}

migrate();
