import { pgTable, varchar, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const strategicPlans = pgTable("strategic_plans", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // IP Business Model Canvas - 9 Sections
  // 1. Customer Segments
  customerSegments: text("customer_segments"),
  
  // 2. Value Propositions
  valuePropositions: text("value_propositions"),
  
  // 3. Channels
  channels: text("channels"),
  
  // 4. Customer Relationships
  customerRelationships: text("customer_relationships"),
  
  // 5. Revenue Streams
  revenueStreams: text("revenue_streams"),
  
  // 6. Key Resources
  keyResources: text("key_resources"),
  
  // 7. Key Activities
  keyActivities: text("key_activities"),
  
  // 8. Key Partnerships
  keyPartnerships: text("key_partnerships"),
  
  // 9. Cost Structure
  costStructure: text("cost_structure"),
  
  // Performance Analysis - 15 Key Factors (using cast_ to avoid reserved keyword)
  cast: varchar("cast_", { length: 255 }),
  director: varchar("director", { length: 255 }),
  producer: varchar("producer", { length: 255 }),
  executiveProducer: varchar("executive_producer", { length: 255 }),
  distributor: varchar("distributor", { length: 255 }),
  publisher: varchar("publisher", { length: 255 }),
  titleBrandPositioning: varchar("title_brand_positioning", { length: 255 }),
  themeStated: varchar("theme_stated", { length: 255 }),
  uniqueSelling: varchar("unique_selling", { length: 255 }),
  storyValues: varchar("story_values", { length: 255 }),
  fansLoyalty: varchar("fans_loyalty", { length: 255 }),
  productionBudget: varchar("production_budget", { length: 255 }),
  promotionBudget: varchar("promotion_budget", { length: 255 }),
  socialMediaEngagements: varchar("social_media_engagements", { length: 255 }),
  teaserTrailerEngagements: varchar("teaser_trailer_engagements", { length: 255 }),
  genre: varchar("genre", { length: 255 }),
  
  // Performance Analysis - Additional Data
  competitorName: varchar("competitor_name", { length: 255 }),
  competitorScores: jsonb("competitor_scores"),
  projectScores: jsonb("project_scores"),
  predictedAudience: jsonb("predicted_audience"),
  aiSuggestions: text("ai_suggestions"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
