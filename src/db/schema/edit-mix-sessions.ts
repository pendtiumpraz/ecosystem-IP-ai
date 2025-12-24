import { pgTable, varchar, text, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const editMixSessions = pgTable("edit_mix_sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // Session info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // image_mix, video_mix, image_video_mix
  
  // Source materials
  sourceMaterials: jsonb("source_materials"), // Array of source material IDs
  sourceUrls: jsonb("source_urls"), // Array of source URLs
  
  // Edit/Mix settings
  mixMode: varchar("mix_mode", { length: 50 }), // blend, overlay, composite, sequence
  blendMode: varchar("blend_mode", { length: 50 }), // normal, multiply, screen, overlay, etc.
  opacity: integer("opacity").default(100), // 0-100
  duration: integer("duration"), // For video mix in seconds
  
  // Filters and effects
  filters: jsonb("filters"), // Array of applied filters
  effects: jsonb("effects"), // Array of applied effects
  
  // Output
  outputUrl: varchar("output_url", { length: 1000 }),
  outputFormat: varchar("output_format", { length: 50 }), // png, jpg, mp4, etc.
  outputQuality: integer("output_quality").default(100), // 0-100
  
  // AI generation
  aiGenerated: boolean("ai_generated").default(false),
  aiPrompt: text("ai_prompt"),
  aiModel: varchar("ai_model", { length: 255 }),
  aiProvider: varchar("ai_provider", { length: 100 }),
  
  // Status
  status: varchar("status", { length: 50 }).default("draft"), // draft, processing, completed, failed
  errorMessage: text("error_message"),
  
  // Metadata
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
