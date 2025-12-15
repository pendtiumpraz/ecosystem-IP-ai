import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as users from "./schema/users";
import * as organizations from "./schema/organizations";
import * as subscriptions from "./schema/subscriptions";
import * as projects from "./schema/projects";
import * as stories from "./schema/stories";
import * as characters from "./schema/characters";
import * as universes from "./schema/universes";
import * as moodboards from "./schema/moodboards";
import * as animations from "./schema/animations";
import * as aiProviders from "./schema/ai-providers";
import * as credits from "./schema/credits";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, {
  schema: {
    ...users,
    ...organizations,
    ...subscriptions,
    ...projects,
    ...stories,
    ...characters,
    ...universes,
    ...moodboards,
    ...animations,
    ...aiProviders,
    ...credits,
  },
});

export * from "./schema/users";
export * from "./schema/organizations";
export * from "./schema/subscriptions";
export * from "./schema/projects";
export * from "./schema/stories";
export * from "./schema/characters";
export * from "./schema/universes";
export * from "./schema/moodboards";
export * from "./schema/animations";
export * from "./schema/ai-providers";
export * from "./schema/credits";
