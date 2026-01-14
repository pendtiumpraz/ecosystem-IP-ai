/**
 * Character Image Versions Schema
 * Stores all generated images for a character with their generation settings
 */

import { pgTable, uuid, text, varchar, integer, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

// Character Image Versions Table
export const characterImageVersions = pgTable("character_image_versions", {
    id: uuid("id").primaryKey().defaultRandom(),

    // Foreign Keys
    characterId: uuid("character_id").notNull(),
    projectId: uuid("project_id").notNull(),
    userId: uuid("user_id").notNull(),

    // Version Info
    versionName: varchar("version_name", { length: 255 }).notNull(),
    versionNumber: integer("version_number").notNull().default(1),
    isActive: boolean("is_active").default(false), // Currently displayed version

    // Image Data
    imageUrl: text("image_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    driveFileId: text("drive_file_id"),
    driveWebViewLink: text("drive_web_view_link"),

    // Generation Settings (from modal)
    template: varchar("template", { length: 50 }), // portrait, headshot, medium_shot, full_body, expression_sheet, action_poses
    artStyle: varchar("art_style", { length: 50 }), // realistic, anime, ghibli, disney, comic, cyberpunk, etc
    aspectRatio: varchar("aspect_ratio", { length: 20 }), // 1:1, 4:3, 3:4, 16:9, 9:16
    actionPose: varchar("action_pose", { length: 50 }), // Only for action_poses template

    // References
    characterRefUrl: text("character_ref_url"),
    backgroundRefUrl: text("background_ref_url"),

    // Prompts
    additionalPrompt: text("additional_prompt"),
    fullPromptUsed: text("full_prompt_used"), // Complete prompt sent to AI

    // Character Data Snapshot (at time of generation)
    characterDataSnapshot: jsonb("character_data_snapshot"), // Snapshot of character details when generated

    // AI/Model Info
    modelUsed: varchar("model_used", { length: 100 }),
    modelProvider: varchar("model_provider", { length: 50 }),
    creditCost: integer("credit_cost").default(0),
    generationTimeMs: integer("generation_time_ms"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
    characterIdIdx: index("idx_char_img_ver_char_id").on(table.characterId),
    projectIdIdx: index("idx_char_img_ver_project_id").on(table.projectId),
    userIdIdx: index("idx_char_img_ver_user_id").on(table.userId),
    activeIdx: index("idx_char_img_ver_active").on(table.characterId, table.isActive),
}));

// Relations
export const characterImageVersionsRelations = relations(characterImageVersions, ({ one }) => ({
    user: one(users, {
        fields: [characterImageVersions.userId],
        references: [users.id],
    }),
    project: one(projects, {
        fields: [characterImageVersions.projectId],
        references: [projects.id],
    }),
}));

// Types
export type CharacterImageVersion = typeof characterImageVersions.$inferSelect;
export type NewCharacterImageVersion = typeof characterImageVersions.$inferInsert;
