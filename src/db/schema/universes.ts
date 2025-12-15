import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const universes = pgTable("universes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Basic Info
  name: varchar("name", { length: 255 }),
  period: varchar("period", { length: 100 }),
  era: varchar("era", { length: 100 }),
  location: varchar("location", { length: 100 }),
  worldType: varchar("world_type", { length: 100 }),
  technologyLevel: varchar("technology_level", { length: 100 }),
  magicSystem: varchar("magic_system", { length: 100 }),
  
  // Descriptions
  environment: text("environment"),
  society: text("society"),
  privateLife: text("private_life"),
  government: text("government"),
  economy: text("economy"),
  culture: text("culture"),
  
  // History & Lore
  history: text("history"),
  lore: jsonb("lore"),
  
  // Visualizations
  visualizations: jsonb("visualizations"), // URLs for generated images
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Universe = typeof universes.$inferSelect;
export type NewUniverse = typeof universes.$inferInsert;
