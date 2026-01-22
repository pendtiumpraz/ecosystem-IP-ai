import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// GET /api/creator/projects/[id]/story-key-actions
// Get key actions from moodboard for the active story version
// This allows Story Formula to display key actions inline

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { id: projectId } = await params;
        const { searchParams } = new URL(request.url);
        const storyVersionId = searchParams.get('storyVersionId');

        if (!storyVersionId) {
            return NextResponse.json(
                { error: "storyVersionId is required" },
                { status: 400 }
            );
        }

        // Check if moodboard exists for this story version
        const moodboardResult = await sql`
            SELECT 
                m.id,
                m.version_name,
                m.version_number,
                m.art_style,
                m.key_action_count,
                m.created_at
            FROM moodboards m
            WHERE m.story_version_id = ${storyVersionId}
                AND m.project_id = ${projectId}
                AND m.deleted_at IS NULL
                AND m.is_active = TRUE
            LIMIT 1
        `;

        if (moodboardResult.length === 0) {
            return NextResponse.json({
                hasMoodboard: false,
                moodboard: null,
                keyActionsByBeat: {},
                stats: { totalKeyActions: 0, keyActionsWithDescription: 0, completionPercent: 0 },
                message: "No moodboard found for this story version"
            });
        }

        const moodboard = moodboardResult[0];

        // Get all key actions from moodboard items
        const items = await sql`
            SELECT 
                mi.id,
                mi.beat_key,
                mi.beat_label,
                mi.beat_content,
                mi.beat_index,
                mi.key_action_index,
                mi.key_action_description,
                mi.characters_involved,
                mi.universe_level,
                mi.prompt,
                mi.image_url,
                mi.status
            FROM moodboard_items mi
            WHERE mi.moodboard_id = ${moodboard.id}
            ORDER BY mi.beat_index ASC, mi.key_action_index ASC
        `;

        // Group key actions by beat
        const keyActionsByBeat: Record<string, {
            beatLabel: string;
            beatContent: string | null;
            beatIndex: number;
            keyActions: {
                id: string;
                index: number;
                description: string | null;
                charactersInvolved: string[];
                universeLevel: string | null;
                hasPrompt: boolean;
                hasImage: boolean;
            }[];
        }> = {};

        for (const item of items) {
            if (!keyActionsByBeat[item.beat_key]) {
                keyActionsByBeat[item.beat_key] = {
                    beatLabel: item.beat_label,
                    beatContent: item.beat_content,
                    beatIndex: item.beat_index,
                    keyActions: [],
                };
            }

            keyActionsByBeat[item.beat_key].keyActions.push({
                id: item.id,
                index: item.key_action_index,
                description: item.key_action_description,
                charactersInvolved: item.characters_involved || [],
                universeLevel: item.universe_level,
                hasPrompt: !!item.prompt,
                hasImage: !!item.image_url,
            });
        }

        // Count how many key actions have descriptions
        const totalKeyActions = items.length;
        const keyActionsWithDescription = items.filter((i: any) => i.key_action_description).length;

        return NextResponse.json({
            hasMoodboard: true,
            moodboard: {
                id: moodboard.id,
                versionName: moodboard.version_name,
                versionNumber: moodboard.version_number,
                artStyle: moodboard.art_style,
                keyActionCount: moodboard.key_action_count,
                createdAt: moodboard.created_at,
            },
            keyActionsByBeat,
            stats: {
                totalKeyActions,
                keyActionsWithDescription,
                completionPercent: totalKeyActions > 0
                    ? Math.round((keyActionsWithDescription / totalKeyActions) * 100)
                    : 0,
            },
        });
    } catch (error) {
        console.error("Error fetching story key actions:", error);
        return NextResponse.json(
            { error: "Failed to fetch key actions" },
            { status: 500 }
        );
    }
}
