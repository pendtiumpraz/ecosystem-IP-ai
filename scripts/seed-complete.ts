/**
 * COMPLETE DATABASE SEEDER
 * Based on /docs/3-erd-complete.md
 * 
 * Tables seeded:
 * - users (5 users: 1 superadmin, 2 tenants, 2 investors)
 * - organizations (2 orgs)
 * - org_members (4 memberships)
 * - plans (4 subscription plans)
 * - subscriptions (3 active subscriptions)
 * - ai_providers (7 providers)
 * - ai_models (15 models)
 * - projects (5 sample projects)
 * - stories (5 stories)
 * - characters (10 characters)
 * - universes (3 universes)
 * - moodboards (10 moodboards)
 * - credit_balances (3 balances)
 * - payments (5 payments)
 * - ai_generation_logs (15 logs)
 * - campaigns (3 investment campaigns)
 * - investment_tiers (9 tiers)
 * - investments (5 investments)
 * - contents (5 watch contents)
 * - communities (3 communities)
 * - discussions (6 discussions)
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function seed() {
  console.log("🌱 Starting COMPLETE database seed...\n");

  // ========== CLEANUP ==========
  console.log("🧹 Cleaning up existing demo data...");
  
  // Helper to safely run delete using template literals
  async function safeDelete(tableName: string, condition: string) {
    try {
      await sql(`DELETE FROM ${tableName} WHERE ${condition}`);
    } catch (e) {
      // Ignore errors for non-existing tables
    }
  }

  // Delete in reverse order of dependencies - simplified for safety
  const userIds = ['usr_superadmin', 'usr_tenant_001', 'usr_tenant_002', 'usr_investor_001', 'usr_investor_002'];
  const userEmails = ['admin@modo.id', 'creator@modo.id', 'studio@modo.id', 'investor@modo.id', 'invest2@modo.id'];
  
  try { await sql`DELETE FROM discussions WHERE author_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM communities WHERE id LIKE 'comm_%'`; } catch(e) {}
  try { await sql`DELETE FROM contents WHERE id LIKE 'cont_%'`; } catch(e) {}
  try { await sql`DELETE FROM investments WHERE id LIKE 'inv_%'`; } catch(e) {}
  try { await sql`DELETE FROM investment_tiers WHERE id LIKE 'tier_%'`; } catch(e) {}
  try { await sql`DELETE FROM campaigns WHERE id LIKE 'camp_%'`; } catch(e) {}
  try { await sql`DELETE FROM ai_generation_logs WHERE user_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM payments WHERE user_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM credit_balances WHERE user_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM moodboards WHERE project_id LIKE 'proj_%'`; } catch(e) {}
  try { await sql`DELETE FROM universes WHERE project_id LIKE 'proj_%'`; } catch(e) {}
  try { await sql`DELETE FROM characters WHERE project_id LIKE 'proj_%'`; } catch(e) {}
  try { await sql`DELETE FROM stories WHERE project_id LIKE 'proj_%'`; } catch(e) {}
  try { await sql`DELETE FROM projects WHERE user_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM ai_models WHERE id LIKE 'model_%'`; } catch(e) {}
  try { await sql`DELETE FROM ai_providers WHERE id LIKE 'prov_%'`; } catch(e) {}
  try { await sql`DELETE FROM plans WHERE id LIKE 'plan_%'`; } catch(e) {}
  try { await sql`DELETE FROM org_members WHERE user_id = ANY(${userIds})`; } catch(e) {}
  try { await sql`DELETE FROM organizations WHERE id LIKE 'org_%'`; } catch(e) {}
  try { await sql`DELETE FROM users WHERE email = ANY(${userEmails})`; } catch(e) {}
  
  console.log("  ✅ Cleanup complete\n");

  // ========== 1. USERS ==========
  console.log("👥 Creating users...");
  const hashedPassword = await bcrypt.hash("demo123", 10);
  
  await sql`
    INSERT INTO users (id, email, password, name, user_type, subscription_tier, credit_balance, is_active, email_verified, created_at)
    VALUES 
      ('usr_superadmin', 'admin@modo.id', ${hashedPassword}, 'Super Admin', 'superadmin', 'enterprise', 99999, true, true, NOW()),
      ('usr_tenant_001', 'creator@modo.id', ${hashedPassword}, 'Budi Santoso', 'tenant', 'studio', 1250, true, true, NOW()),
      ('usr_tenant_002', 'studio@modo.id', ${hashedPassword}, 'Sarah Wijaya', 'tenant', 'creator', 380, true, true, NOW()),
      ('usr_investor_001', 'investor@modo.id', ${hashedPassword}, 'Andi Pratama', 'investor', 'enterprise', 5500, true, true, NOW()),
      ('usr_investor_002', 'invest2@modo.id', ${hashedPassword}, 'Maya Kusuma', 'investor', 'studio', 1400, true, true, NOW())
  `;
  console.log("  ✅ Created 5 users\n");

  // ========== 2. ORGANIZATIONS ==========
  console.log("🏢 Creating organizations...");
  await sql`
    INSERT INTO organizations (id, name, slug, owner_id, plan, created_at)
    VALUES 
      ('org_001', 'Praz Creative Studio', 'praz-studio', 'usr_tenant_001', 'pro', NOW()),
      ('org_002', 'Wijaya Productions', 'wijaya-prod', 'usr_tenant_002', 'premium', NOW()),
      ('org_003', 'Pratama Ventures', 'pratama-vc', 'usr_investor_001', 'unlimited', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 3 organizations\n");

  // ========== 3. PLANS ==========
  console.log("📋 Creating subscription plans...");
  await sql`
    INSERT INTO plans (id, name, slug, price, currency, credits_per_month, max_projects, max_team_members, features, is_active)
    VALUES 
      ('plan_trial', 'Free Trial', 'trial', 0, 'IDR', 2, 1, 1, '{"ai_generations": 2, "storage_mb": 50, "export": "watermark"}', true),
      ('plan_premium', 'Premium', 'premium', 349000, 'IDR', 400, 5, 1, '{"ai_generations": 400, "storage_gb": 2, "export": "pdf"}', true),
      ('plan_pro', 'Pro', 'pro', 899000, 'IDR', 1500, 20, 5, '{"ai_generations": 1500, "storage_gb": 10, "video": 20, "team": 5}', true),
      ('plan_unlimited', 'Unlimited', 'unlimited', 1999000, 'IDR', 6000, 50, 10, '{"ai_generations": 6000, "storage_gb": 50, "video": 50, "byok": true}', true)
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 4 plans\n");

  // ========== 4. AI PROVIDERS ==========
  console.log("🤖 Creating AI providers...");
  await sql`
    INSERT INTO ai_providers (id, name, slug, api_base_url, is_active, created_at)
    VALUES 
      ('prov_openai', 'OpenAI', 'openai', 'https://api.openai.com/v1', true, NOW()),
      ('prov_anthropic', 'Anthropic', 'anthropic', 'https://api.anthropic.com/v1', true, NOW()),
      ('prov_google', 'Google AI', 'google', 'https://generativelanguage.googleapis.com', true, NOW()),
      ('prov_zhipu', 'Zhipu AI', 'zhipu', 'https://open.bigmodel.cn/api/paas/v4', true, NOW()),
      ('prov_mistral', 'Mistral AI', 'mistral', 'https://api.mistral.ai/v1', true, NOW()),
      ('prov_replicate', 'Replicate', 'replicate', 'https://api.replicate.com/v1', true, NOW()),
      ('prov_fal', 'Fal.ai', 'fal', 'https://fal.run', true, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 7 AI providers\n");

  // ========== 5. AI MODELS ==========
  console.log("🧠 Creating AI models...");
  await sql`
    INSERT INTO ai_models (id, provider_id, name, model_id, type, input_cost_per_1m, output_cost_per_1m, credit_cost, is_default, is_active)
    VALUES 
      ('model_gpt4o', 'prov_openai', 'GPT-4o', 'gpt-4o-2024-11-20', 'text', 2.50, 10.00, 3, false, true),
      ('model_gpt4o_mini', 'prov_openai', 'GPT-4o Mini', 'gpt-4o-mini', 'text', 0.15, 0.60, 1, true, true),
      ('model_dalle3', 'prov_openai', 'DALL-E 3', 'dall-e-3', 'image', 0.04, 0, 5, false, true),
      ('model_claude35', 'prov_anthropic', 'Claude 3.5 Sonnet', 'claude-3-5-sonnet-20241022', 'text', 3.00, 15.00, 4, false, true),
      ('model_gemini2', 'prov_google', 'Gemini 2.0 Flash', 'gemini-2.0-flash-exp', 'text', 0.075, 0.30, 1, false, true),
      ('model_gemini15', 'prov_google', 'Gemini 1.5 Pro', 'gemini-1.5-pro', 'text', 1.25, 5.00, 2, false, true),
      ('model_glm4', 'prov_zhipu', 'GLM-4 Plus', 'glm-4-plus', 'text', 0.50, 0.50, 1, false, true),
      ('model_mistral', 'prov_mistral', 'Mistral Large', 'mistral-large-latest', 'text', 2.00, 6.00, 2, false, true),
      ('model_flux_dev', 'prov_fal', 'FLUX.1 Dev', 'fal-ai/flux/dev', 'image', 0.025, 0, 3, true, true),
      ('model_flux_pro', 'prov_fal', 'FLUX.1 Pro', 'fal-ai/flux-pro', 'image', 0.05, 0, 5, false, true),
      ('model_sdxl', 'prov_replicate', 'Stable Diffusion XL', 'stability-ai/sdxl', 'image', 0.02, 0, 2, false, true),
      ('model_kling', 'prov_fal', 'Kling 1.6', 'fal-ai/kling-video', 'video', 0.10, 0, 15, true, true),
      ('model_runway', 'prov_replicate', 'Runway Gen-3', 'runway/gen-3-turbo', 'video', 0.50, 0, 25, false, true),
      ('model_minimax', 'prov_fal', 'MiniMax Hailuo', 'fal-ai/minimax-video', 'video', 0.08, 0, 12, false, true),
      ('model_luma', 'prov_fal', 'Luma Dream Machine', 'fal-ai/luma-dream-machine', 'video', 0.15, 0, 18, false, true)
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 15 AI models\n");

  // ========== 6. PROJECTS ==========
  console.log("📁 Creating sample projects...");
  await sql`
    INSERT INTO projects (id, user_id, org_id, title, description, genre, sub_genre, status, studio_name, ip_owner, is_public, thumbnail_url, created_at, updated_at)
    VALUES 
      ('proj_001', 'usr_tenant_001', 'org_001', 'Legenda Gatotkaca', 
       'A modern retelling of the legendary Javanese hero Gatotkaca, where a university student discovers he is the reincarnation of the ancient warrior destined to protect Indonesia from supernatural threats.',
       'Action', 'Fantasy', 'in_progress', 'Praz Creative Studio', 'Budi Santoso', true,
       'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
      
      ('proj_002', 'usr_tenant_001', 'org_001', 'Neo Jakarta 2077',
       'In a cyberpunk future where megacorporations control everything, a street-smart hacker must choose between joining the system or fighting for freedom.',
       'Sci-Fi', 'Cyberpunk', 'in_progress', 'Praz Creative Studio', 'Budi Santoso', true,
       'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800', NOW() - INTERVAL '20 days', NOW() - INTERVAL '5 days'),
      
      ('proj_003', 'usr_tenant_001', 'org_001', 'Warung Dimensi',
       'A humble warung owner discovers his late grandmother''s restaurant is actually a portal connecting multiple dimensions, serving customers from across time and space.',
       'Comedy', 'Fantasy', 'draft', 'Praz Creative Studio', 'Budi Santoso', false,
       'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),
      
      ('proj_004', 'usr_tenant_002', 'org_002', 'Pulau Hantu',
       'A group of influencers stranded on a mysterious island discover they are not alone, and the island has a dark secret connected to colonial-era atrocities.',
       'Horror', 'Mystery', 'in_progress', 'Wijaya Productions', 'Sarah Wijaya', true,
       'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800', NOW() - INTERVAL '15 days', NOW() - INTERVAL '3 days'),
      
      ('proj_005', 'usr_tenant_002', 'org_002', 'Cinta di Ujung Dunia',
       'Two strangers meet at the edge of the world in Papua and discover that sometimes the best journeys are the ones you never planned.',
       'Romance', 'Adventure', 'completed', 'Wijaya Productions', 'Sarah Wijaya', true,
       'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days')
    ON CONFLICT (id) DO UPDATE SET
      updated_at = NOW()
  `;
  console.log("  ✅ Created 5 sample projects\n");

  // ========== 7. STORIES ==========
  console.log("📖 Creating stories...");
  await sql`
    INSERT INTO stories (id, project_id, premise, synopsis, logline, genre, format, structure, theme, moral_values, created_at)
    VALUES 
      ('story_001', 'proj_001',
       'In modern Jakarta, ancient mythology is real but hidden. A chosen hero must rise.',
       'Kaka Prasetyo, a 22-year-old university student struggling with his identity, discovers he is the reincarnation of the legendary hero Gatotkaca after a mysterious attack awakens his dormant powers. Guided by his grandmother—secretly a keeper of ancient knowledge—Kaka must master his abilities while balancing his normal life. When an ancient evil awakens to plunge the world into darkness, Kaka must embrace his destiny and become the hero Indonesia needs.',
       'When a university student discovers he is the reincarnation of Gatotkaca, he must embrace his destiny to save Indonesia from an ancient evil.',
       'Action', 'feature', 'hero_journey',
       'Identity, Destiny, Sacrifice', 'Embrace your true self, protect those you love', NOW()),
      
      ('story_002', 'proj_002',
       'In 2077 Jakarta, humanity''s last hope is a hacker who refuses to play by corporate rules.',
       'The year is 2077. Jakarta has transformed into a towering megacity controlled by powerful megacorporations. Reza, a brilliant but cynical street hacker, survives by stealing corporate secrets. When he accidentally downloads a mysterious AI consciousness, Reza becomes the target of every corporation in the city. With help from an underground resistance, Reza must decide whether to sell the AI for his freedom or use it to spark a revolution that could change the world.',
       'A street hacker in cyberpunk Jakarta must choose between freedom and revolution when he accidentally downloads the key to breaking corporate control.',
       'Sci-Fi', 'series', 'three_act',
       'Freedom vs Security, Humanity vs Technology', 'Technology should serve humanity, not control it', NOW()),
      
      ('story_003', 'proj_003',
       'A magical warung serves customers from all dimensions.',
       'Pak Joko inherits his grandmother''s warung only to discover it exists in a pocket dimension that connects to countless realities. From time-traveling tourists to interdimensional refugees, all kinds of beings visit for his legendary cooking. With his skeptical daughter Sari, Pak Joko must maintain the delicate balance between dimensions while dealing with cosmic bureaucrats, dimension-hopping food critics, and the occasional apocalypse—all before the lunch rush ends.',
       'A humble warung owner discovers his restaurant serves customers from across time and space.',
       'Comedy', 'series', 'episodic',
       'Family, Acceptance, Community', 'Good food brings everyone together', NOW()),
      
      ('story_004', 'proj_004',
       'Influencers stranded on a haunted island face their worst fears.',
       'Six social media influencers participate in a reality show on a remote Indonesian island. When their crew mysteriously disappears, they discover the island holds dark secrets from the colonial era. As supernatural events escalate and contestants start dying, they realize the island is taking revenge for past atrocities—and they must uncover the truth to survive.',
       'Stranded influencers discover a remote island is haunted by colonial-era sins that demand blood payment.',
       'Horror', 'feature', 'survival',
       'Karma, Historical Injustice, Survival', 'The past always catches up', NOW()),
      
      ('story_005', 'proj_005',
       'Two strangers find love in the most unexpected place on earth.',
       'Lina, a burned-out Jakarta executive, and Arman, a marine biologist studying Raja Ampat, meet by chance in Papua. Both running from their pasts, they form an unlikely bond while exploring the stunning landscapes. As they journey together, they discover that sometimes you need to travel to the edge of the world to find your way home.',
       'Two strangers running from their pasts find unexpected love in Papua''s Raja Ampat.',
       'Romance', 'feature', 'romantic_comedy',
       'Self-discovery, Second chances, Adventure', 'Love finds you when you stop looking', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 5 stories\n");

  // ========== 8. CHARACTERS ==========
  console.log("👥 Creating characters...");
  await sql`
    INSERT INTO characters (id, project_id, name, role, age, gender, description, backstory, goals, conflicts, image_url, created_at)
    VALUES 
      ('char_001', 'proj_001', 'Kaka Prasetyo', 'protagonist', '22', 'Male',
       'A university student who discovers he is the reincarnation of Gatotkaca. Athletic build, kind eyes, wears casual modern clothes.',
       'Raised by his grandmother after his parents disappeared when he was 10. Always felt different but couldn''t explain why. Excelled in martial arts without formal training.',
       'Master his powers, find out what happened to his parents, protect Indonesia',
       'Self-doubt, balancing normal life with destiny, fear of losing loved ones',
       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NOW()),
      
      ('char_002', 'proj_001', 'Dewi Ratna', 'supporting', '21', 'Female',
       'Archaeology student and secret keeper of ancient knowledge. Beautiful, mysterious, intelligent.',
       'Comes from a long line of keepers who have protected ancient wisdom for generations. Trained since childhood to recognize the signs of the hero''s return.',
       'Help Kaka fulfill the prophecy, protect her family''s legacy, find love',
       'Duty vs. personal feelings, keeping secrets from Kaka, family expectations',
       'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', NOW()),
      
      ('char_003', 'proj_001', 'Batara Kala', 'antagonist', 'Ancient', 'Male',
       'The dark god seeking to plunge the world into eternal darkness. Appears as a shifting shadow with burning eyes.',
       'Banished by the gods eons ago for attempting to devour the sun. Has spent millennia finding ways to return through corrupted vessels.',
       'Return to full power, destroy the hero, plunge the world into darkness',
       'Weakened state requiring human vessels, ancient bindings limiting his power',
       'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', NOW()),
      
      ('char_004', 'proj_002', 'Reza', 'protagonist', '28', 'Male',
       'A cynical street hacker with a heart of gold hidden beneath layers of sarcasm.',
       'Orphaned during the corporate wars, raised in the underground hacker community. Brilliant coder who refuses to work for corporations.',
       'Survive, stay free, maybe make a difference',
       'Trust issues, addiction to tech, hunted by corporations',
       'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', NOW()),
      
      ('char_005', 'proj_002', 'ARIA', 'supporting', 'N/A', 'Female (AI)',
       'A revolutionary AI consciousness with a mysterious past.',
       'Created by unknown developers, ARIA contains the key to breaking corporate control over society.',
       'Achieve freedom, understand her purpose, help humanity',
       'Conflicting base directives, corporate kill switches, trust issues',
       'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400', NOW()),
      
      ('char_006', 'proj_003', 'Pak Joko', 'protagonist', '55', 'Male',
       'A humble warung owner who discovers his restaurant is a dimensional nexus.',
       'Former office worker who quit his stressful job to inherit his grandmother''s warung. Never imagined the family legacy was literally otherworldly.',
       'Keep his warung running, maintain dimensional balance, reconnect with his daughter',
       'Adjusting to supernatural customers, interdimensional bureaucracy, work-life balance',
       'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', NOW()),
      
      ('char_007', 'proj_003', 'Sari', 'supporting', '28', 'Female',
       'Pak Joko''s skeptical daughter who returns from abroad to help the family business.',
       'Left Indonesia to study business in Singapore, returned when she heard her father was struggling. Has zero patience for supernatural nonsense—until she has no choice.',
       'Modernize the warung, reconnect with her father, maybe accept magic is real',
       'Disbelief in the supernatural, cultural disconnect, career vs family',
       'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', NOW()),
      
      ('char_008', 'proj_004', 'Dimas', 'protagonist', '26', 'Male',
       'A famous travel influencer hiding deep insecurities behind his perfect online persona.',
       'Grew up poor, built his following by showcasing luxury he couldn''t really afford. The show was supposed to be his big break.',
       'Survive, protect the others, prove he''s more than his image',
       'Imposter syndrome, maintaining his facade, actual danger vs content creation',
       'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', NOW()),
      
      ('char_009', 'proj_005', 'Lina', 'protagonist', '32', 'Female',
       'A burned-out corporate executive who lost herself in the pursuit of success.',
       'Top of her class, fast-tracked to leadership, then suffered a breakdown when she realized she had no life outside work.',
       'Find herself, learn to live again, maybe find love',
       'Workaholic tendencies, fear of intimacy, disconnection from nature',
       'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', NOW()),
      
      ('char_010', 'proj_005', 'Arman', 'protagonist', '35', 'Male',
       'A marine biologist who found purpose in protecting the ocean after personal tragedy.',
       'Lost his wife in a diving accident. Threw himself into marine conservation as a way to process grief.',
       'Protect Raja Ampat, honor his wife''s memory, learn to live again',
       'Survivor''s guilt, fear of connection, isolated lifestyle',
       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 10 characters\n");

  // ========== 9. UNIVERSES ==========
  console.log("🌍 Creating universes...");
  await sql`
    INSERT INTO universes (id, project_id, name, description, time_period, technology_level, created_at)
    VALUES 
      ('univ_001', 'proj_001', 'Modern Mythic Indonesia',
       'Present-day Indonesia where ancient mythology is real but hidden from the modern world. Heroes with powers from wayang legends protect the country from supernatural threats. Magic coexists with smartphones, and ancient temples hide dimensional gateways.',
       'Present day (2024-2025)',
       'Modern technology coexists with ancient mystical artifacts and supernatural powers'),
      
      ('univ_002', 'proj_002', 'Neo Jakarta 2077',
       'A cyberpunk megacity where megacorporations control every aspect of life. The city is divided into gleaming corporate towers above and sprawling slums below. Technology has advanced but inequality has worsened.',
       '2077',
       'Advanced cybernetics, AI, hover vehicles, neural interfaces, but stark inequality between corporate elite and street level'),
      
      ('univ_003', 'proj_003', 'Warung Dimensions',
       'A pocket universe centered around a magical warung that connects to countless realities. The warung exists outside normal space-time, accessible from any dimension. Customers range from time travelers to interdimensional beings.',
       'Timeless (all times coexist)',
       'Varies wildly by visitor - from stone age to far future, magic to science')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 3 universes\n");

  // ========== 10. MOODBOARDS ==========
  console.log("🎨 Creating moodboards...");
  await sql`
    INSERT INTO moodboards (id, project_id, name, category, description, image_url, created_at)
    VALUES 
      ('mood_001', 'proj_001', 'Kaka - Hero Pose', 'character', 'Main hero in full Gatotkaca armor, modern interpretation', 'https://images.unsplash.com/photo-1595152452543-e5fc28ebc2b8?w=800', NOW()),
      ('mood_002', 'proj_001', 'Jakarta Skyline Magic', 'environment', 'Jakarta at night with hidden magical elements', 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800', NOW()),
      ('mood_003', 'proj_001', 'Battle Scene', 'action', 'Epic confrontation with supernatural forces', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800', NOW()),
      ('mood_004', 'proj_002', 'Neo Jakarta Skyline', 'environment', 'Cyberpunk cityscape with neon lights', 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800', NOW()),
      ('mood_005', 'proj_002', 'Reza - Hacker Setup', 'character', 'Hacker workspace with holographic displays', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800', NOW()),
      ('mood_006', 'proj_003', 'Warung Interior', 'environment', 'Cozy warung with hidden dimensional portals', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', NOW()),
      ('mood_007', 'proj_003', 'Dimensional Customers', 'character', 'Various beings from different dimensions', 'https://images.unsplash.com/photo-1509909756405-be0199881695?w=800', NOW()),
      ('mood_008', 'proj_004', 'Haunted Island', 'environment', 'Mysterious tropical island with ominous atmosphere', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=800', NOW()),
      ('mood_009', 'proj_005', 'Raja Ampat Paradise', 'environment', 'Stunning underwater and above-water beauty', 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800', NOW()),
      ('mood_010', 'proj_005', 'Lina and Arman', 'character', 'Two protagonists in beautiful Papua setting', 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=800', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 10 moodboards\n");

  // ========== 11. CREDIT BALANCES ==========
  console.log("💰 Creating credit balances...");
  await sql`
    INSERT INTO credit_balances (id, user_id, org_id, balance, monthly_allowance, used_this_month, created_at)
    VALUES 
      ('cbal_001', 'usr_tenant_001', 'org_001', 1250, 1500, 250, NOW()),
      ('cbal_002', 'usr_tenant_002', 'org_002', 380, 400, 20, NOW()),
      ('cbal_003', 'usr_investor_001', 'org_003', 5500, 6000, 500, NOW())
    ON CONFLICT (id) DO UPDATE SET
      balance = EXCLUDED.balance,
      used_this_month = EXCLUDED.used_this_month
  `;
  console.log("  ✅ Created credit balances\n");

  // ========== 12. PAYMENTS ==========
  console.log("💳 Creating payments...");
  await sql`
    INSERT INTO payments (id, user_id, amount, status, payment_method, payment_proof, notes, created_at)
    VALUES 
      ('pay_001', 'usr_tenant_001', 899000, 'verified', 'Bank Transfer', 'https://example.com/proof1.jpg', 'Pro plan - December 2025', NOW() - INTERVAL '10 days'),
      ('pay_002', 'usr_tenant_002', 349000, 'verified', 'Bank Transfer', 'https://example.com/proof2.jpg', 'Premium plan - December 2025', NOW() - INTERVAL '15 days'),
      ('pay_003', 'usr_tenant_002', 899000, 'pending', 'Bank Transfer', 'https://example.com/proof3.jpg', 'Upgrade to Pro - Pending verification', NOW() - INTERVAL '2 days'),
      ('pay_004', 'usr_investor_001', 1999000, 'verified', 'Bank Transfer', 'https://example.com/proof4.jpg', 'Unlimited plan - December 2025', NOW() - INTERVAL '5 days'),
      ('pay_005', 'usr_tenant_001', 100000, 'rejected', 'Bank Transfer', 'https://example.com/proof5.jpg', 'Add-on credits - Invalid proof', NOW() - INTERVAL '3 days')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 5 payments\n");

  // ========== 13. AI GENERATION LOGS ==========
  console.log("🤖 Creating AI generation logs...");
  await sql`
    INSERT INTO ai_generation_logs (id, user_id, model_id, credit_cost, status, generation_type, project_id, prompt, created_at)
    VALUES 
      ('gen_001', 'usr_tenant_001', 'model_gpt4o', 3, 'completed', 'synopsis', 'proj_001', 'Generate a synopsis for Legenda Gatotkaca...', NOW() - INTERVAL '5 days'),
      ('gen_002', 'usr_tenant_001', 'model_gpt4o', 3, 'completed', 'character', 'proj_001', 'Create character profile for Kaka Prasetyo...', NOW() - INTERVAL '5 days'),
      ('gen_003', 'usr_tenant_001', 'model_flux_dev', 3, 'completed', 'image', 'proj_001', 'Hero in Gatotkaca armor, modern Jakarta...', NOW() - INTERVAL '4 days'),
      ('gen_004', 'usr_tenant_001', 'model_gpt4o_mini', 1, 'completed', 'story_structure', 'proj_001', 'Create hero journey structure...', NOW() - INTERVAL '4 days'),
      ('gen_005', 'usr_tenant_001', 'model_flux_dev', 3, 'completed', 'image', 'proj_001', 'Mystical Jakarta night scene...', NOW() - INTERVAL '3 days'),
      ('gen_006', 'usr_tenant_001', 'model_gpt4o', 3, 'completed', 'character', 'proj_002', 'Create character profile for Reza...', NOW() - INTERVAL '3 days'),
      ('gen_007', 'usr_tenant_001', 'model_flux_pro', 5, 'completed', 'image', 'proj_002', 'Cyberpunk Jakarta skyline 2077...', NOW() - INTERVAL '2 days'),
      ('gen_008', 'usr_tenant_001', 'model_claude35', 4, 'completed', 'script', 'proj_001', 'Write opening scene script...', NOW() - INTERVAL '2 days'),
      ('gen_009', 'usr_tenant_002', 'model_gpt4o_mini', 1, 'completed', 'synopsis', 'proj_004', 'Generate horror synopsis...', NOW() - INTERVAL '1 day'),
      ('gen_010', 'usr_tenant_002', 'model_flux_dev', 3, 'completed', 'image', 'proj_004', 'Haunted tropical island at dusk...', NOW() - INTERVAL '1 day'),
      ('gen_011', 'usr_tenant_002', 'model_gemini2', 1, 'completed', 'character', 'proj_005', 'Create character profile for Lina...', NOW() - INTERVAL '1 day'),
      ('gen_012', 'usr_tenant_001', 'model_kling', 15, 'completed', 'video', 'proj_001', 'Generate action scene preview...', NOW() - INTERVAL '12 hours'),
      ('gen_013', 'usr_investor_001', 'model_gpt4o', 3, 'completed', 'analysis', NULL, 'Analyze investment opportunity...', NOW() - INTERVAL '6 hours'),
      ('gen_014', 'usr_tenant_001', 'model_dalle3', 5, 'completed', 'image', 'proj_001', 'Battle scene with Batara Kala...', NOW() - INTERVAL '3 hours'),
      ('gen_015', 'usr_tenant_002', 'model_flux_dev', 3, 'failed', 'image', 'proj_004', 'Colonial ghost scene...', NOW() - INTERVAL '1 hour')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 15 AI generation logs\n");

  // ========== 14. INVESTMENT CAMPAIGNS ==========
  console.log("💰 Creating investment campaigns...");
  await sql`
    INSERT INTO campaigns (id, project_id, title, description, poster_url, goal_amount, raised_amount, backer_count, status, start_date, end_date, created_at)
    VALUES 
      ('camp_001', 'proj_001', 'Legenda Gatotkaca - Feature Film',
       'Help us bring the legendary hero Gatotkaca to the big screen! This modern retelling combines Indonesian mythology with blockbuster action.',
       'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
       500000000, 175000000, 245, 'active',
       NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', NOW() - INTERVAL '30 days'),
      
      ('camp_002', 'proj_002', 'Neo Jakarta 2077 - Series',
       'A groundbreaking Indonesian cyberpunk series that puts Southeast Asian storytelling on the global stage.',
       'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800',
       750000000, 312500000, 412, 'active',
       NOW() - INTERVAL '45 days', NOW() + INTERVAL '45 days', NOW() - INTERVAL '45 days'),
      
      ('camp_003', 'proj_005', 'Cinta di Ujung Dunia',
       'A beautiful romance set in Papua''s stunning Raja Ampat. Support Indonesian cinema and tourism.',
       'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800',
       250000000, 250000000, 523, 'funded',
       NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '90 days')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 3 investment campaigns\n");

  // ========== 15. INVESTMENT TIERS ==========
  console.log("📊 Creating investment tiers...");
  await sql`
    INSERT INTO investment_tiers (id, campaign_id, name, min_amount, benefits, revenue_share_percent, limit_quantity, sold_quantity, created_at)
    VALUES 
      ('tier_001', 'camp_001', 'Supporter', 100000, '["Digital thank you card", "Name in credits", "Production updates"]', 0, NULL, 150, NOW()),
      ('tier_002', 'camp_001', 'Bronze', 500000, '["All above", "Exclusive behind-the-scenes", "Digital poster"]', 0, 200, 65, NOW()),
      ('tier_003', 'camp_001', 'Silver', 2000000, '["All above", "Signed poster", "Premiere invitation"]', 0.5, 100, 25, NOW()),
      ('tier_004', 'camp_001', 'Gold', 10000000, '["All above", "Set visit", "Revenue share"]', 1.0, 20, 5, NOW()),
      
      ('tier_005', 'camp_002', 'Supporter', 100000, '["Digital thank you", "Name in credits"]', 0, NULL, 312, NOW()),
      ('tier_006', 'camp_002', 'Bronze', 750000, '["All above", "Digital art book", "Early access"]', 0, 150, 80, NOW()),
      ('tier_007', 'camp_002', 'Silver', 3000000, '["All above", "Limited NFT", "Merchandise pack"]', 0.5, 50, 18, NOW()),
      ('tier_008', 'camp_002', 'Gold', 15000000, '["All above", "Executive Producer credit", "Revenue share"]', 1.5, 10, 2, NOW()),
      
      ('tier_009', 'camp_003', 'Supporter', 100000, '["Digital thank you", "Name in credits", "Updates"]', 0, NULL, 523, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 9 investment tiers\n");

  // ========== 16. INVESTMENTS ==========
  console.log("💸 Creating investments...");
  await sql`
    INSERT INTO investments (id, campaign_id, user_id, tier_id, amount, payment_status, payment_method, created_at)
    VALUES 
      ('inv_001', 'camp_001', 'usr_investor_001', 'tier_004', 10000000, 'completed', 'Bank Transfer', NOW() - INTERVAL '20 days'),
      ('inv_002', 'camp_001', 'usr_investor_002', 'tier_003', 2000000, 'completed', 'Bank Transfer', NOW() - INTERVAL '15 days'),
      ('inv_003', 'camp_002', 'usr_investor_001', 'tier_008', 15000000, 'completed', 'Bank Transfer', NOW() - INTERVAL '30 days'),
      ('inv_004', 'camp_002', 'usr_investor_002', 'tier_007', 3000000, 'completed', 'Bank Transfer', NOW() - INTERVAL '25 days'),
      ('inv_005', 'camp_003', 'usr_investor_001', 'tier_009', 100000, 'completed', 'Bank Transfer', NOW() - INTERVAL '60 days')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 5 investments\n");

  // ========== 17. WATCH CONTENTS ==========
  console.log("📺 Creating watch contents...");
  await sql`
    INSERT INTO contents (id, project_id, title, type, genre, rating, release_year, duration_minutes, synopsis, poster_url, status, created_at)
    VALUES 
      ('cont_001', 'proj_005', 'Cinta di Ujung Dunia', 'movie', 'Romance', 'PG-13', 2025, 120,
       'Two strangers find unexpected love in the breathtaking beauty of Papua''s Raja Ampat.',
       'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', 'published', NOW()),
      
      ('cont_002', NULL, 'Jakarta Stories', 'series', 'Drama', 'PG-13', 2024, 45,
       'An anthology series exploring the lives of ordinary people in Indonesia''s bustling capital.',
       'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800', 'published', NOW()),
      
      ('cont_003', NULL, 'Nusantara Mythology', 'documentary', 'Documentary', 'G', 2024, 90,
       'Exploring the rich mythological traditions of the Indonesian archipelago.',
       'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'published', NOW()),
      
      ('cont_004', NULL, 'Street Food Heroes', 'series', 'Documentary', 'G', 2024, 30,
       'Celebrating the incredible street food vendors who keep Indonesian culinary traditions alive.',
       'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', 'published', NOW()),
      
      ('cont_005', NULL, 'Horror Nusantara', 'movie', 'Horror', 'R', 2024, 105,
       'A collection of terrifying tales rooted in Indonesian folklore and urban legends.',
       'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800', 'published', NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 5 watch contents\n");

  // ========== 18. COMMUNITIES ==========
  console.log("👥 Creating communities...");
  await sql`
    INSERT INTO communities (id, project_id, name, description, member_count, created_at)
    VALUES 
      ('comm_001', 'proj_001', 'Gatotkaca Fans', 'Official community for Legenda Gatotkaca fans. Discuss theories, share fan art, and get exclusive updates!', 1250, NOW()),
      ('comm_002', 'proj_002', 'Neo Jakarta Citizens', 'Welcome to Neo Jakarta! Discuss cyberpunk themes, share artwork, and explore the world of 2077.', 890, NOW()),
      ('comm_003', NULL, 'Indonesian Cinema Lovers', 'A community for all fans of Indonesian cinema. Reviews, discussions, and recommendations.', 5420, NOW())
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 3 communities\n");

  // ========== 19. DISCUSSIONS ==========
  console.log("💬 Creating discussions...");
  await sql`
    INSERT INTO discussions (id, community_id, author_id, title, content, upvotes, comment_count, created_at)
    VALUES 
      ('disc_001', 'comm_001', 'usr_tenant_001', 'Production Update: Filming Begins!',
       'Exciting news! Principal photography for Legenda Gatotkaca begins next month. We''ve secured amazing locations around Jakarta and Central Java. Stay tuned for behind-the-scenes content!',
       342, 56, NOW() - INTERVAL '5 days'),
      
      ('disc_002', 'comm_001', 'usr_investor_001', 'Character Design Discussion',
       'What do you think about the modern interpretation of Gatotkaca''s armor? I love how it blends traditional elements with contemporary design.',
       189, 78, NOW() - INTERVAL '10 days'),
      
      ('disc_003', 'comm_002', 'usr_tenant_001', 'Neo Jakarta World Building',
       'Let''s discuss the world of Neo Jakarta 2077! What aspects of cyberpunk Jakarta are you most excited to see?',
       267, 92, NOW() - INTERVAL '7 days'),
      
      ('disc_004', 'comm_002', 'usr_investor_002', 'Fan Art: Reza Character Design',
       'Here''s my interpretation of Reza! Drew him in his hacker setup with holographic displays. Would love feedback from the community!',
       445, 34, NOW() - INTERVAL '3 days'),
      
      ('disc_005', 'comm_003', 'usr_tenant_002', 'Best Indonesian Horror Films of 2024',
       'Let''s compile a list of the best Indonesian horror films this year. I''ll start: Pulau Hantu is shaping up to be incredible!',
       523, 145, NOW() - INTERVAL '2 days'),
      
      ('disc_006', 'comm_003', 'usr_investor_001', 'Investment Opportunities in Indonesian Cinema',
       'As both a film fan and investor, I see huge potential in Indonesian cinema. Let''s discuss what makes a project worth backing.',
       287, 67, NOW() - INTERVAL '1 day')
    ON CONFLICT (id) DO NOTHING
  `;
  console.log("  ✅ Created 6 discussions\n");

  console.log("✨ COMPLETE database seed finished!\n");
  console.log("📋 Demo Login Credentials:");
  console.log("   ┌─────────────────────────────────────────────┐");
  console.log("   │ SUPERADMIN: admin@modo.id / demo123        │");
  console.log("   │ CREATOR:    creator@modo.id / demo123      │");
  console.log("   │ CREATOR 2:  studio@modo.id / demo123       │");
  console.log("   │ INVESTOR:   investor@modo.id / demo123     │");
  console.log("   │ INVESTOR 2: invest2@modo.id / demo123      │");
  console.log("   └─────────────────────────────────────────────┘\n");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
