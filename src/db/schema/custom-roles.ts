import { pgTable, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const customRoles = pgTable("custom_roles", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // Role info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  color: varchar("color", { length: 50 }), // For UI display
  icon: varchar("icon", { length: 50 }), // For UI display
  
  // Permissions
  permissions: jsonb("permissions"), // Array of permission strings
  
  // Is this a predefined role or custom
  isPredefined: boolean("is_predefined").default(false),
  
  // Metadata
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  isPublic: boolean("is_public").default(false), // Can be used by other projects
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
