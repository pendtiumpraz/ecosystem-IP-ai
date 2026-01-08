// Quick database check script
import { neon } from "@neondatabase/serverless";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

async function checkDatabase() {
    const sql = neon(process.env.DATABASE_URL!);

    console.log("=== DATABASE CHECK ===\n");

    // Check projects
    const projects = await sql`SELECT id, title, created_at FROM projects WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10`;
    console.log("PROJECTS:", projects.length);
    projects.forEach((p: any) => console.log(`  - ${p.title} (${p.id})`));

    // Check story_versions
    const stories = await sql`SELECT id, version_name, project_id, created_at FROM story_versions WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10`;
    console.log("\nSTORY VERSIONS:", stories.length);
    stories.forEach((s: any) => console.log(`  - ${s.version_name} (${s.id})`));

    // Check characters
    const chars = await sql`SELECT id, name, role FROM characters WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10`;
    console.log("\nCHARACTERS:", chars.length);
    chars.forEach((c: any) => console.log(`  - ${c.name} (${c.role})`));

    // Check if data exists but is soft-deleted
    const deletedProjects = await sql`SELECT COUNT(*) as count FROM projects WHERE deleted_at IS NOT NULL`;
    const deletedStories = await sql`SELECT COUNT(*) as count FROM story_versions WHERE deleted_at IS NOT NULL`;
    const deletedChars = await sql`SELECT COUNT(*) as count FROM characters WHERE deleted_at IS NOT NULL`;

    console.log("\n=== SOFT DELETED (recoverable) ===");
    console.log(`Projects: ${deletedProjects[0].count}`);
    console.log(`Stories: ${deletedStories[0].count}`);
    console.log(`Characters: ${deletedChars[0].count}`);

    // Check all projects regardless of deleted status
    const allProjects = await sql`SELECT id, title, deleted_at FROM projects ORDER BY created_at DESC LIMIT 10`;
    console.log("\n=== ALL PROJECTS (including deleted) ===");
    allProjects.forEach((p: any) => console.log(`  - ${p.title} | deleted: ${p.deleted_at ? 'YES' : 'no'}`));
}

checkDatabase().catch(console.error);
