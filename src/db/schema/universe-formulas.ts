import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const universeFormulas = pgTable("universe_formulas", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // Top Row - Locations
  workingOfficeSchool: varchar("working_office_school", { length: 255 }),
  townDistrictCity: varchar("town_district_city", { length: 255 }),
  neighborhoodEnvironment: varchar("neighborhood_environment", { length: 255 }),
  
  // Left Column - Systems
  rulesOfWork: text("rules_of_work"),
  laborLaw: text("labor_law"),
  country: varchar("country", { length: 255 }),
  governmentSystem: text("government_system"),
  
  // Center Column - Identity
  universeName: varchar("universe_name", { length: 255 }),
  period: varchar("period", { length: 255 }),
  
  // Center Column - Visual
  environmentLandscape: text("environment_landscape"),
  societyAndSystem: text("society_and_system"),
  privateInterior: text("private_interior"),
  
  // Center Column - Systems
  sociopoliticEconomy: text("sociopolitic_economy"),
  socioculturalSystem: text("sociocultural_system"),
  
  // Right Column - Private Spaces
  houseCastle: varchar("house_castle", { length: 255 }),
  roomCave: varchar("room_cave", { length: 255 }),
  familyInnerCircle: text("family_inner_circle"),
  kingdomTribeCommunal: text("kingdom_tribe_communal"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
