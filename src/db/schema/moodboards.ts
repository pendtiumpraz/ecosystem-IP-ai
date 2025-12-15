import { pgTable, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const moodboards = pgTable("moodboards", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  beatName: varchar("beat_name", { length: 255 }).notNull(),
  beatOrder: integer("beat_order").default(0),
  description: text("description"),
  prompt: text("prompt"),
  imageUrl: text("image_url"),
  
  // Generation metadata
  aiModel: varchar("ai_model", { length: 100 }),
  generationCost: integer("generation_cost"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type Moodboard = typeof moodboards.$inferSelect;
export type NewMoodboard = typeof moodboards.$inferInsert;
