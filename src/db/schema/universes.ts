import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const universes = pgTable("universes", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Environment
  environment: jsonb("environment"), // landscape, climate, geography, flora, fauna, resources
  
  // Public Systems
  publicSystems: jsonb("public_systems"), // government, politics, economy, laws, military, infrastructure
  
  // Private Systems
  privateSystems: jsonb("private_systems"), // family, socialLife, culture, religion, traditions, customs
  
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
