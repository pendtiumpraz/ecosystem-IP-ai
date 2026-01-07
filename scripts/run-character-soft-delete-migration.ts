// Migration script to add deleted_at column to characters table
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
        console.log('🔄 Adding deleted_at column to characters table...');
        await sql`ALTER TABLE characters ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
        console.log('✅ deleted_at column added to characters.');

        console.log('🔄 Creating index for performance...');
        await sql`CREATE INDEX IF NOT EXISTS idx_characters_deleted ON characters(deleted_at)`;
        console.log('✅ Index created.');

        console.log('✅ Character soft delete migration SUCCESS!');
    } catch (error: any) {
        console.error('❌ Migration FAILED:', error.message);
        process.exit(1);
    }
}

migrate();
