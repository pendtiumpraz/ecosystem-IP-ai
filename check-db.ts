import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

async function checkAI() {
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.slice(0, 50) + '...');
    console.log('\nChecking AI Active Models...\n');

    const models = await sql`
    SELECT 
      am.subcategory, 
      m.name as model_name, 
      m.model_id,
      p.name as provider_name
    FROM ai_active_models am 
    JOIN ai_models m ON am.model_id = m.id 
    JOIN ai_providers p ON m.provider_id = p.id
  `;

    console.log('Active Models:');
    models.forEach(m => {
        console.log(`  ${m.subcategory}: ${m.provider_name} / ${m.model_id}`);
    });

    // Check for text/llm model specifically
    const textModel = models.find(m => m.subcategory === 'text' || m.subcategory === 'llm');
    if (textModel) {
        console.log('\n✅ Text/LLM model configured:', textModel.provider_name, '/', textModel.model_id);
    } else {
        console.log('\n❌ No text/LLM model configured!');
    }
}

checkAI().catch(console.error);
