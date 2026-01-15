import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkMoodboard() {
  const sql = neon(process.env.DATABASE_URL!);

  // Get moodboard v3
  const moodboards = await sql`
        SELECT id, version_name, version_number
        FROM moodboards 
        WHERE version_number = 3
        ORDER BY created_at DESC
        LIMIT 1
    `;

  if (moodboards[0]) {
    // Get first 3 items with both desc and prompt
    const items = await sql`
            SELECT id, beat_key, beat_label, key_action_index, 
                   key_action_description,
                   prompt
            FROM moodboard_items
            WHERE moodboard_id = ${moodboards[0].id}
              AND key_action_description IS NOT NULL
              AND prompt IS NOT NULL
            ORDER BY beat_index, key_action_index
            LIMIT 3
        `;

    console.log('=== SYNC CHECK: Key Action vs Prompt ===\n');
    items.forEach((item: any, i: number) => {
      console.log(`\n--- ${item.beat_label} #${item.key_action_index} ---`);
      console.log(`KEY ACTION:`);
      console.log(item.key_action_description?.substring(0, 250));
      console.log(`\nPROMPT (should reflect above action):`);
      console.log(item.prompt?.substring(0, 250));
      console.log('\n---\n');
    });
  }
}

checkMoodboard().catch(console.error);
