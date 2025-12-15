import { pgTable, varchar, text, timestamp, integer, boolean, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { organizations } from "./organizations";

export const planTypeEnum = pgEnum("plan_type", ["trial", "premium", "pro", "unlimited"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "verified", "rejected", "expired"]);

export const plans = pgTable("plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  type: planTypeEnum("type").notNull(),
  priceMonthly: integer("price_monthly").notNull(),
  priceYearly: integer("price_yearly"),
  creditsMonthly: integer("credits_monthly").notNull(),
  maxProjects: integer("max_projects").notNull(),
  maxStorage: integer("max_storage").notNull(), // in MB
  maxVideoGenerations: integer("max_video_generations").default(0),
  maxTeamMembers: integer("max_team_members").default(1),
  features: jsonb("features"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  orgId: varchar("org_id", { length: 36 }).references(() => organizations.id),
  planId: varchar("plan_id", { length: 36 }).notNull().references(() => plans.id),
  status: varchar("status", { length: 20 }).default("active").notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  canceledAt: timestamp("canceled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  subscriptionId: varchar("subscription_id", { length: 36 }).references(() => subscriptions.id),
  amount: integer("amount").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  paymentProof: text("payment_proof"),
  verifiedBy: varchar("verified_by", { length: 36 }).references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type Subscription = typeof subscriptions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
