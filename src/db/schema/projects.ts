import { pgTable, varchar, text, timestamp, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { organizations } from "./organizations";

export const projectStatusEnum = pgEnum("project_status", ["draft", "in_progress", "completed", "archived"]);

export const projects = pgTable("projects", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  orgId: varchar("org_id", { length: 36 }).references(() => organizations.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  thumbnailUrl: text("thumbnail_url"),
  genre: varchar("genre", { length: 100 }),
  subGenre: varchar("sub_genre", { length: 100 }),
  status: projectStatusEnum("status").default("draft").notNull(),
  
  // IP Project details
  studioName: varchar("studio_name", { length: 255 }),
  ipOwner: varchar("ip_owner", { length: 255 }),
  productionDate: timestamp("production_date"),
  
  // Brand Identity
  brandColors: jsonb("brand_colors"),
  brandLogos: jsonb("brand_logos"),
  
  // Team assignments
  team: jsonb("team"),
  
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectCollaborators = pgTable("project_collaborators", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  role: varchar("role", { length: 50 }).default("viewer").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
