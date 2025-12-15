import { pgTable, varchar, text, timestamp, integer, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

// Google Drive OAuth tokens
export const userGoogleTokens = pgTable("user_google_tokens", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  driveFolderId: varchar("drive_folder_id", { length: 100 }), // MODO root folder ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// AI Generation types
export const generationTypeEnum = pgEnum("generation_type", [
  "synopsis",
  "story_structure", 
  "character_profile",
  "character_image",
  "universe",
  "moodboard_prompt",
  "moodboard_image",
  "script",
  "animation_preview",
  "video",
  "voice",
  "music",
]);

export const generationStatusEnum = pgEnum("generation_status", [
  "pending",
  "processing", 
  "completed",
  "failed",
]);

// AI Generation logs - stores ALL generation results
export const aiGenerationLogs = pgTable("ai_generation_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  projectId: varchar("project_id", { length: 36 }).references(() => projects.id),
  
  // Generation details
  generationType: generationTypeEnum("generation_type").notNull(),
  modelId: varchar("model_id", { length: 100 }), // AI model used
  modelProvider: varchar("model_provider", { length: 50 }), // openai, anthropic, etc
  
  // Input
  prompt: text("prompt"),
  inputParams: jsonb("input_params"), // Additional parameters
  
  // Output - stored based on type
  resultText: text("result_text"), // For text generations
  resultUrl: text("result_url"), // For image/video - Google Drive URL
  resultDriveId: varchar("result_drive_id", { length: 100 }), // Google Drive file ID
  resultMetadata: jsonb("result_metadata"), // Additional result info
  
  // Cost tracking
  creditCost: integer("credit_cost").default(0),
  tokenInput: integer("token_input"),
  tokenOutput: integer("token_output"),
  
  // Status
  status: generationStatusEnum("status").default("pending").notNull(),
  errorMessage: text("error_message"),
  
  // Timestamps
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // SOFT DELETE
});

// Credit transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  
  type: varchar("type", { length: 50 }).notNull(), // debit, credit, refund, bonus
  amount: integer("amount").notNull(), // positive = add, negative = deduct
  balanceAfter: integer("balance_after").notNull(),
  
  // Reference
  referenceType: varchar("reference_type", { length: 50 }), // generation, subscription, purchase, manual
  referenceId: varchar("reference_id", { length: 36 }),
  
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type UserGoogleToken = typeof userGoogleTokens.$inferSelect;
export type AiGenerationLog = typeof aiGenerationLogs.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
