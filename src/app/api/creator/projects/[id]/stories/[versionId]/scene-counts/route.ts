import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET /api/creator/projects/[id]/stories/[versionId]/scene-counts?beatKeys=key1,key2
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; versionId: string }> }
) {
    try {
        const sql = neon(process.env.DATABASE_URL!);
        const { versionId: storyVersionId } = await params;
        const { searchParams } = new URL(request.url);
        const beatKeysParam = searchParams.get('beatKeys');

        if (!beatKeysParam) {
            return NextResponse.json({ counts: {} });
        }

        const beatKeys = beatKeysParam.split(',').filter(k => k.trim());

        if (beatKeys.length === 0) {
            return NextResponse.json({ counts: {} });
        }

        // Get scene counts grouped by beat_key
        // Note: beat_key in DB can be numeric ("1", "2") or camelCase ("refusalOfCall")
        // We need to check both formats

        // First get all scene plots for this story version
        const scenePlots = await sql`
            SELECT beat_key, COUNT(*) as count
            FROM scene_plots
            WHERE story_version_id = ${storyVersionId}::uuid
            GROUP BY beat_key
        `;

        // Build counts object
        const counts: Record<string, number> = {};

        // Create beat key mappings for different structures
        const HERO_BEATS_ORDER = [
            'ordinaryWorld', 'callToAdventure', 'refusalOfCall', 'meetingMentor',
            'crossingThreshold', 'testsAlliesEnemies', 'approachCave', 'ordeal',
            'reward', 'roadBack', 'resurrection', 'returnElixir'
        ];
        const CAT_BEATS_ORDER = [
            'openingImage', 'themeStated', 'setup', 'catalyst', 'debate',
            'breakIntoTwo', 'bStory', 'funAndGames', 'midpoint', 'badGuysCloseIn',
            'allIsLost', 'darkNightOfTheSoul', 'breakIntoThree', 'finale', 'finalImage'
        ];
        const HARMON_BEATS_ORDER = [
            'you', 'need', 'go', 'search', 'find', 'take', 'return', 'change'
        ];

        // Create index to key mappings
        const indexToKey: Record<string, string> = {};
        const keyToIndex: Record<string, string> = {};

        [...HERO_BEATS_ORDER, ...CAT_BEATS_ORDER, ...HARMON_BEATS_ORDER].forEach((key, idx) => {
            // For each structure, indices start at 1
            // Hero: 1-12, Cat: 1-15, Harmon: 1-8
        });

        HERO_BEATS_ORDER.forEach((key, idx) => {
            indexToKey[String(idx + 1)] = key;
            keyToIndex[key] = String(idx + 1);
        });

        // For each beat key requested, find its scene count
        for (const beatKey of beatKeys) {
            // Try direct match first (camelCase)
            const directMatch = scenePlots.find((sp: any) => sp.beat_key === beatKey);
            if (directMatch) {
                counts[beatKey] = parseInt(directMatch.count);
                continue;
            }

            // Try numeric index match
            const numericKey = keyToIndex[beatKey];
            if (numericKey) {
                const numericMatch = scenePlots.find((sp: any) => sp.beat_key === numericKey);
                if (numericMatch) {
                    counts[beatKey] = parseInt(numericMatch.count);
                    continue;
                }
            }

            // Try reverse - if beatKey is numeric, find camelCase
            const camelKey = indexToKey[beatKey];
            if (camelKey) {
                const camelMatch = scenePlots.find((sp: any) => sp.beat_key === camelKey);
                if (camelMatch) {
                    counts[beatKey] = parseInt(camelMatch.count);
                    continue;
                }
            }

            // No match found
            counts[beatKey] = 0;
        }

        return NextResponse.json({ counts });

    } catch (error) {
        console.error('Failed to fetch scene counts:', error);
        return NextResponse.json({ counts: {} });
    }
}
