import { pgTable, varchar, text, timestamp, integer, boolean, decimal, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { moodboards } from "./moodboards";

// Enums
export const animationVersionStatusEnum = pgEnum("animation_version_status", [
    "draft", "generating", "completed", "failed"
]);

export const animationClipStatusEnum = pgEnum("animation_clip_status", [
    "pending", "prompt_ready", "queued", "processing", "completed", "failed"
]);

export const transitionTypeEnum = pgEnum("transition_type", [
    "none", "fade", "dissolve", "wipe", "zoom", "slide", "blur"
]);

export const cameraMotionEnum = pgEnum("camera_motion", [
    "static", "orbit", "zoom_in", "zoom_out", "pan_left", "pan_right", "pan_up", "pan_down", "ken_burns", "parallax"
]);

// Animation Versions - ties to moodboard
export const animationVersions = pgTable("animation_versions", {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    moodboardId: varchar("moodboard_id", { length: 36 }).notNull().references(() => moodboards.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull().default(1),
    name: varchar("name", { length: 255 }),

    // Default settings for clips
    defaultDuration: integer("default_duration").default(6), // seconds
    defaultFps: integer("default_fps").default(25),
    defaultResolution: varchar("default_resolution", { length: 20 }).default("1920x1080"),
    generateAudio: boolean("generate_audio").default(false),

    // Transition settings
    transitionType: transitionTypeEnum("transition_type").default("fade"),
    transitionDuration: decimal("transition_duration", { precision: 3, scale: 1 }).default("0.5"),

    // Effect preset (JSON for flexibility)
    effectPreset: jsonb("effect_preset"), // { cameraMotion, style, colorGrade, etc. }

    // Progress tracking
    status: animationVersionStatusEnum("status").default("draft"),
    totalClips: integer("total_clips").default(0),
    completedClips: integer("completed_clips").default(0),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
    deletedAt: timestamp("deleted_at"), // soft delete
});

// Animation Clips - individual video clips from moodboard items
export const animationClips = pgTable("animation_clips", {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    animationVersionId: varchar("animation_version_id", { length: 36 }).notNull().references(() => animationVersions.id, { onDelete: "cascade" }),
    moodboardItemId: varchar("moodboard_item_id", { length: 36 }), // FK handled in SQL migration

    // Beat/Order info
    beatKey: varchar("beat_key", { length: 100 }),
    beatLabel: varchar("beat_label", { length: 255 }),
    clipOrder: integer("clip_order").notNull().default(0),

    // Source image
    sourceImageUrl: text("source_image_url").notNull(),
    keyActionDescription: text("key_action_description"),

    // Video prompt (AI generated)
    videoPrompt: text("video_prompt"),
    negativePrompt: text("negative_prompt"),

    // Video settings (can override defaults)
    duration: integer("duration").default(6),
    fps: integer("fps").default(25),
    resolution: varchar("resolution", { length: 20 }).default("1920x1080"),

    // Camera motion
    cameraMotion: cameraMotionEnum("camera_motion").default("static"),
    cameraAngle: varchar("camera_angle", { length: 100 }), // eye_level, bird_eye, low_angle, dutch_angle

    // Output
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    previewGifUrl: text("preview_gif_url"),

    // ModelsLab job tracking
    jobId: varchar("job_id", { length: 255 }),
    etaSeconds: integer("eta_seconds"),

    // Status
    status: animationClipStatusEnum("status").default("pending"),
    errorMessage: text("error_message"),
    generationCost: integer("generation_cost"),

    // Current active video version
    activeVideoVersionId: varchar("active_video_version_id", { length: 36 }),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

// Video source types
export const videoSourceEnum = pgEnum("video_source", [
    "generated", "uploaded", "external_link"
]);

// Clip Video Versions - track different video versions per clip
export const clipVideoVersions = pgTable("clip_video_versions", {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    clipId: varchar("clip_id", { length: 36 }).notNull().references(() => animationClips.id, { onDelete: "cascade" }),
    versionNumber: integer("version_number").notNull().default(1),

    // Video source
    source: videoSourceEnum("source").default("generated"),

    // Video data
    videoUrl: text("video_url"),
    thumbnailUrl: text("thumbnail_url"),
    previewGifUrl: text("preview_gif_url"),

    // For uploads - store Google Drive file ID
    driveFileId: varchar("drive_file_id", { length: 255 }),
    originalFileName: varchar("original_file_name", { length: 500 }),

    // For external links
    externalUrl: text("external_url"),

    // Generation info (if generated)
    prompt: text("prompt"),
    cameraMotion: cameraMotionEnum("camera_motion").default("static"),
    duration: integer("duration").default(6),

    // Job tracking
    jobId: varchar("job_id", { length: 255 }),

    // Status
    isActive: boolean("is_active").default(false),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"), // soft delete
});

// Types
export type AnimationVersion = typeof animationVersions.$inferSelect;
export type NewAnimationVersion = typeof animationVersions.$inferInsert;
export type AnimationClip = typeof animationClips.$inferSelect;
export type NewAnimationClip = typeof animationClips.$inferInsert;
export type ClipVideoVersion = typeof clipVideoVersions.$inferSelect;
export type NewClipVideoVersion = typeof clipVideoVersions.$inferInsert;
