import { pgTable, varchar, text, timestamp, integer, boolean, pgEnum, jsonb, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const aiProviderTypeEnum = pgEnum("ai_provider_type", ["text", "image", "video", "audio", "multimodal"]);

export const aiProviders = pgTable("ai_providers", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  type: aiProviderTypeEnum("type").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  apiBaseUrl: text("api_base_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiModels = pgTable("ai_models", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id", { length: 36 }).notNull().references(() => aiProviders.id),
  name: varchar("name", { length: 100 }).notNull(),
  modelId: varchar("model_id", { length: 255 }).notNull(), // actual API model identifier
  type: aiProviderTypeEnum("type").notNull(),
  
  // Pricing per 1M tokens or per generation
  inputPricePerMillion: real("input_price_per_million"),
  outputPricePerMillion: real("output_price_per_million"),
  pricePerGeneration: real("price_per_generation"),
  
  // Credit cost (internal)
  creditCost: integer("credit_cost").notNull().default(1),
  
  // Capabilities
  maxTokens: integer("max_tokens"),
  contextWindow: integer("context_window"),
  capabilities: jsonb("capabilities"),
  
  // Settings
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Platform API keys (admin managed)
export const platformApiKeys = pgTable("platform_api_keys", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  providerId: varchar("provider_id", { length: 36 }).notNull().references(() => aiProviders.id),
  name: varchar("name", { length: 100 }).notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User API keys (BYOK - Bring Your Own Key)
export const userApiKeys = pgTable("user_api_keys", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  providerId: varchar("provider_id", { length: 36 }).notNull().references(() => aiProviders.id),
  name: varchar("name", { length: 100 }).notNull(),
  encryptedKey: text("encrypted_key").notNull(),
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AIProvider = typeof aiProviders.$inferSelect;
export type AIModel = typeof aiModels.$inferSelect;
export type PlatformApiKey = typeof platformApiKeys.$inferSelect;
export type UserApiKey = typeof userApiKeys.$inferSelect;
