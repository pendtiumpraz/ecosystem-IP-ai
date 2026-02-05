import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-providers";

const COVER_PROMPT_SYSTEM = `You are an expert cinematic cover art prompt engineer. Your job is to create highly detailed, professional text-to-image prompts for movie/series cover art.

Based on the project information provided, generate a comprehensive prompt that includes:
- Visual style and art direction
- Color palette and lighting
- Camera angle and composition
- Character pose and expression (if protagonist is mentioned)
- Background elements and environment
- Mood and atmosphere
- Typography placement hints (leave space for title)

Output ONLY the final prompt text, no explanations or formatting. The prompt should be 150-300 words, highly detailed for image generation AI.`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[CoverPrompt] Request body:', JSON.stringify(body).substring(0, 500));

        const {
            projectTitle,
            projectDescription,
            studioName,
            mediumType,
            mainGenre,
            subGenre,
            tone,
            theme,
            coreConflict,
            protagonistName,
            artStyle,
            useI2I,
        } = body;

        // Build context for the AI
        const projectContext = [];

        if (projectTitle) projectContext.push(`Title: "${projectTitle}"`);
        if (studioName) projectContext.push(`Studio: ${studioName}`);
        if (mediumType) projectContext.push(`Format: ${mediumType}`);
        if (mainGenre) projectContext.push(`Genre: ${mainGenre}${subGenre ? ` / ${subGenre}` : ''}`);
        if (tone) projectContext.push(`Tone: ${tone}`);
        if (theme) projectContext.push(`Theme: ${theme}`);
        if (coreConflict) projectContext.push(`Core Conflict: ${coreConflict}`);
        if (protagonistName) projectContext.push(`Protagonist: ${protagonistName}`);
        if (projectDescription) projectContext.push(`Synopsis: ${projectDescription}`);
        if (artStyle) projectContext.push(`Desired Art Style: ${artStyle}`);

        const userPrompt = `Create a stunning cover art prompt for this project:

${projectContext.join('\n')}

${useI2I ? 'Note: The protagonist character image will be used as reference - focus on background, lighting, and composition that complements the character.' : ''}

Requirements:
- Professional key art quality
- Dramatic and eye-catching composition
- Leave appropriate space for title text overlay
- Capture the essence of the story's mood and genre
- Include specific details about: lighting style, color palette, camera angle, background elements, atmospheric effects

Generate ONLY the prompt text, optimized for image generation AI like Stable Diffusion or FLUX.`;

        console.log('[CoverPrompt] Calling AI via unified provider system...');

        // Call AI via the unified provider system (uses database config)
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: COVER_PROMPT_SYSTEM,
            maxTokens: 800,
            temperature: 0.8,
            tier: "trial", // Use default tier
        });

        console.log('[CoverPrompt] AI result:', aiResult.success, aiResult.provider);

        if (!aiResult.success) {
            console.error('[CoverPrompt] AI call failed:', aiResult.error);
            return NextResponse.json(
                { success: false, error: aiResult.error || 'AI generation failed' },
                { status: 500 }
            );
        }

        const generatedPrompt = aiResult.result?.trim();

        if (!generatedPrompt) {
            console.error('[CoverPrompt] No prompt in result');
            return NextResponse.json(
                { success: false, error: 'No prompt generated from AI' },
                { status: 500 }
            );
        }

        console.log('[CoverPrompt] Generated prompt:', generatedPrompt.substring(0, 200) + '...');

        return NextResponse.json({
            success: true,
            prompt: generatedPrompt,
            provider: aiResult.provider,
        });

    } catch (error: any) {
        console.error('[CoverPrompt] Error:', error.message, error.stack);
        return NextResponse.json(
            { success: false, error: `Failed to generate cover prompt: ${error.message}` },
            { status: 500 }
        );
    }
}
