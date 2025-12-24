import { pgTable, varchar, text, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const projectTeam = pgTable("project_team", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // Team member info
  userId: varchar("user_id", { length: 36 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(), // Custom role or predefined role
  
  // Modo Community integration
  isModoTokenHolder: boolean("is_modo_token_holder").default(false),
  modoTokenAddress: varchar("modo_token_address", { length: 255 }),
  modoTokenAmount: varchar("modo_token_amount", { length: 50 }),
  
  // Additional info
  responsibilities: text("responsibilities"),
  expertise: text("expertise"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMaterials = pgTable("project_materials", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id", { length: 36 }).notNull(),
  
  // Material info
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // document, image, video, audio, other
  fileUrl: varchar("file_url", { length: 1000 }),
  fileSize: varchar("file_size", { length: 50 }),
  mimeType: varchar("mime_type", { length: 100 }),
  
  // Additional metadata
  category: varchar("category", { length: 100 }), // concept, reference, inspiration, etc.
  tags: jsonb("tags"), // Array of tags
  uploadedBy: varchar("uploaded_by", { length: 36 }), // User ID who uploaded
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
