import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/ai-providers";

const COVER_PROMPT_SYSTEM = `You are an expert movie poster and film cover art prompt engineer. Your specialty is creating text-to-image prompts that generate professional MOVIE POSTERS and FILM COVERS with proper typography.

Your prompts should create images that look like:
- Hollywood movie posters with title and credits
- Netflix series key art
- Film festival promotional materials
- Theatrical release posters with full typography

Based on the project information and user preference, generate a comprehensive JSON prompt structure for a FILM COVER/MOVIE POSTER.

IMPORTANT: Output ONLY valid JSON, no markdown, no explanation.

JSON Structure:
{
  "finalPrompt": "Complete text-to-image prompt for a professional movie poster. Include the art style, lighting, composition, and tell the AI to include space for title typography.",
  "elements": {
    "subject": "Main subject/character in poster pose",
    "style": "Use the exact art style from input",
    "lighting": "Dramatic poster lighting",
    "colorPalette": "Movie poster color scheme",
    "cameraAngle": "Poster composition angle",
    "background": "Poster background",
    "mood": "Film atmosphere",
    "composition": "Poster layout with space for title",
    "effects": "Cinematic effects",
    "quality": "Quality keywords including movie poster, key art"
  },
  "typography": {
    "title": {
      "text": "Movie title (use project title)",
      "style": "Bold cinematic font style (e.g., 'bold sans-serif', 'elegant serif', 'metallic 3D')",
      "color": "Title color that matches poster (hex code)",
      "position": "top" or "bottom" or "center",
      "effect": "Text effect (glow, shadow, metallic, etc.)"
    },
    "tagline": {
      "text": "One-line catchy tagline derived from description (max 10 words)",
      "style": "Italic or condensed font",
      "color": "Secondary color (hex code)"
    },
    "credits": {
      "studio": "Studio name",
      "producer": "Produced by [IP Owner name]",
      "style": "Small caps credit block style"
    }
  },
  "negativePrompt": "low quality, amateur, screenshot, photo frame, blurry, watermark"
}`;

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
            userPreference,
            resolution, // NEW: Resolution from input
            ipOwner, // NEW: IP Owner/Producer
            additionalCharacters, // NEW: Array of {name, role} for cover composition
        } = body;

        // Build context for the AI
        const projectContext = [];

        if (projectTitle) projectContext.push(`Title: "${projectTitle}"`);
        if (studioName) projectContext.push(`Studio: ${studioName}`);
        if (ipOwner) projectContext.push(`Producer/IP Owner: ${ipOwner}`);
        if (mediumType) projectContext.push(`Format: ${mediumType}`);
        if (mainGenre) projectContext.push(`Genre: ${mainGenre}${subGenre ? ` / ${subGenre}` : ''}`);
        if (tone) projectContext.push(`Tone: ${tone}`);
        if (theme) projectContext.push(`Theme: ${theme}`);
        if (coreConflict) projectContext.push(`Core Conflict: ${coreConflict}`);
        if (protagonistName) projectContext.push(`Protagonist: ${protagonistName}`);
        if (projectDescription) projectContext.push(`Synopsis: ${projectDescription}`);
        if (artStyle) projectContext.push(`Art Style: ${artStyle}`);
        if (resolution) projectContext.push(`Resolution: ${resolution}`);

        // Build character casting for cover composition
        let characterCasting = '';
        if (protagonistName || (additionalCharacters && additionalCharacters.length > 0)) {
            const castList = [];
            if (protagonistName) {
                castList.push(`- ${protagonistName} (PROTAGONIST): Center foreground, heroic pose, dominant presence, largest figure`);
            }
            if (additionalCharacters && Array.isArray(additionalCharacters)) {
                additionalCharacters.forEach((char: { name: string; role: string }, index: number) => {
                    const role = (char.role || 'Supporting').toLowerCase();
                    let positionHint = '';

                    if (role.includes('antagonist') || role.includes('villain')) {
                        positionHint = 'Background/shadows, menacing presence, contrasting lighting, ominous';
                    } else if (role.includes('sidekick') || role.includes('supporting')) {
                        positionHint = `Flanking ${index % 2 === 0 ? 'left' : 'right'}, supportive stance, slightly smaller than protagonist`;
                    } else if (role.includes('mentor')) {
                        positionHint = 'Upper portion or elevated, wise presence, guiding gesture';
                    } else if (role.includes('love') || role.includes('romantic')) {
                        positionHint = 'Close to protagonist, intimate positioning, soft lighting';
                    } else {
                        positionHint = `Supporting position ${index % 2 === 0 ? 'left' : 'right'} side`;
                    }

                    castList.push(`- ${char.name} (${char.role || 'Supporting'}): ${positionHint}`);
                });
            }
            characterCasting = `\n=== CHARACTER CASTING & POSITIONS ===
${castList.join('\n')}

IMPORTANT: The reference images show the character faces. Position them according to their roles as specified above.
The protagonist should be the LARGEST and MOST PROMINENT figure. Antagonists should contrast with the hero.`;
        }

        const userPrompt = `Create a MOVIE POSTER / FILM COVER prompt for this project:

=== PROJECT DATA ===
${projectContext.join('\n')}
${characterCasting}

=== USER PREFERENCE ===
${userPreference || 'No specific preference - create a professional movie poster based on project data'}

=== GENERATION MODE ===
${useI2I ? 'IMAGE-TO-IMAGE: Reference images show character faces. Use them AS IS but position according to their roles above.' : 'TEXT-TO-IMAGE: Generate complete movie poster with characters positioned by role.'}

=== MOVIE POSTER REQUIREMENTS ===
1. ART STYLE: Use exactly "${artStyle || 'Cinematic Movie Poster'}" style
2. RESOLUTION: Optimized for ${resolution || '768x1024'} aspect ratio
3. COMPOSITION: 
   - Position characters EXACTLY as specified in CHARACTER CASTING section
   - Protagonist MUST be center and largest
   - Clear space for title text (top or bottom third)
   - Professional theatrical poster layout

4. TYPOGRAPHY (Very Important!):
   - TITLE: "${projectTitle}" in bold cinematic font
   - TAGLINE: Create a catchy 5-10 word tagline from the description
   - STUDIO: "${studioName || 'Unknown Studio'}" 
   - PRODUCER: "${ipOwner || 'Unknown'}"
   - Choose colors that complement the poster's color palette
   - Suggest font styles that match the ${mainGenre || 'drama'} genre

5. MOOD & ATMOSPHERE:
   - ${tone || 'Dramatic'} tone
   - ${mainGenre || 'Drama'} genre visual style
   - Professional key art quality

Generate complete JSON with finalPrompt for image generation AND typography details for text overlays.`;

        console.log('[CoverPrompt] Calling AI via unified provider system...');

        // Call AI via the unified provider system (uses database config)
        const aiResult = await callAI("text", userPrompt, {
            systemPrompt: COVER_PROMPT_SYSTEM,
            maxTokens: 2000,
            temperature: 0.7,
            tier: "trial",
        });

        console.log('[CoverPrompt] AI result:', aiResult.success, aiResult.provider);

        if (!aiResult.success) {
            console.error('[CoverPrompt] AI call failed:', aiResult.error);
            return NextResponse.json(
                { success: false, error: aiResult.error || 'AI generation failed' },
                { status: 500 }
            );
        }

        let generatedData = aiResult.result?.trim();

        if (!generatedData) {
            console.error('[CoverPrompt] No data in result');
            return NextResponse.json(
                { success: false, error: 'No prompt generated from AI' },
                { status: 500 }
            );
        }

        // Clean up the response - remove markdown code blocks if present
        generatedData = generatedData.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // Try to parse as JSON
        let jsonResult;
        try {
            jsonResult = JSON.parse(generatedData);
        } catch (e) {
            // If JSON parsing fails, create a basic structure
            console.warn('[CoverPrompt] Failed to parse JSON, using text as finalPrompt');
            jsonResult = {
                finalPrompt: generatedData,
                elements: {
                    subject: protagonistName || "Hero character",
                    style: artStyle || "cinematic movie poster",
                    lighting: "dramatic rim lighting",
                    colorPalette: "genre-appropriate colors",
                    cameraAngle: "low angle hero shot",
                    background: "thematic environment",
                    mood: tone || "dramatic",
                    composition: "centered with title space",
                    effects: "cinematic lens effects",
                    quality: "movie poster, key art, 8K"
                },
                typography: {
                    title: {
                        text: projectTitle || "Untitled",
                        style: "Bold cinematic sans-serif",
                        color: "#FFFFFF",
                        position: "bottom",
                        effect: "subtle glow"
                    },
                    tagline: {
                        text: "An epic journey awaits",
                        style: "Italic condensed",
                        color: "#CCCCCC"
                    },
                    credits: {
                        studio: studioName || "Studio",
                        producer: ipOwner || "Producer",
                        style: "Small caps"
                    }
                },
                negativePrompt: "low quality, amateur, blurry, watermark"
            };
        }

        console.log('[CoverPrompt] Generated JSON prompt:', JSON.stringify(jsonResult).substring(0, 400) + '...');

        return NextResponse.json({
            success: true,
            prompt: jsonResult.finalPrompt,
            jsonPrompt: jsonResult,
            typography: jsonResult.typography,
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
