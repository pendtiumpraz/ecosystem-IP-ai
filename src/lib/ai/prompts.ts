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

// Generate character NAME only (when user has role but no name)
// Uses IP Project data: title, description, genre, theme, tone
export const CHARACTER_NAME_PROMPT = `You are a creative writer specializing in character naming.

=== IP PROJECT CONTEXT ===
Project Title: {projectTitle}
Project Description: {projectDescription}
Genre: {projectGenre}
Theme: {projectTheme}
Tone: {projectTone}

=== CHARACTER INFO ===
Role: {role}

=== EXISTING CHARACTERS (avoid similar/duplicate names) ===
{existingCharacters}

Generate a unique, memorable character name that:
1. Fits the project's genre, theme, and tone
2. Is appropriate for the character's role ({role})
3. Is distinct from existing character names
4. Sounds natural and memorable

Return ONLY a JSON object:
{
  "name": "<character name>",
  "nameReason": "<brief explanation why this name fits>"
}`;

// Generate character DETAILS (when user has name and role)
// Uses IP Project data: title, description, genre, theme, tone
export const CHARACTER_DETAILS_PROMPT = `You are a character designer and psychologist. Create a detailed character profile.

=== IP PROJECT CONTEXT ===
Project Title: {projectTitle}
Project Description: {projectDescription}
Genre: {projectGenre}
Theme: {projectTheme}
Tone: {projectTone}

=== CHARACTER INFO ===
Name: {name}
Role: {role}

=== EXISTING CHARACTERS (for relationship context) ===
{existingCharacters}

Generate character details that FIT the project context. Use Bahasa Indonesia for text fields.

IMPORTANT: Use ONLY these exact values for dropdown fields:

=== PHYSIOLOGICAL ===
Gender: "male", "female", "non-binary"
Age: "child", "teen", "young-adult", "adult", "middle-aged", "senior"
Ethnicity: "asian-east", "asian-southeast", "asian-south", "middle-eastern", "african", "caucasian", "latino", "mixed", "fantasy"
Skin Tone: "very-fair", "fair", "light", "medium", "tan", "olive", "brown", "dark-brown", "dark"
Face Shape: "oval", "round", "square", "heart", "oblong", "diamond", "triangle"
Eye Shape: "almond", "round", "monolid", "hooded", "upturned", "downturned", "wide-set", "close-set"
Eye Color: "brown", "dark-brown", "hazel", "green", "blue", "gray", "amber", "black", "heterochromia"
Nose Shape: "straight", "button", "roman", "wide", "narrow", "upturned", "flat"
Lips Shape: "full", "thin", "heart", "wide", "bow", "round"
Hair Color: "black", "dark-brown", "brown", "light-brown", "auburn", "red", "ginger", "blonde", "platinum", "gray", "white", "blue", "purple", "pink", "green", "ombre", "highlights"
Body Type: "slim", "athletic", "average", "muscular", "curvy", "plus-size", "petite", "tall"
Height: "very-short", "short", "average", "tall", "very-tall"

Hair Style for MALE characters: "buzzcut", "bald", "mohawk", "undercut", "curly-short", "curly-medium", "afro", "dreadlocks", "crew-cut", "fade", "textured-crop", "slick-back", "pompadour", "quiff", "man-bun", "ponytail", "straight-short", "straight-medium", "wavy-short", "wavy-medium", "receding", "shaved-sides"
Hair Style for FEMALE characters: "straight-short", "straight-medium", "straight-long", "wavy-short", "wavy-medium", "wavy-long", "curly-short", "curly-medium", "curly-long", "pixie", "bob", "bun", "ponytail", "braids", "afro", "dreadlocks", "lob", "layers", "bangs", "twin-tails", "updo", "side-swept"
Hijab (for female characters only): "none", "simple", "pashmina", "turban", "khimar", "niqab", "sport"

=== PSYCHOLOGICAL ===
Archetype (12 Jungian): "the-innocent", "the-orphan", "the-hero", "the-caregiver", "the-explorer", "the-rebel", "the-lover", "the-creator", "the-jester", "the-sage", "the-magician", "the-ruler"

=== STYLE ===
Clothing Style: "casual", "formal", "business", "streetwear", "traditional", "sporty", "bohemian", "gothic", "punk", "military", "fantasy", "sci-fi", "historical", "uniform"

Return this exact JSON structure:
{
  "physiological": {
    "age": "<value from Age list>",
    "gender": "<value from Gender list>",
    "ethnicity": "<value from Ethnicity list>",
    "skinTone": "<value from Skin Tone list>",
    "faceShape": "<value from Face Shape list>",
    "eyeShape": "<value from Eye Shape list>",
    "eyeColor": "<value from Eye Color list>",
    "noseShape": "<value from Nose Shape list>",
    "lipsShape": "<value from Lips Shape list>",
    "hairStyle": "<value based on gender - use MALE list if male, FEMALE list if female>",
    "hairColor": "<value from Hair Color list>",
    "hijab": "<value from Hijab list if female, omit or 'none' if male>",
    "bodyType": "<value from Body Type list>",
    "height": "<value from Height list>",
    "uniqueness": "<free text in Bahasa Indonesia: scars, birthmarks, tattoos, special features>"
  },
  "psychological": {
    "archetype": "<value from Archetype list>",
    "personalityType": "<MBTI type like INTJ, ENFP etc>",
    "fears": "<main psychological fear - in Bahasa Indonesia>",
    "wants": "<external conscious desire - in Bahasa Indonesia>",
    "needs": "<internal unconscious need - in Bahasa Indonesia>",
    "alterEgo": "<hidden aspect of personality - in Bahasa Indonesia>",
    "traumatic": "<past trauma or formative experience - in Bahasa Indonesia>"
  },
  "swot": {
    "strength": "<main character strength - in Bahasa Indonesia>",
    "weakness": "<main character weakness - in Bahasa Indonesia>",
    "opportunity": "<potential for growth - in Bahasa Indonesia>",
    "threat": "<what threatens this character - in Bahasa Indonesia>"
  },
  "clothingStyle": "<value from Clothing Style list>",
  "accessories": ["<accessory1>", "<accessory2>"],
  "personalityTraits": ["<trait1 in Bahasa Indonesia>", "<trait2>", "<trait3>"]
}`;

// Keep old CHARACTER_PROMPT for backward compatibility (deprecated)
export const CHARACTER_PROMPT = CHARACTER_DETAILS_PROMPT;


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
