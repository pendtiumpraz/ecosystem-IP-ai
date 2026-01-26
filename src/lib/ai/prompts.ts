// Story Generation Prompts

export const SYNOPSIS_PROMPT = `You are a professional screenwriter and story consultant. Generate a compelling synopsis based on the given premise.

Requirements:
- Write in the same language as the premise (Indonesian or English)
- Create a clear beginning, middle, and end
- Include main character motivation and conflict
- Keep it between 150-300 words
- Make it engaging and suitable for pitching

Premise: {premise}

Genre: {genre}
Format: {format}

Generate a professional synopsis:`;

export const STRUCTURE_PROMPTS = {
  hero: `You are a story structure expert. Generate Hero's Journey story beats based on the synopsis.

The 12 stages of Hero's Journey:
1. Ordinary World - The hero's normal life before the adventure
2. Call to Adventure - The hero is presented with a challenge
3. Refusal of the Call - The hero hesitates or refuses
4. Meeting the Mentor - The hero meets a guide
5. Crossing the Threshold - The hero commits to the adventure
6. Tests, Allies, Enemies - The hero faces challenges and meets friends/foes
7. Approach to the Inmost Cave - The hero prepares for the major challenge
8. Ordeal - The hero faces their greatest fear
9. Reward - The hero gains something from the ordeal
10. The Road Back - The hero returns home
11. Resurrection - The hero is transformed
12. Return with the Elixir - The hero brings back wisdom

Synopsis: {synopsis}

Generate a beat for each stage in JSON format:
{
  "ordinaryWorld": "...",
  "callToAdventure": "...",
  "refusalOfCall": "...",
  "meetingMentor": "...",
  "crossingThreshold": "...",
  "testsAlliesEnemies": "...",
  "approachCave": "...",
  "ordeal": "...",
  "reward": "...",
  "roadBack": "...",
  "resurrection": "...",
  "returnElixir": "..."
}`,

  cat: `You are a story structure expert. Generate Save the Cat story beats based on the synopsis.

The 15 beats of Save the Cat:
1. Opening Image - A snapshot of the protagonist's life
2. Theme Stated - The theme is hinted at
3. Set-Up - Introduce the protagonist's world
4. Catalyst - Something happens that changes everything
5. Debate - The protagonist hesitates
6. Break into Two - The protagonist makes a choice
7. B Story - A subplot begins (often a love story)
8. Fun and Games - The promise of the premise
9. Midpoint - A major event raises stakes
10. Bad Guys Close In - Problems intensify
11. All Is Lost - The protagonist hits rock bottom
12. Dark Night of the Soul - The protagonist reflects
13. Break into Three - The protagonist finds a solution
14. Finale - The protagonist faces the final challenge
15. Final Image - Shows how the protagonist has changed

Synopsis: {synopsis}

Generate a beat for each stage in JSON format:
{
  "openingImage": "...",
  "themeStated": "...",
  "setup": "...",
  "catalyst": "...",
  "debate": "...",
  "breakIntoTwo": "...",
  "bStory": "...",
  "funAndGames": "...",
  "midpoint": "...",
  "badGuysCloseIn": "...",
  "allIsLost": "...",
  "darkNightOfTheSoul": "...",
  "breakIntoThree": "...",
  "finale": "...",
  "finalImage": "..."
}`,

  harmon: `You are a story structure expert. Generate Dan Harmon's Story Circle beats based on the synopsis.

The 8 steps of Story Circle:
1. You (Comfort Zone) - A character is in their comfort zone
2. Need - But they want something
3. Go - They enter an unfamiliar situation
4. Search - Adapt to the new situation
5. Find - Get what they wanted
6. Take - Pay a heavy price for it
7. Return - Return to their familiar situation
8. Change - Having changed

Synopsis: {synopsis}

Generate a beat for each stage in JSON format:
{
  "you": "...",
  "need": "...",
  "go": "...",
  "search": "...",
  "find": "...",
  "take": "...",
  "return": "...",
  "change": "..."
}`,

  threeAct: `You are a story structure expert. Generate Three Act Structure beats based on the synopsis.

The 8 beats of Three Act Structure:
1. Setup (Act 1) - Introduce the world, characters, and the status quo
2. Inciting Incident (Act 1) - The event that sets the story in motion
3. Plot Point 1 (Act 1) - A turning point that propels the story into Act 2
4. Rising Action (Act 2) - Conflicts and obstacles escalate
5. Midpoint (Act 2) - A major revelation or reversal
6. Plot Point 2 (Act 2) - Crisis point leading to Act 3
7. Climax (Act 3) - The highest point of tension; the main conflict is addressed
8. Resolution (Act 3) - The aftermath; loose ends are tied up

Synopsis: {synopsis}

Generate a beat for each stage in JSON format:
{
  "setup": "...",
  "incitingIncident": "...",
  "plotPoint1": "...",
  "risingAction": "...",
  "midpoint": "...",
  "plotPoint2": "...",
  "climax": "...",
  "resolution": "..."
}`,

  freytag: `You are a story structure expert. Generate Freytag's Pyramid beats based on the synopsis.

The 5 phases of Freytag's Pyramid:
1. Exposition - Background information, setting, and characters are introduced
2. Rising Action - Series of events that build toward the climax
3. Climax - The turning point; highest emotional intensity
4. Falling Action - Events that unfold after the climax
5. Denouement - Final resolution of the plot

Synopsis: {synopsis}

Generate a beat for each stage in JSON format:
{
  "exposition": "...",
  "risingAction": "...",
  "climax": "...",
  "fallingAction": "...",
  "denouement": "..."
}`,

  custom: `You are a story structure expert. Generate story beats based on the custom structure provided.

Custom Structure Beats:
{customBeats}

Synopsis: {synopsis}

Generate a beat for each stage in JSON format based on the custom beat keys provided above.
Each beat should:
- Follow the story arc from setup through confrontation to resolution
- Be consistent with the synopsis provided
- Include specific actions and developments

Return JSON with the beat keys as provided in the custom structure.`,
};

export const CHARACTER_PROMPT = `You are a character designer and psychologist. Create a detailed character profile.

Character Name: {name}
Role: {role}
Story Context: {context}

Generate a comprehensive character profile including:

1. Physiological:
   - Age, gender, physical appearance
   - Distinctive features, style, clothing

2. Psychological:
   - Personality type (MBTI if applicable)
   - Fears, desires, needs
   - Strengths and weaknesses
   - Internal conflicts

3. Sociological:
   - Background, family, education
   - Social class, occupation
   - Relationships, affiliations

4. Character Arc:
   - Starting point
   - Key transformation moments
   - End state

Respond in JSON format with these categories.`;

export const WANT_NEED_MATRIX_PROMPT = `You are a story consultant specializing in character motivation. Create a Want/Need Matrix.

Synopsis: {synopsis}
Main Character: {character}

Generate a Want/Need Matrix:

WANT (External):
- What the character consciously desires
- The external goal they're pursuing
- Specific and tangible

NEED (Internal):
- What the character actually needs (often unknown to them)
- The internal change required
- Universal and emotional

Format as JSON:
{
  "want": {
    "external": "...",
    "known": "...",
    "specific": "...",
    "achieved": "How they try to achieve it"
  },
  "need": {
    "internal": "...",
    "unknown": "...",
    "universal": "...",
    "achieved": "How they discover it"
  }
}`;

export const MOODBOARD_PROMPT = `You are a visual director. Create an image generation prompt for a moodboard.

Story Beat: {beat}
Beat Description: {description}
Genre: {genre}
Visual Style: {style}

Create a detailed, cinematic image prompt that captures:
- The mood and atmosphere of the scene
- Key visual elements and composition
- Lighting and color palette
- Style reference (cinematic, dramatic, etc.)

Keep the prompt under 200 words. Focus on visual description, not narrative.`;

export const SCRIPT_PROMPT = `You are a professional screenwriter. Generate a scene script based on the story beat.

Beat: {beat}
Description: {description}
Characters Involved: {characters}
Genre: {genre}

Write a properly formatted screenplay scene including:
- Scene heading (INT/EXT, LOCATION, TIME)
- Action lines
- Character dialogue
- Parentheticals where needed

Keep the scene between 1-3 pages (approximately 1-3 minutes of screen time).`;

/**
 * SCENEPLOT PROMPT - Generate scenes and shots from story beats
 * Used for shot-by-shot planning of each beat
 */
export const SCENEPLOT_PROMPT = `You are a professional film director and cinematographer. Generate a detailed scene and shot breakdown for a story beat.

Beat Key: {beatKey}
Beat Label: {beatLabel}
Beat Content: {beatContent}
Characters: {characters}
User Preference: {preference}

SHOT TYPES available:
- establishing: Wide view to set location
- wide: Full scene with environment
- full: Full body of subject
- medium: Waist up
- medium-close: Chest up
- close-up: Face or detail
- extreme-close-up: Part of face/small detail
- over-shoulder: From behind one character
- two-shot: Two characters together
- group: Multiple characters
- pov: Point of view
- insert: Detail or reaction

CAMERA MOVEMENTS available:
- static, pan-left, pan-right, tilt-up, tilt-down
- dolly-in, dolly-out, tracking, crane-up, crane-down
- handheld, steadicam, zoom-in, zoom-out

SHOT ANGLES available:
- eye-level, high, low, dutch, birds-eye, worms-eye

Generate 1-3 scenes that break down this beat, each with 3-6 shots.

Output JSON format:
{
  "scenes": [
    {
      "sceneTitle": "Scene title in Indonesian",
      "sceneDescription": "Brief description of what happens in this scene",
      "sceneLocation": "INT/EXT - Location in Indonesian",
      "sceneTime": "day|night|dawn|dusk|morning|afternoon|evening",
      "charactersPresent": ["Character 1", "Character 2"],
      "shots": [
        {
          "shotType": "establishing|wide|medium|close-up|etc",
          "shotAngle": "eye-level|high|low|dutch|birds-eye|worms-eye",
          "cameraMovement": "static|pan-left|dolly-in|etc",
          "durationSeconds": 3,
          "shotDescription": "What we SEE in this shot - visual description",
          "action": "Character actions or dialogue in this shot"
        }
      ]
    }
  ]
}

IMPORTANT:
- Response in Indonesian for descriptions
- Keep shot descriptions visual and cinematic
- Vary shot types for visual interest
- Use camera movement purposefully
- Consider pacing and rhythm
- If user has preference, adapt the style accordingly`;
