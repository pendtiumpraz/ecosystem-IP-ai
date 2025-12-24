CREATE TYPE "public"."ai_provider_type" AS ENUM('text', 'image', 'video', 'audio', 'multimodal');--> statement-breakpoint
CREATE TYPE "public"."animation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."animation_style" AS ENUM('cartoon', 'sketch', '3d', 'vector', 'realistic', 'anime');--> statement-breakpoint
CREATE TYPE "public"."character_role" AS ENUM('protagonist', 'antagonist', 'deuteragonist', 'tritagonist', 'love_interest', 'mentor', 'sidekick', 'foil', 'supporting');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('subscription_credit', 'purchase', 'usage', 'refund', 'bonus', 'adjustment');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('trial', 'creator', 'studio', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_type" AS ENUM('superadmin', 'tenant', 'investor');--> statement-breakpoint
CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'verified', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('trial', 'premium', 'pro', 'unlimited');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('draft', 'in_progress', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."story_format" AS ENUM('feature-film', 'short-film', 'series-episodic', 'series-serial', 'limited-series', 'web-series', 'anime', 'documentary');--> statement-breakpoint
CREATE TYPE "public"."story_structure" AS ENUM('hero', 'cat', 'harmon', 'custom');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'processing', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."generation_type" AS ENUM('synopsis', 'story_structure', 'character_profile', 'character_image', 'universe', 'moodboard_prompt', 'moodboard_image', 'script', 'animation_preview', 'video', 'voice', 'music');--> statement-breakpoint
CREATE TABLE "ai_fallback_configs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"model_type" "ai_provider_type" NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"provider_name" varchar(100) NOT NULL,
	"model_id" varchar(255) NOT NULL,
	"api_key_id" varchar(36),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_models" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"model_id" varchar(255) NOT NULL,
	"type" "ai_provider_type" NOT NULL,
	"input_price_per_million" real,
	"output_price_per_million" real,
	"price_per_generation" real,
	"credit_cost" integer DEFAULT 1 NOT NULL,
	"max_tokens" integer,
	"context_window" integer,
	"capabilities" jsonb,
	"is_default" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_providers" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(50) NOT NULL,
	"type" "ai_provider_type" NOT NULL,
	"logo_url" text,
	"website_url" text,
	"api_base_url" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_providers_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ai_tier_models" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier" "subscription_tier" NOT NULL,
	"model_type" "ai_provider_type" NOT NULL,
	"model_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_api_keys" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"encrypted_key" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_api_keys" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"provider_id" varchar(36) NOT NULL,
	"name" varchar(100) NOT NULL,
	"encrypted_key" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"usage_count" integer DEFAULT 0,
	"last_used_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "animations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"scene_name" varchar(255) NOT NULL,
	"scene_order" integer DEFAULT 0,
	"description" text,
	"prompt" text,
	"style" "animation_style" DEFAULT '3d',
	"video_url" text,
	"preview_url" text,
	"thumbnail_url" text,
	"duration" integer,
	"status" "animation_status" DEFAULT 'pending',
	"error_message" text,
	"ai_model" varchar(100),
	"generation_cost" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" character_role DEFAULT 'supporting',
	"age" varchar(50),
	"cast_reference" varchar(255),
	"image_url" text,
	"image_poses" jsonb,
	"physiological" jsonb,
	"psychological" jsonb,
	"emotional" jsonb,
	"family" jsonb,
	"sociocultural" jsonb,
	"core_beliefs" jsonb,
	"educational" jsonb,
	"sociopolitics" jsonb,
	"swot_analysis" jsonb,
	"traits" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_generation_logs" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"project_id" varchar(36),
	"generation_type" "generation_type" NOT NULL,
	"model_id" varchar(100),
	"model_provider" varchar(50),
	"prompt" text,
	"input_params" jsonb,
	"result_text" text,
	"result_url" text,
	"result_drive_id" varchar(100),
	"result_metadata" jsonb,
	"credit_cost" integer DEFAULT 0,
	"token_input" integer,
	"token_output" integer,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "credit_balances" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36),
	"org_id" varchar(36),
	"balance" integer DEFAULT 0 NOT NULL,
	"monthly_allowance" integer DEFAULT 0,
	"used_this_month" integer DEFAULT 0,
	"reset_date" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credit_transactions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"type" varchar(50) NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"reference_type" varchar(50),
	"reference_id" varchar(36),
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" text,
	"avatar_url" text,
	"user_type" "user_type" DEFAULT 'tenant' NOT NULL,
	"subscription_tier" "subscription_tier" DEFAULT 'trial',
	"email_verified" boolean DEFAULT false,
	"trial_started_at" timestamp,
	"trial_ends_at" timestamp,
	"credit_balance" integer DEFAULT 100,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "org_members" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" "org_member_role" DEFAULT 'member' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"logo_url" text,
	"description" text,
	"owner_id" varchar(36) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"subscription_id" varchar(36),
	"amount" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50),
	"payment_proof" text,
	"verified_by" varchar(36),
	"verified_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" "plan_type" NOT NULL,
	"price_monthly" integer NOT NULL,
	"price_yearly" integer,
	"credits_monthly" integer NOT NULL,
	"max_projects" integer NOT NULL,
	"max_storage" integer NOT NULL,
	"max_video_generations" integer DEFAULT 0,
	"max_team_members" integer DEFAULT 1,
	"features" jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36),
	"org_id" varchar(36),
	"plan_id" varchar(36) NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"current_period_start" timestamp NOT NULL,
	"current_period_end" timestamp NOT NULL,
	"canceled_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_collaborators" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role" varchar(50) DEFAULT 'viewer' NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"org_id" varchar(36),
	"title" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"thumbnail_url" text,
	"genre" varchar(100),
	"sub_genre" varchar(100),
	"status" "project_status" DEFAULT 'draft' NOT NULL,
	"studio_name" varchar(255),
	"ip_owner" varchar(255),
	"production_date" timestamp,
	"brand_colors" jsonb,
	"brand_logos" jsonb,
	"team" jsonb,
	"universe_formula_id" varchar(36),
	"strategic_plan_id" varchar(36),
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "stories" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"premise" text,
	"synopsis" text,
	"global_synopsis" text,
	"format" "story_format",
	"duration" varchar(50),
	"genre" varchar(100),
	"sub_genre" varchar(100),
	"tone" varchar(100),
	"intensity" varchar(50),
	"theme" varchar(255),
	"sub_theme" varchar(255),
	"moral_values" text,
	"local_values" text,
	"plot" text,
	"structure" "story_structure" DEFAULT 'hero',
	"structure_beats" jsonb,
	"key_actions" jsonb,
	"want_need_matrix" jsonb,
	"ending_type" varchar(100),
	"twist" text,
	"target_audience" varchar(255),
	"target_market" varchar(255),
	"generated_script" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universes" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" varchar(255),
	"period" varchar(100),
	"era" varchar(100),
	"location" varchar(100),
	"world_type" varchar(100),
	"technology_level" varchar(100),
	"magic_system" varchar(100),
	"environment" text,
	"society" text,
	"private_life" text,
	"government" text,
	"economy" text,
	"culture" text,
	"history" text,
	"lore" jsonb,
	"visualizations" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "moodboards" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"beat_name" varchar(255) NOT NULL,
	"beat_order" integer DEFAULT 0,
	"description" text,
	"prompt" text,
	"image_url" text,
	"ai_model" varchar(100),
	"generation_cost" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "universe_formulas" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"working_office_school" varchar(255),
	"town_district_city" varchar(255),
	"neighborhood_environment" varchar(255),
	"rules_of_work" text,
	"labor_law" text,
	"country" varchar(255),
	"government_system" text,
	"universe_name" varchar(255),
	"period" varchar(255),
	"environment_landscape" text,
	"society_and_system" text,
	"private_interior" text,
	"sociopolitic_economy" text,
	"sociocultural_system" text,
	"house_castle" varchar(255),
	"room_cave" varchar(255),
	"family_inner_circle" text,
	"kingdom_tribe_communal" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "strategic_plans" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"customer_segments" text,
	"value_propositions" text,
	"channels" text,
	"customer_relationships" text,
	"revenue_streams" text,
	"key_resources" text,
	"key_activities" text,
	"key_partnerships" text,
	"cost_structure" text,
	"cast_" varchar(255),
	"director" varchar(255),
	"producer" varchar(255),
	"executive_producer" varchar(255),
	"distributor" varchar(255),
	"publisher" varchar(255),
	"title_brand_positioning" varchar(255),
	"theme_stated" varchar(255),
	"unique_selling" varchar(255),
	"story_values" varchar(255),
	"fans_loyalty" varchar(255),
	"production_budget" varchar(255),
	"promotion_budget" varchar(255),
	"social_media_engagements" varchar(255),
	"teaser_trailer_engagements" varchar(255),
	"genre" varchar(255),
	"competitor_name" varchar(255),
	"competitor_scores" jsonb,
	"project_scores" jsonb,
	"predicted_audience" jsonb,
	"ai_suggestions" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_google_tokens" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"expires_at" timestamp NOT NULL,
	"drive_folder_id" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_google_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "ai_fallback_configs" ADD CONSTRAINT "ai_fallback_configs_api_key_id_platform_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."platform_api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_models" ADD CONSTRAINT "ai_models_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_tier_models" ADD CONSTRAINT "ai_tier_models_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "platform_api_keys" ADD CONSTRAINT "platform_api_keys_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_api_keys" ADD CONSTRAINT "user_api_keys_provider_id_ai_providers_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."ai_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "animations" ADD CONSTRAINT "animations_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "characters" ADD CONSTRAINT "characters_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generation_logs" ADD CONSTRAINT "ai_generation_logs_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_balances" ADD CONSTRAINT "credit_balances_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_balances" ADD CONSTRAINT "credit_balances_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transactions" ADD CONSTRAINT "credit_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "org_members" ADD CONSTRAINT "org_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_subscriptions_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_plan_id_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_collaborators" ADD CONSTRAINT "project_collaborators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stories" ADD CONSTRAINT "stories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "universes" ADD CONSTRAINT "universes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "moodboards" ADD CONSTRAINT "moodboards_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_google_tokens" ADD CONSTRAINT "user_google_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;