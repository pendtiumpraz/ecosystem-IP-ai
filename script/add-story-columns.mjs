import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function run() {
  console.log('Adding missing story columns...');
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS conflict_type VARCHAR(255)`;
    console.log('✓ Added conflict_type');
  } catch (e) {
    console.log('✗ conflict_type:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS intensity VARCHAR(50)`;
    console.log('✓ Added intensity');
  } catch (e) {
    console.log('✗ intensity:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS sub_theme VARCHAR(255)`;
    console.log('✓ Added sub_theme');
  } catch (e) {
    console.log('✗ sub_theme:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS moral_values TEXT`;
    console.log('✓ Added moral_values');
  } catch (e) {
    console.log('✗ moral_values:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS local_values TEXT`;
    console.log('✓ Added local_values');
  } catch (e) {
    console.log('✗ local_values:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS plot TEXT`;
    console.log('✓ Added plot');
  } catch (e) {
    console.log('✗ plot:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS twist TEXT`;
    console.log('✓ Added twist');
  } catch (e) {
    console.log('✗ twist:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS target_market VARCHAR(255)`;
    console.log('✓ Added target_market');
  } catch (e) {
    console.log('✗ target_market:', e.message);
  }
  
  try {
    await sql`ALTER TABLE stories ADD COLUMN IF NOT EXISTS generated_script TEXT`;
    console.log('✓ Added generated_script');
  } catch (e) {
    console.log('✗ generated_script:', e.message);
  }
  
  console.log('Done!');
}

run();
