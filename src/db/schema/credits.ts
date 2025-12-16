import { pgTable, varchar, text, timestamp, integer, pgEnum, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users";
import { organizations } from "./organizations";
import { aiModels } from "./ai-providers";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "subscription_credit", "purchase", "usage", "refund", "bonus", "adjustment"
]);

export const creditBalances = pgTable("credit_balances", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  orgId: varchar("org_id", { length: 36 }).references(() => organizations.id),
  balance: integer("balance").notNull().default(0),
  monthlyAllowance: integer("monthly_allowance").default(0),
  usedThisMonth: integer("used_this_month").default(0),
  resetDate: timestamp("reset_date"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditTransactions = pgTable("credit_transactions", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).references(() => users.id),
  orgId: varchar("org_id", { length: 36 }).references(() => organizations.id),
  
  type: transactionTypeEnum("type").notNull(),
  amount: integer("amount").notNull(), // positive for credit, negative for debit
  balanceAfter: integer("balance_after").notNull(),
  
  // Reference to what triggered this transaction
  referenceType: varchar("reference_type", { length: 50 }), // generation, subscription, purchase, etc.
  referenceId: varchar("reference_id", { length: 36 }),
  
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiGenerationLogs = pgTable("ai_generation_logs", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id),
  orgId: varchar("org_id", { length: 36 }).references(() => organizations.id),
  
  // Model identifier string (not FK - stores the actual model id like "gpt-4")
  modelId: varchar("model_id", { length: 100 }),
  
  // Request details
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  totalTokens: integer("total_tokens"),
  
  // Costs
  creditCost: integer("credit_cost").notNull(),
  actualCostUsd: real("actual_cost_usd"),
  
  // Status
  status: varchar("status", { length: 20 }).default("completed"),
  errorMessage: text("error_message"),
  
  // Timing
  latencyMs: integer("latency_ms"),
  
  // Reference
  projectId: varchar("project_id", { length: 36 }),
  generationType: varchar("generation_type", { length: 50 }), // synopsis, character, moodboard, etc.
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CreditBalance = typeof creditBalances.$inferSelect;
export type CreditTransaction = typeof creditTransactions.$inferSelect;
export type AIGenerationLog = typeof aiGenerationLogs.$inferSelect;
