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
  "Ordinary World": "...",
  "Call to Adventure": "...",
  ...
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

Generate a beat for each stage in JSON format:`,

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

Generate a beat for each stage in JSON format:`,
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
