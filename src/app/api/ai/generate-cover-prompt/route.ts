"use server";

import { NextRequest, NextResponse } from "next/server";

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

        // Call DeepSeek API
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    { role: 'system', content: COVER_PROMPT_SYSTEM },
                    { role: 'user', content: userPrompt },
                ],
                max_tokens: 800,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[CoverPrompt] DeepSeek error:', errorText);
            throw new Error('DeepSeek API error');
        }

        const data = await response.json();
        const generatedPrompt = data.choices?.[0]?.message?.content?.trim();

        if (!generatedPrompt) {
            throw new Error('No prompt generated');
        }

        console.log('[CoverPrompt] Generated prompt:', generatedPrompt.substring(0, 200) + '...');

        return NextResponse.json({
            success: true,
            prompt: generatedPrompt,
        });

    } catch (error) {
        console.error('[CoverPrompt] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate cover prompt' },
            { status: 500 }
        );
    }
}
