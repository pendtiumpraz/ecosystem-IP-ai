import { pgTable, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/**
 * Moodboard Item Image Versions
 * Tracks all image versions for each moodboard key action item
 */
export const moodboardItemImageVersions = pgTable("moodboard_item_image_versions", {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),

    // Reference to moodboard item (composite key from moodboard)
    moodboardId: varchar("moodboard_id", { length: 36 }).notNull(),
    moodboardItemId: varchar("moodboard_item_id", { length: 100 }).notNull(), // beatKey_keyActionIndex format

    // Version info
    versionNumber: integer("version_number").notNull().default(1),
    isActive: boolean("is_active").notNull().default(false),

    // Image data
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    driveFileId: varchar("drive_file_id", { length: 100 }),

    // Generation info
    promptUsed: text("prompt_used"),
    modelUsed: varchar("model_used", { length: 100 }),
    artStyle: varchar("art_style", { length: 50 }),
    aspectRatio: varchar("aspect_ratio", { length: 20 }),
    creditCost: integer("credit_cost").default(0),
    generationTimeMs: integer("generation_time_ms"),

    // Source type: generated, uploaded_drive, uploaded_url
    sourceType: varchar("source_type", { length: 50 }).default("generated"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // Soft delete for restore
});

export type MoodboardItemImageVersion = typeof moodboardItemImageVersions.$inferSelect;
export type NewMoodboardItemImageVersion = typeof moodboardItemImageVersions.$inferInsert;
