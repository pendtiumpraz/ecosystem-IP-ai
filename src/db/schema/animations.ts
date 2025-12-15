import { pgTable, varchar, text, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const animationStyleEnum = pgEnum("animation_style", ["cartoon", "sketch", "3d", "vector", "realistic", "anime"]);
export const animationStatusEnum = pgEnum("animation_status", ["pending", "processing", "completed", "failed"]);

export const animations = pgTable("animations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  beatName: varchar("beat_name", { length: 255 }).notNull(),
  beatIndex: integer("beat_index").notNull(),
  description: text("description"),
  prompt: text("prompt"),
  
  style: animationStyleEnum("style").default("3d"),
  videoUrl: text("video_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: integer("duration"), // in seconds
  
  status: animationStatusEnum("status").default("pending"),
  errorMessage: text("error_message"),
  
  // Generation metadata
  aiModel: varchar("ai_model", { length: 100 }),
  generationCost: integer("generation_cost"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Animation = typeof animations.$inferSelect;
export type NewAnimation = typeof animations.$inferInsert;
