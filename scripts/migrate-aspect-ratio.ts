import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function migrate() {
    const sql = neon(process.env.DATABASE_URL!);

    try {
        await sql`ALTER TABLE moodboards ADD COLUMN IF NOT EXISTS aspect_ratio VARCHAR(20) DEFAULT '16:9'`;
        console.log('✅ Added aspect_ratio column to moodboards table');
    } catch (error: any) {
        if (error.message?.includes('already exists')) {
            console.log('Column already exists, skipping');
        } else {
            throw error;
        }
    }
}

migrate().catch(console.error);
