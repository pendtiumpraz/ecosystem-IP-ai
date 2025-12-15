import { pgTable, varchar, text, timestamp, boolean, pgEnum, integer } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// User types: superadmin (platform owner), tenant (creator), investor
export const userTypeEnum = pgEnum("user_type", ["superadmin", "tenant", "investor"]);
// Subscription tiers for tenants
export const subscriptionTierEnum = pgEnum("subscription_tier", ["trial", "creator", "studio", "enterprise"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  password: text("password"),
  avatarUrl: text("avatar_url"),
  
  // User type determines dashboard access
  userType: userTypeEnum("user_type").default("tenant").notNull(),
  
  // For tenants - subscription tier
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("trial"),
  
  emailVerified: boolean("email_verified").default(false),
  trialStartedAt: timestamp("trial_started_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  creditBalance: integer("credit_balance").default(100),
  
  isActive: boolean("is_active").default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // SOFT DELETE
});

export const sessions = pgTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Account = typeof accounts.$inferSelect;
