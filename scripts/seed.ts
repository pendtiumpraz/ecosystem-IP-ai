import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as dotenv from "dotenv";
import * as bcrypt from "bcryptjs";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Starting database seed...\n");

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash("demo123", 10);

  // ========== 1. CREATE USERS ==========
  console.log("👤 Creating users...");
  
  const usersData = [
    // Superadmin
    {
      id: "usr_superadmin_001",
      email: "admin@modo.id",
      name: "Super Admin",
      password: hashedPassword,
      userType: "superadmin",
      subscriptionTier: null,
      emailVerified: true,
      creditBalance: 999999,
    },
    // Tenant - Creator (Galih Praz)
    {
      id: "usr_tenant_001",
      email: "creator@modo.id",
      name: "Galih Praz",
      password: hashedPassword,
      userType: "tenant",
      subscriptionTier: "studio",
      emailVerified: true,
      trialStartedAt: new Date("2024-12-01"),
      trialEndsAt: new Date("2025-01-01"),
      creditBalance: 500,
    },
    // Tenant - Creator 2
    {
      id: "usr_tenant_002",
      email: "sarah@modo.id",
      name: "Sarah Wijaya",
      password: hashedPassword,
      userType: "tenant",
      subscriptionTier: "creator",
      emailVerified: true,
      trialStartedAt: new Date("2024-11-15"),
      trialEndsAt: new Date("2024-12-15"),
      creditBalance: 200,
    },
    // Investor 1
    {
      id: "usr_investor_001",
      email: "investor@modo.id",
      name: "Budi Santoso",
      password: hashedPassword,
      userType: "investor",
      emailVerified: true,
      creditBalance: 0,
    },
    // Investor 2
    {
      id: "usr_investor_002",
      email: "rina@modo.id",
      name: "Rina Kusuma",
      password: hashedPassword,
      userType: "investor",
      emailVerified: true,
      creditBalance: 0,
    },
  ];

  await db.execute(`
    INSERT INTO users (id, email, name, password, user_type, subscription_tier, email_verified, trial_started_at, trial_ends_at, credit_balance)
    VALUES 
      ('${usersData[0].id}', '${usersData[0].email}', '${usersData[0].name}', '${usersData[0].password}', 'superadmin', NULL, true, NULL, NULL, ${usersData[0].creditBalance}),
      ('${usersData[1].id}', '${usersData[1].email}', '${usersData[1].name}', '${usersData[1].password}', 'tenant', 'studio', true, '2024-12-01', '2025-01-01', ${usersData[1].creditBalance}),
      ('${usersData[2].id}', '${usersData[2].email}', '${usersData[2].name}', '${usersData[2].password}', 'tenant', 'creator', true, '2024-11-15', '2024-12-15', ${usersData[2].creditBalance}),
      ('${usersData[3].id}', '${usersData[3].email}', '${usersData[3].name}', '${usersData[3].password}', 'investor', NULL, true, NULL, NULL, 0),
      ('${usersData[4].id}', '${usersData[4].email}', '${usersData[4].name}', '${usersData[4].password}', 'investor', NULL, true, NULL, NULL, 0)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password = EXCLUDED.password,
      user_type = EXCLUDED.user_type,
      subscription_tier = EXCLUDED.subscription_tier
  `);
  console.log("  ✅ Created 5 users (1 superadmin, 2 tenants, 2 investors)\n");

  // ========== 2. CREATE ORGANIZATIONS ==========
  console.log("🏢 Creating organizations...");
  
  await db.execute(`
    INSERT INTO organizations (id, name, slug, description, owner_id)
    VALUES 
      ('org_001', 'Praz Studio', 'praz-studio', 'Creative studio for animated series', 'usr_tenant_001'),
      ('org_002', 'Wijaya Productions', 'wijaya-productions', 'Film production company', 'usr_tenant_002')
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      description = EXCLUDED.description
  `);
  console.log("  ✅ Created 2 organizations\n");

  // ========== 3. CREATE PLANS ==========
  console.log("💳 Creating subscription plans...");
  
  await db.execute(`
    INSERT INTO plans (id, name, type, price_monthly, price_yearly, credits_monthly, max_projects, max_storage, max_video_generations, max_team_members, features)
    VALUES 
      ('plan_trial', 'Trial', 'trial', 0, 0, 100, 2, 500, 0, 1, '{"features": ["2 Projects", "100 Credits/month", "Basic AI Models", "Email Support"]}'),
      ('plan_creator', 'Creator', 'premium', 149000, 1490000, 400, 10, 5000, 10, 3, '{"features": ["10 Projects", "400 Credits/month", "Pro AI Models", "Priority Support", "Export HD"]}'),
      ('plan_studio', 'Studio', 'pro', 499000, 4990000, 1500, 50, 50000, 50, 10, '{"features": ["50 Projects", "1500 Credits/month", "All AI Models", "API Access", "Team Collaboration", "Export 4K"]}'),
      ('plan_enterprise', 'Enterprise', 'unlimited', 2499000, 24990000, 10000, -1, -1, -1, -1, '{"features": ["Unlimited Projects", "10000 Credits/month", "Custom AI Models", "Dedicated Support", "White Label", "Custom Integration"]}')
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      price_monthly = EXCLUDED.price_monthly,
      credits_monthly = EXCLUDED.credits_monthly
  `);
  console.log("  ✅ Created 4 subscription plans\n");

  // ========== 4. CREATE AI PROVIDERS ==========
  console.log("🤖 Creating AI providers...");
  
  await db.execute(`
    INSERT INTO ai_providers (id, name, slug, type, logo_url, website_url, api_base_url)
    VALUES 
      ('prov_openai', 'OpenAI', 'openai', 'multimodal', '/logos/openai.svg', 'https://openai.com', 'https://api.openai.com/v1'),
      ('prov_anthropic', 'Anthropic', 'anthropic', 'text', '/logos/anthropic.svg', 'https://anthropic.com', 'https://api.anthropic.com/v1'),
      ('prov_google', 'Google AI', 'google', 'multimodal', '/logos/google.svg', 'https://ai.google.dev', 'https://generativelanguage.googleapis.com'),
      ('prov_zhipu', 'Zhipu AI', 'zhipu', 'multimodal', '/logos/zhipu.svg', 'https://zhipuai.cn', 'https://open.bigmodel.cn/api'),
      ('prov_mistral', 'Mistral AI', 'mistral', 'text', '/logos/mistral.svg', 'https://mistral.ai', 'https://api.mistral.ai'),
      ('prov_replicate', 'Replicate', 'replicate', 'image', '/logos/replicate.svg', 'https://replicate.com', 'https://api.replicate.com'),
      ('prov_fal', 'Fal.ai', 'fal', 'image', '/logos/fal.svg', 'https://fal.ai', 'https://fal.run')
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      api_base_url = EXCLUDED.api_base_url
  `);
  console.log("  ✅ Created 7 AI providers\n");

  // ========== 5. CREATE AI MODELS ==========
  console.log("🧠 Creating AI models...");
  
  await db.execute(`
    INSERT INTO ai_models (id, provider_id, name, model_id, type, input_price_per_million, output_price_per_million, credit_cost, max_tokens, context_window, is_default, sort_order)
    VALUES 
      -- OpenAI Models
      ('model_gpt4o', 'prov_openai', 'GPT-4o', 'gpt-4o', 'text', 2.50, 10.00, 3, 16384, 128000, true, 1),
      ('model_gpt4o_mini', 'prov_openai', 'GPT-4o Mini', 'gpt-4o-mini', 'text', 0.15, 0.60, 1, 16384, 128000, false, 2),
      ('model_dalle3', 'prov_openai', 'DALL-E 3', 'dall-e-3', 'image', NULL, NULL, 5, NULL, NULL, false, 3),
      
      -- Anthropic Models
      ('model_claude35', 'prov_anthropic', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-latest', 'text', 3.00, 15.00, 4, 8192, 200000, false, 4),
      ('model_claude3h', 'prov_anthropic', 'Claude 3 Haiku', 'claude-3-haiku-20240307', 'text', 0.25, 1.25, 1, 4096, 200000, false, 5),
      
      -- Google Models  
      ('model_gemini2', 'prov_google', 'Gemini 2.0 Flash', 'gemini-2.0-flash-exp', 'multimodal', 0.075, 0.30, 2, 8192, 1000000, false, 6),
      ('model_gemini15', 'prov_google', 'Gemini 1.5 Pro', 'gemini-1.5-pro', 'multimodal', 1.25, 5.00, 3, 8192, 2000000, false, 7),
      
      -- Zhipu Models (GLM)
      ('model_glm4', 'prov_zhipu', 'GLM-4 Plus', 'glm-4-plus', 'text', 0.70, 0.70, 2, 4096, 128000, false, 8),
      ('model_glm4v', 'prov_zhipu', 'GLM-4V Plus', 'glm-4v-plus', 'multimodal', 1.40, 1.40, 3, 4096, 8192, false, 9),
      ('model_cogview', 'prov_zhipu', 'CogView-3 Plus', 'cogview-3-plus', 'image', NULL, NULL, 4, NULL, NULL, false, 10),
      
      -- Mistral Models
      ('model_mistral_large', 'prov_mistral', 'Mistral Large', 'mistral-large-latest', 'text', 2.00, 6.00, 3, 32768, 128000, false, 11),
      ('model_codestral', 'prov_mistral', 'Codestral', 'codestral-latest', 'text', 0.20, 0.60, 2, 32768, 256000, false, 12),
      
      -- Image Models
      ('model_flux_pro', 'prov_fal', 'FLUX.1 Pro', 'fal-ai/flux-pro', 'image', NULL, NULL, 5, NULL, NULL, false, 13),
      ('model_flux_dev', 'prov_fal', 'FLUX.1 Dev', 'fal-ai/flux/dev', 'image', NULL, NULL, 3, NULL, NULL, false, 14),
      ('model_sdxl', 'prov_replicate', 'SDXL', 'stability-ai/sdxl', 'image', NULL, NULL, 2, NULL, NULL, false, 15)
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      input_price_per_million = EXCLUDED.input_price_per_million,
      output_price_per_million = EXCLUDED.output_price_per_million,
      credit_cost = EXCLUDED.credit_cost
  `);
  console.log("  ✅ Created 15 AI models\n");

  // ========== 6. CREATE SAMPLE PROJECTS ==========
  console.log("🎬 Creating sample projects...");
  
  await db.execute(`
    INSERT INTO projects (id, user_id, org_id, title, description, genre, sub_genre, status, studio_name, ip_owner, is_public, thumbnail_url)
    VALUES 
      ('proj_001', 'usr_tenant_001', 'org_001', 'Legenda Nusantara', 'Animated series about Indonesian mythology and folklore heroes', 'Animation', 'Action Adventure', 'in_progress', 'Praz Studio', 'MODO Creator Verse', true, 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800'),
      ('proj_002', 'usr_tenant_001', 'org_001', 'Cyber Jakarta 2077', 'Cyberpunk drama set in futuristic Jakarta', 'Animation', 'Sci-Fi', 'draft', 'Praz Studio', 'MODO Creator Verse', false, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'),
      ('proj_003', 'usr_tenant_001', 'org_001', 'Warung Universe', 'Comedy series about a magical warung with interdimensional customers', 'Animation', 'Comedy', 'in_progress', 'Praz Studio', 'MODO Creator Verse', true, 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800'),
      ('proj_004', 'usr_tenant_002', 'org_002', 'Pulau Misteri', 'Horror mystery on a remote Indonesian island', 'Live Action', 'Horror', 'draft', 'Wijaya Productions', 'Sarah Wijaya', false, 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800'),
      ('proj_005', 'usr_tenant_002', 'org_002', 'Cinta di Kota Tua', 'Romance drama in old Jakarta', 'Live Action', 'Romance', 'completed', 'Wijaya Productions', 'Sarah Wijaya', true, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=800')
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      status = EXCLUDED.status
  `);
  console.log("  ✅ Created 5 sample projects\n");

  // ========== 7. CREATE SAMPLE STORIES ==========
  console.log("📖 Creating sample stories...");
  
  await db.execute(`
    INSERT INTO stories (id, project_id, premise, synopsis, genre, target_audience, structure, structure_beats)
    VALUES 
      ('story_001', 'proj_001', 
       'When ancient evil threatens modern Indonesia, a young man discovers he is the reincarnation of the legendary Gatotkaca.',
       'In present-day Jakarta, Kaka is an ordinary university student struggling with his studies and family expectations. Everything changes when he witnesses a supernatural attack that awakens dormant powers within him. Guided by the spirit of his ancestor, Kaka must master the abilities of Gatotkaca while uncovering a conspiracy that connects ancient mythology with modern technology. As shadow creatures emerge across Indonesia, Kaka assembles a team of fellow awakened heroes, each connected to different legends. Together, they must prevent the resurrection of Batara Kala before the next lunar eclipse.',
       'Action Adventure', 'Teens & Young Adults', 'hero',
       '{"act1": {"setup": "Introduce Kaka and modern Jakarta", "inciting_incident": "Supernatural attack awakens powers", "plot_point_1": "Discovers ancestry connection to Gatotkaca"}, "act2": {"rising_action": "Training and team assembly", "midpoint": "First major battle reveals conspiracy", "plot_point_2": "Betrayal and loss"}, "act3": {"climax": "Final battle against Batara Kala", "resolution": "New era of heroes protecting Indonesia"}}'
      ),
      ('story_002', 'proj_003',
       'A humble warung owner discovers his restaurant sits on a dimensional nexus, attracting supernatural customers.',
       'Pak Joko inherited a small warung from his grandmother, not knowing it holds an ancient secret. The warung exists in a pocket dimension that connects multiple realms. Soon, Pak Joko finds himself serving nasi goreng to friendly ghosts, coffee to visiting aliens, and bakso to time travelers. With help from his skeptical daughter who returns from studying abroad, they navigate the challenges of running a business that caters to beings from across the multiverse, while keeping it all secret from the normal world.',
       'Comedy', 'All Ages', 'hero',
       '{"episodes": [{"title": "First Contact", "premise": "Alien customer causes chaos"}, {"title": "Ghost Writer", "premise": "Famous author ghost wants help finishing book"}, {"title": "Time Crunch", "premise": "Customer from future warns of disaster"}]}'
      )
    ON CONFLICT (id) DO UPDATE SET
      premise = EXCLUDED.premise,
      synopsis = EXCLUDED.synopsis
  `);
  console.log("  ✅ Created 2 sample stories\n");

  // Skip characters and universes for now - tables have different schema
  console.log("⏭️ Skipping characters and universes (can be added later)\n");

  // ========== 10. CREATE CREDIT BALANCES ==========
  console.log("💰 Creating credit balances...");
  
  await db.execute(`
    INSERT INTO credit_balances (id, user_id, org_id, balance, monthly_allowance, used_this_month)
    VALUES 
      ('cbal_001', 'usr_tenant_001', 'org_001', 500, 1500, 234),
      ('cbal_002', 'usr_tenant_002', 'org_002', 200, 400, 156)
    ON CONFLICT (id) DO UPDATE SET
      balance = EXCLUDED.balance,
      used_this_month = EXCLUDED.used_this_month
  `);
  console.log("  ✅ Created credit balances\n");

  console.log("✨ Database seed completed successfully!\n");
  console.log("📋 Demo Login Credentials:");
  console.log("   Superadmin: admin@modo.id / demo123");
  console.log("   Creator:    creator@modo.id / demo123");
  console.log("   Investor:   investor@modo.id / demo123");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
