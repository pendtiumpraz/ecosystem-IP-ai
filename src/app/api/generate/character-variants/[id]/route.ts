/**
 * Update Character Image Version API
 * Rename version, set primary, delete
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generatedMedia } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// PATCH - Update version name or set primary
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const body = await request.json();
        const { versionName, isPrimaryForStyle, isPrimary } = body;

        const updates: Partial<{
            versionName: string;
            isPrimaryForStyle: boolean;
            isPrimary: boolean;
            updatedAt: Date;
        }> = {
            updatedAt: new Date(),
        };

        if (versionName !== undefined) {
            updates.versionName = versionName;
        }

        if (isPrimaryForStyle !== undefined) {
            // If setting as primary for style, unset others first
            if (isPrimaryForStyle) {
                const [media] = await db.select()
                    .from(generatedMedia)
                    .where(eq(generatedMedia.id, id))
                    .limit(1);

                if (media) {
                    // Unset other primaries for this style
                    await db.update(generatedMedia)
                        .set({ isPrimaryForStyle: false })
                        .where(and(
                            eq(generatedMedia.entityId, media.entityId),
                            eq(generatedMedia.styleUsed, media.styleUsed || "realistic")
                        ));
                }
            }
            updates.isPrimaryForStyle = isPrimaryForStyle;
        }

        if (isPrimary !== undefined) {
            // If setting as overall primary, unset others first
            if (isPrimary) {
                const [media] = await db.select()
                    .from(generatedMedia)
                    .where(eq(generatedMedia.id, id))
                    .limit(1);

                if (media) {
                    // Unset other primaries for this entity
                    await db.update(generatedMedia)
                        .set({ isPrimary: false })
                        .where(eq(generatedMedia.entityId, media.entityId));
                }
            }
            updates.isPrimary = isPrimary;
        }

        const [updated] = await db.update(generatedMedia)
            .set(updates)
            .where(eq(generatedMedia.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Media not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            media: updated,
        });

    } catch (error) {
        console.error("Update version error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Update failed" },
            { status: 500 }
        );
    }
}

// DELETE - Soft delete (mark as inaccessible)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const [updated] = await db.update(generatedMedia)
            .set({
                isAccessible: false,
                updatedAt: new Date(),
            })
            .where(eq(generatedMedia.id, id))
            .returning();

        if (!updated) {
            return NextResponse.json(
                { success: false, error: "Media not found" },
                { status: 404 }
            );
        }

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

// GET - Get single version details
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;

        const [media] = await db.select()
            .from(generatedMedia)
            .where(eq(generatedMedia.id, id))
            .limit(1);

        if (!media) {
            return NextResponse.json(
                { success: false, error: "Media not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            media,
        });

    } catch (error) {
        console.error("Get version error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Fetch failed" },
            { status: 500 }
        );
    }
}
