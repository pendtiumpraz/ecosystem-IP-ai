import { pgTable, varchar, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const storyStructureEnum = pgEnum("story_structure", ["hero", "cat", "harmon", "custom"]);
export const storyFormatEnum = pgEnum("story_format", [
  "feature-film",
  "short-film", 
  "series-episodic",
  "series-serial",
  "limited-series",
  "web-series",
  "anime",
  "documentary"
]);

export const stories = pgTable("stories", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Basic Info
  premise: text("premise"),
  synopsis: text("synopsis"),
  globalSynopsis: text("global_synopsis"),
  
  // Format & Duration
  format: storyFormatEnum("format"),
  duration: varchar("duration", { length: 50 }),
  
  // Genre & Tone
  genre: varchar("genre", { length: 100 }),
  subGenre: varchar("sub_genre", { length: 100 }),
  tone: varchar("tone", { length: 100 }),
  intensity: varchar("intensity", { length: 50 }),
  
  // Theme & Values
  theme: varchar("theme", { length: 255 }),
  subTheme: varchar("sub_theme", { length: 255 }),
  moralValues: text("moral_values"),
  localValues: text("local_values"),
  
  // Plot & Structure
  plot: text("plot"),
  structure: storyStructureEnum("structure").default("hero"),
  structureBeats: jsonb("structure_beats"),
  keyActions: jsonb("key_actions"),
  
  // Want/Need Matrix
  wantNeedMatrix: jsonb("want_need_matrix"),
  
  // Ending & Target
  endingType: varchar("ending_type", { length: 100 }),
  twist: text("twist"),
  targetAudience: varchar("target_audience", { length: 255 }),
  targetMarket: varchar("target_market", { length: 255 }),
  
  // Generated Content
  generatedScript: text("generated_script"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
