/**
 * Individual Character Version API
 * Activate, rename, delete versions
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { characterVersions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Get single version details
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const [version] = await db.select()
            .from(characterVersions)
            .where(eq(characterVersions.id, id))
            .limit(1);

        if (!version) {
            return NextResponse.json(
                { success: false, error: "Version not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            version,
        });

    } catch (error) {
        console.error("Get version error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch version" },
            { status: 500 }
        );
    }
}

// PATCH - Update version (rename, activate)
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { versionName, isCurrent } = body;

        // Get current version info
        const [version] = await db.select()
            .from(characterVersions)
            .where(eq(characterVersions.id, id))
            .limit(1);

        if (!version) {
            return NextResponse.json(
                { success: false, error: "Version not found" },
                { status: 404 }
            );
        }

        const updates: Partial<{
            versionName: string;
            isCurrent: boolean;
            updatedAt: Date;
        }> = {
            updatedAt: new Date(),
        };

        // Rename
        if (versionName !== undefined) {
            updates.versionName = versionName;
        }

        // Activate this version
        if (isCurrent === true) {
            // Unset other current versions first
            await db.update(characterVersions)
                .set({ isCurrent: false })
                .where(and(
                    eq(characterVersions.characterId, version.characterId),
                    eq(characterVersions.userId, version.userId)
                ));

            updates.isCurrent = true;
        }

        const [updated] = await db.update(characterVersions)
            .set(updates)
            .where(eq(characterVersions.id, id))
            .returning();

        return NextResponse.json({
            success: true,
            version: updated,
            message: isCurrent ? "Version activated" : "Version updated",
        });

    } catch (error) {
        console.error("Update version error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete version
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        // Get version to check if it's current
        const [version] = await db.select()
            .from(characterVersions)
            .where(eq(characterVersions.id, id))
            .limit(1);

        if (!version) {
            return NextResponse.json(
                { success: false, error: "Version not found" },
                { status: 404 }
            );
        }

        // Don't allow deleting the only/current version
        if (version.isCurrent) {
            return NextResponse.json(
                { success: false, error: "Cannot delete the current active version. Switch to another version first." },
                { status: 400 }
            );
        }

        // Soft delete
        await db.update(characterVersions)
            .set({
                isDeleted: true,
                updatedAt: new Date(),
            })
            .where(eq(characterVersions.id, id));

        return NextResponse.json({
            success: true,
            message: "Version deleted",
        });

    } catch (error) {
        console.error("Delete version error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Delete failed" },
            { status: 500 }
        );
    }
}
