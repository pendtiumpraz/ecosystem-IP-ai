/**
 * Character Versions API
 * Manage character detail versions (snapshots)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characterVersions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET - List all versions for a character
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get("characterId");
    const userId = searchParams.get("userId");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    if (!characterId || !userId) {
        return NextResponse.json(
            { success: false, error: "characterId and userId required" },
            { status: 400 }
        );
    }

    try {
        // Build where conditions
        const conditions = [
            eq(characterVersions.characterId, characterId),
            eq(characterVersions.userId, userId),
        ];

        if (!includeDeleted) {
            conditions.push(eq(characterVersions.isDeleted, false));
        }

        const versions = await db.select()
            .from(characterVersions)
            .where(and(...conditions))
            .orderBy(desc(characterVersions.versionNumber));

        const activeVersions = versions.filter(v => !v.isDeleted);
        const deletedVersions = versions.filter(v => v.isDeleted);
        const currentVersion = activeVersions.find(v => v.isCurrent);

        return NextResponse.json({
            success: true,
            versions: activeVersions,
            deletedVersions: includeDeleted ? deletedVersions : [],
            currentVersion,
            totalCount: activeVersions.length,
            deletedCount: deletedVersions.length,
        });

    } catch (error) {
        console.error("Get versions error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch versions" },
            { status: 500 }
        );
    }
}

// POST - Create new version (snapshot current character data)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            characterId,
            projectId,
            userId,
            characterData,
            versionName,
            generatedBy = "manual",
            promptUsed,
            setAsCurrent = true,
        } = body;

        if (!characterId || !userId || !characterData) {
            return NextResponse.json(
                { success: false, error: "characterId, userId, and characterData required" },
                { status: 400 }
            );
        }

        // Get next version number
        const [result] = await sql`
            SELECT COALESCE(MAX(version_number), 0) + 1 as next_version
            FROM character_versions
            WHERE character_id = ${characterId} AND user_id = ${userId}
        `;
        const nextVersion = result?.next_version || 1;

        // Auto-generate version name if not provided
        const finalVersionName = versionName || `Version ${nextVersion}`;

        // If setting as current, unset other current versions
        if (setAsCurrent) {
            await db.update(characterVersions)
                .set({ isCurrent: false })
                .where(and(
                    eq(characterVersions.characterId, characterId),
                    eq(characterVersions.userId, userId)
                ));
        }

        // Create new version
        const [newVersion] = await db.insert(characterVersions).values({
            characterId,
            projectId,
            userId,
            versionNumber: nextVersion,
            versionName: finalVersionName,
            characterData,
            isCurrent: setAsCurrent,
            generatedBy,
            promptUsed,
        }).returning();

        return NextResponse.json({
            success: true,
            version: newVersion,
            message: `Created ${finalVersionName}`,
        });

    } catch (error) {
        console.error("Create version error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to create version" },
            { status: 500 }
        );
    }
}
