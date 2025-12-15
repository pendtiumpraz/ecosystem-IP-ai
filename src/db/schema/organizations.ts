import { pgTable, varchar, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";

export const orgMemberRoleEnum = pgEnum("org_member_role", ["owner", "admin", "member", "viewer"]);

export const organizations = pgTable("organizations", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  logoUrl: text("logo_url"),
  description: text("description"),
  ownerId: varchar("owner_id", { length: 36 }).notNull().references(() => users.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orgMembers = pgTable("org_members", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  orgId: varchar("org_id", { length: 36 }).notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  role: orgMemberRoleEnum("role").default("member").notNull(),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type NewOrganization = typeof organizations.$inferInsert;
export type OrgMember = typeof orgMembers.$inferSelect;
