import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { callAI } from '@/lib/ai-providers';
import { deductCredits } from '@/lib/ai-generation';

const sql = neon(process.env.DATABASE_URL!);

// POST /api/scene-plots/[id]/generate-image
// Generates a storyboard image using I2I with character & location references
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sceneId } = await params;
        const body = await request.json();
        const { userId, aspectRatio = '16:9', strength = 0.6 } = body;

        if (!userId) {
            return NextResponse.json({ error: 'userId required' }, { status: 400 });
        }

        // 1. Get scene data with all context
        const sceneResult = await sql`
            SELECT 
                sp.*,
                p.id as project_id,
                p.visual_style,
                p.genre
            FROM scene_plots sp
            JOIN projects p ON sp.project_id = p.id
            WHERE sp.id = ${sceneId}
            AND sp.deleted_at IS NULL
        `;

        if (sceneResult.length === 0) {
            return NextResponse.json({ error: 'Scene not found' }, { status: 404 });
        }

        const scene = sceneResult[0];

        // Check if scene has enough data
        if (!scene.synopsis && !scene.title) {
            return NextResponse.json(
                { error: 'Scene needs at least a title or synopsis to generate image' },
                { status: 400 }
            );
        }

        // 2. Collect character references
        const characterRefs: string[] = [];
        const characterDescs: string[] = [];

        if (scene.characters_involved && Array.isArray(scene.characters_involved)) {
            // Get character images for reference
            for (const char of scene.characters_involved.slice(0, 3)) { // Max 3 characters
                if (char.imageUrl) {
                    characterRefs.push(char.imageUrl);
                }
                // Build character description for prompt
                if (char.name) {
                    let desc = char.name;
                    if (char.visualDescription) {
                        desc += ` (${char.visualDescription})`;
                    }
                    characterDescs.push(desc);
                }
            }
        }

        // 3. Collect location reference
        const locationRefs: string[] = [];
        if (scene.location_image_url) {
            locationRefs.push(scene.location_image_url);
        }

        // 4. Combine all references (max 4 total)
        const allRefs = [...characterRefs, ...locationRefs].slice(0, 4);

        // 5. Build prompt from scene data
        const visualStyle = scene.visual_style || 'cinematic anime style';
        const location = scene.location || 'undefined location';
        const timeOfDay = scene.time_of_day || 'day';
        const weather = scene.weather || '';
        const emotionalBeat = scene.emotional_beat || '';

        let prompt = `${visualStyle}, `;

        // Add camera/shot style
        prompt += 'wide cinematic shot, ';

        // Add location and atmosphere
        prompt += `${location}, ${timeOfDay}`;
        if (weather) prompt += `, ${weather} weather`;
        prompt += ', ';

        // Add characters
        if (characterDescs.length > 0) {
            prompt += characterDescs.join(', ') + ', ';
        }

        // Add scene action/synopsis
        if (scene.synopsis) {
            // Extract key visual elements from synopsis (first sentence)
            const firstSentence = scene.synopsis.split('.')[0];
            prompt += firstSentence + ', ';
        } else if (scene.title) {
            prompt += scene.title + ', ';
        }

        // Add emotional tone
        if (emotionalBeat) {
            prompt += `${emotionalBeat} mood, `;
        }

        // Add quality tags
        prompt += 'high quality, detailed, professional cinematography, movie screenshot';

        console.log('[Generate Storyboard] Scene:', sceneId);
        console.log('[Generate Storyboard] References:', allRefs.length);
        console.log('[Generate Storyboard] Prompt:', prompt.slice(0, 200));

        // 6. Call AI for image generation
        let imageResult;

        if (allRefs.length > 0) {
            // Use I2I with references
            imageResult = await callAI('image-to-image', prompt, {
                userId,
                referenceImageUrl: allRefs[0],
                referenceImageUrls: allRefs,
                aspectRatio,
                strength
            });
        } else {
            // Fallback to T2I if no references
            imageResult = await callAI('image', prompt, {
                userId,
                aspectRatio
            });
        }

        if (!imageResult.success || !imageResult.result) {
            return NextResponse.json(
                { error: imageResult.error || 'Failed to generate image' },
                { status: 500 }
            );
        }

        const imageUrl = imageResult.result;
        const creditCost = imageResult.creditCost || 5;

        // 7. Create scene_image_versions record
        const versionResult = await sql`
            INSERT INTO scene_image_versions (
                scene_id,
                image_url,
                prompt,
                provider,
                model,
                credit_cost,
                generation_params,
                is_active
            ) VALUES (
                ${sceneId},
                ${imageUrl},
                ${prompt},
                ${imageResult.provider || 'unknown'},
                ${'unknown'},
                ${creditCost},
                ${JSON.stringify({
            aspectRatio,
            strength,
            referenceCount: allRefs.length,
            type: allRefs.length > 0 ? 'i2i' : 't2i'
        })}::jsonb,
                TRUE
            )
            RETURNING id
        `;

        const newVersionId = versionResult[0]?.id;

        // 8. Deactivate other versions and update scene
        if (newVersionId) {
            await sql`
                UPDATE scene_image_versions 
                SET is_active = FALSE 
                WHERE scene_id = ${sceneId} AND id != ${newVersionId}
            `;

            // Update scene with active image info and status
            await sql`
                UPDATE scene_plots 
                SET 
                    storyboard_image_url = ${imageUrl},
                    storyboard_prompt = ${prompt},
                    status = CASE 
                        WHEN status = 'empty' THEN 'storyboarded'
                        WHEN status = 'plotted' THEN 'storyboarded'
                        ELSE status 
                    END,
                    updated_at = NOW()
                WHERE id = ${sceneId}
            `;
        }

        // 9. Deduct credits
        await deductCredits(
            userId,
            creditCost,
            'image_generation',
            `storyboard_${sceneId}`,
            `Storyboard image for scene ${scene.scene_number}`
        );

        return NextResponse.json({
            success: true,
            imageUrl,
            versionId: newVersionId,
            prompt,
            creditCost,
            referenceCount: allRefs.length
        });

    } catch (error) {
        console.error('[Generate Storyboard] Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate storyboard image' },
            { status: 500 }
        );
    }
}
