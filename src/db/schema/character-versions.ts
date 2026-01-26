import { pgTable, varchar, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { users } from "./users";
import { projects } from "./projects";

// ============ CHARACTER VERSIONS ============
// Stores snapshots of character data for version control

export const characterVersions = pgTable("character_versions", {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),

    // Reference to character (stored in project's characters array, but we use characterId for linking)
    characterId: varchar("character_id", { length: 36 }).notNull(),
    projectId: varchar("project_id", { length: 36 }).references(() => projects.id, { onDelete: "cascade" }),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),

    // Version info
    versionNumber: integer("version_number").default(1).notNull(),
    versionName: varchar("version_name", { length: 255 }),  // User-defined, editable

    // Full character data snapshot as JSON
    characterData: jsonb("character_data").notNull(),

    // Visual Grids (generated images for poses, expressions, gestures)
    keyPoses: jsonb("key_poses").default({}),  // { front, right, left, back, three_quarter }
    facialExpressions: jsonb("facial_expressions").default({}),  // { happy, sad, angry, scared }
    emotionGestures: jsonb("emotion_gestures").default({}),  // { greeting, bow, dance, run }

    // Status
    isCurrent: boolean("is_current").default(false).notNull(),  // Currently active version
    isDeleted: boolean("is_deleted").default(false).notNull(),  // Soft delete

    // Generation info (if AI-generated)
    generatedBy: varchar("generated_by", { length: 100 }),  // 'manual', 'ai', 'duplicate'
    promptUsed: text("prompt_used"),

    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ============ RELATIONS ============

export const characterVersionsRelations = relations(characterVersions, ({ one }) => ({
    project: one(projects, {
        fields: [characterVersions.projectId],
        references: [projects.id]
    }),
    user: one(users, {
        fields: [characterVersions.userId],
        references: [users.id]
    })
}));

// ============ TYPES ============

export type CharacterVersion = typeof characterVersions.$inferSelect;
export type NewCharacterVersion = typeof characterVersions.$inferInsert;

// Character data structure for JSON storage
export interface CharacterDataSnapshot {
    name: string;
    role: string;
    castReference?: string;
    imageUrl?: string;
    imagePoses?: Record<string, string>;

    physiological: {
        age?: string;
        gender?: string;
        height?: string;
        bodyType?: string;
        hairStyle?: string;
        hairColor?: string;
        eyeColor?: string;
        skinTone?: string;
        ethnicity?: string;
        faceShape?: string;
        eyeShape?: string;
        noseShape?: string;
        lipsShape?: string;
        hijab?: string;
        uniqueness?: string;
        [key: string]: string | undefined;
    };

    psychological: {
        archetype?: string;
        fears?: string;
        wants?: string;
        needs?: string;
        alterEgo?: string;
        traumatic?: string;
        personalityType?: string;
        [key: string]: string | undefined;
    };

    emotional: {
        logos?: string;
        ethos?: string;
        pathos?: string;
        tone?: string;
        style?: string;
        mode?: string;
        [key: string]: string | undefined;
    };

    family?: {
        spouse?: string;
        children?: string;
        parents?: string;
        [key: string]: string | undefined;
    };

    sociocultural?: {
        affiliation?: string;
        groupRelationshipLevel?: string;
        cultureTradition?: string;
        language?: string;
        tribe?: string;
        economicClass?: string;
        [key: string]: string | undefined;
    };

    coreBeliefs?: {
        faith?: string;
        religionSpirituality?: string;
        trustworthy?: string;
        willingness?: string;
        vulnerability?: string;
        commitments?: string;
        integrity?: string;
        [key: string]: string | undefined;
    };

    educational?: {
        graduate?: string;
        achievement?: string;
        fellowship?: string;
        [key: string]: string | undefined;
    };

    sociopolitics?: {
        partyId?: string;
        nationalism?: string;
        citizenship?: string;
        [key: string]: string | undefined;
    };

    swot?: {
        strength?: string;
        weakness?: string;
        opportunity?: string;
        threat?: string;
        [key: string]: string | undefined;
    };

    clothingStyle?: string;
    accessories?: string[];
    props?: string;
    personalityTraits?: string[];

    [key: string]: unknown;
}
