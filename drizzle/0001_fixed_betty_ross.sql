CREATE TYPE "public"."entity_type" AS ENUM('character', 'moodboard', 'animation', 'reference');--> statement-breakpoint
CREATE TYPE "public"."media_source_type" AS ENUM('generated', 'linked', 'replaced');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'llm';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'chat';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-image';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'image-to-image';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'inpainting';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'outpainting';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'upscaling';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'background-removal';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'controlnet';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-video';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'image-to-video';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'video-to-video';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'video-upscaling';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'face-swap';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'face-swap-video';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'lip-sync';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-speech';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'speech-to-text';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'voice-cloning';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-music';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-sfx';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'text-to-3d';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'image-to-3d';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'interior';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'embedding';--> statement-breakpoint
ALTER TYPE "public"."ai_provider_type" ADD VALUE 'moderation';--> statement-breakpoint
CREATE TABLE "ai_active_models" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subcategory" varchar(50) NOT NULL,
	"model_id" varchar(36) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ai_active_models_subcategory_unique" UNIQUE("subcategory")
);
--> statement-breakpoint
CREATE TABLE "custom_roles" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"color" varchar(50),
	"icon" varchar(50),
	"permissions" jsonb,
	"is_predefined" boolean DEFAULT false,
	"created_by" varchar(36) NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "edit_mix_sessions" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"source_materials" jsonb,
	"source_urls" jsonb,
	"mix_mode" varchar(50),
	"blend_mode" varchar(50),
	"opacity" integer DEFAULT 100,
	"duration" integer,
	"filters" jsonb,
	"effects" jsonb,
	"output_url" varchar(1000),
	"output_format" varchar(50),
	"output_quality" integer DEFAULT 100,
	"ai_generated" boolean DEFAULT false,
	"ai_prompt" text,
	"ai_model" varchar(255),
	"ai_provider" varchar(100),
	"status" varchar(50) DEFAULT 'draft',
	"error_message" text,
	"created_by" varchar(36) NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_media" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"project_id" varchar(36),
	"entity_type" "entity_type" NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"media_type" "media_type" NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100),
	"file_size_bytes" bigint,
	"source_type" "media_source_type" DEFAULT 'generated' NOT NULL,
	"drive_file_id" varchar(255),
	"drive_web_view_link" text,
	"download_url" text,
	"thumbnail_url" text,
	"public_url" text,
	"original_drive_url" text,
	"linked_at" timestamp with time zone,
	"model_used" varchar(100),
	"prompt_used" text,
	"credits_used" integer DEFAULT 0,
	"is_accessible" boolean DEFAULT true,
	"is_primary" boolean DEFAULT false,
	"last_checked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_google_drive_tokens" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expires_at" timestamp with time zone NOT NULL,
	"drive_email" varchar(255),
	"drive_folder_id" varchar(255),
	"storage_used_bytes" bigint DEFAULT 0,
	"storage_quota_bytes" bigint DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"connected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_google_drive_tokens_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "project_materials" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"file_url" varchar(1000),
	"file_size" varchar(50),
	"mime_type" varchar(100),
	"category" varchar(100),
	"tags" jsonb,
	"uploaded_by" varchar(36) NOT NULL,
	"is_public" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_team" (
	"id" varchar(36) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(255) NOT NULL,
	"is_modo_token_holder" boolean DEFAULT false,
	"modo_token_address" varchar(255),
	"modo_token_amount" varchar(50),
	"responsibilities" text,
	"expertise" text,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_active_models" ADD CONSTRAINT "ai_active_models_model_id_ai_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."ai_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_media" ADD CONSTRAINT "generated_media_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_media" ADD CONSTRAINT "generated_media_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_google_drive_tokens" ADD CONSTRAINT "user_google_drive_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;