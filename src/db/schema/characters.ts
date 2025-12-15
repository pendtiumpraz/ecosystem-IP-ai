import { pgTable, varchar, text, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects";

export const characterRoleEnum = pgEnum("character_role", [
  "protagonist", "antagonist", "deuteragonist", "tritagonist", 
  "love_interest", "mentor", "sidekick", "foil", "supporting"
]);

export const characters = pgTable("characters", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull().references(() => projects.id, { onDelete: "cascade" }),
  
  // Basic Info
  name: varchar("name", { length: 255 }).notNull(),
  role: characterRoleEnum("role").default("supporting"),
  age: varchar("age", { length: 50 }),
  castReference: varchar("cast_reference", { length: 255 }),
  
  // Images
  imageUrl: text("image_url"),
  imagePoses: jsonb("image_poses"), // { front, side, back, expression }
  
  // Physiological
  physiological: jsonb("physiological"), // head, face, body, attribute, outfit, hairStyle, birthSigns, uniqueness
  
  // Psychological
  psychological: jsonb("psychological"), // archetype, fears, wants, needs, alterEgo, traumatic, personalityType
  
  // Emotional
  emotional: jsonb("emotional"), // logos, ethos, pathos, tone, style, mode
  
  // Family
  family: jsonb("family"), // spouse, children, parents
  
  // Sociocultural
  sociocultural: jsonb("sociocultural"), // affiliation, groupRelationshipLevel, cultureTradition, language, tribe, economicClass
  
  // Core Beliefs
  coreBeliefs: jsonb("core_beliefs"), // faith, religionSpirituality, trustworthy, willingness, vulnerability, commitments, integrity
  
  // Educational
  educational: jsonb("educational"), // graduate, achievement, fellowship
  
  // Sociopolitics
  sociopolitics: jsonb("sociopolitics"), // partyId, nationalism, citizenship
  
  // SWOT Analysis
  swotAnalysis: jsonb("swot_analysis"), // strength, weakness, opportunity, threat
  
  // Traits summary
  traits: text("traits"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Character = typeof characters.$inferSelect;
export type NewCharacter = typeof characters.$inferInsert;
