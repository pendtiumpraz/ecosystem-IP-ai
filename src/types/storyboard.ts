// Storyboard Pipeline Types
// Generated: 2026-02-07

// ============================================
// Scene Plot - Main scene container
// ============================================
export interface ScenePlot {
    id: string;
    project_id: string;
    story_id?: string | null;

    // Scene Identity
    scene_number: number;
    title?: string | null;

    // Scene Content
    synopsis?: string | null;
    emotional_beat?: string | null;

    // Context Links
    story_beat_id?: string | null;
    story_beat_name?: string | null;

    // Location
    location?: string | null;
    location_description?: string | null;
    location_image_url?: string | null;
    time_of_day?: 'day' | 'night' | 'dawn' | 'dusk';
    weather?: string | null;

    // Characters
    characters_involved: SceneCharacter[];
    props: SceneProp[];

    // Meta
    estimated_duration: number; // seconds
    status: ScenePlotStatus;
    generation_metadata: Record<string, unknown>;

    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;

    // Joined data (populated by API)
    shots?: SceneShot[];
    active_image_version?: SceneImageVersion | null;
    active_script_version?: SceneScriptVersion | null;
    active_clip?: SceneClip | null;
}

export type ScenePlotStatus =
    | 'empty'           // Just created, no content
    | 'plotted'         // Synopsis/title filled
    | 'shot_listed'     // Has shots
    | 'storyboarded'    // Has image
    | 'scripted'        // Has script
    | 'complete';       // Has everything

export interface SceneCharacter {
    id: string;
    name: string;
    imageUrl?: string;
    role?: string;
}

export interface SceneProp {
    name: string;
    description?: string;
}

// ============================================
// Scene Shot - Camera settings per shot
// ============================================
export interface SceneShot {
    id: string;
    scene_id: string;

    // Shot Identity
    shot_number: number;

    // Camera Technical
    camera_type: CameraType;
    camera_angle: CameraAngle;
    camera_movement: CameraMovement;
    lens?: string | null;

    // Timing
    duration: number; // seconds

    // Content
    framing?: string | null;
    action?: string | null;
    blocking?: string | null;

    // Technical Notes
    lighting?: string | null;
    audio?: string | null;
    notes?: string | null;

    // Generation metadata
    generation_metadata: Record<string, unknown>;

    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export type CameraType =
    | 'wide'
    | 'medium'
    | 'close-up'
    | 'extreme-close-up'
    | 'pov'
    | 'over-shoulder';

export type CameraAngle =
    | 'eye-level'
    | 'low-angle'
    | 'high-angle'
    | 'dutch'
    | 'birds-eye'
    | 'worms-eye';

export type CameraMovement =
    | 'static'
    | 'pan'
    | 'tilt'
    | 'dolly'
    | 'tracking'
    | 'crane'
    | 'handheld'
    | 'zoom';

// ============================================
// Scene Image Version - Storyboard images
// ============================================
export interface SceneImageVersion {
    id: string;
    scene_id: string;

    // Version info
    version_number: number;

    // Image
    image_url: string;
    thumbnail_url?: string | null;
    prompt?: string | null;

    // Generation metadata
    provider?: string | null;
    model?: string | null;
    credit_cost: number;
    generation_mode: 'i2i' | 't2i';
    reference_images: string[];

    // Status
    is_active: boolean;

    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

// ============================================
// Scene Script Version - Screenplay content
// ============================================
export interface SceneScriptVersion {
    id: string;
    scene_id: string;

    // Version info
    version_number: number;

    // Script content
    script_content: string;
    word_count: number;
    dialogue_count: number;

    // Context snapshot (for detecting upstream changes)
    context_snapshot: ScriptContextSnapshot;

    // Generation metadata
    provider?: string | null;
    model?: string | null;
    credit_cost: number;
    prompt?: string | null;

    // Status
    is_active: boolean;
    is_manual_edit: boolean;

    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export interface ScriptContextSnapshot {
    scene_plot_hash?: string;
    shot_list_hash?: string;
    beat_id?: string;
    scene_synopsis?: string;
}

// ============================================
// Scene Clip - Video clips from images
// ============================================
export interface SceneClip {
    id: string;
    scene_id: string;
    shot_id?: string | null;
    image_version_id?: string | null;

    // Version info
    version_number: number;

    // Clip info
    video_url?: string | null;
    thumbnail_url?: string | null;
    duration?: number | null;

    // Movement
    camera_movement?: CameraMovement | null;
    movement_direction?: MovementDirection | null;
    movement_speed?: MovementSpeed;

    // Generation
    prompt?: string | null;
    seed_prompt_data: SeedPromptData;
    provider: string;
    model?: string | null;
    credit_cost: number;

    // Status
    status: ClipStatus;
    error_message?: string | null;
    is_active: boolean;

    // Timestamps
    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
}

export type MovementDirection =
    | 'left'
    | 'right'
    | 'up'
    | 'down'
    | 'in'
    | 'out';

export type MovementSpeed =
    | 'slow'
    | 'normal'
    | 'fast';

export type ClipStatus =
    | 'pending'
    | 'processing'
    | 'complete'
    | 'failed';

export interface SeedPromptData {
    sceneContext?: string;
    shotContext?: string;
    movementPrompt?: string;
}

// ============================================
// Storyboard Config (on projects table)
// ============================================
export interface StoryboardConfig {
    totalScenes: number;
    scenesPerMinute: number;
    generationStatus: StoryboardGenerationStatus;
    lastGeneratedAt?: string | null;
    targetDuration: number; // minutes
    sceneDistribution: SceneDistribution[];
}

export type StoryboardGenerationStatus =
    | 'not_started'
    | 'distributing'
    | 'generating_plots'
    | 'generating_shots'
    | 'generating_images'
    | 'generating_scripts'
    | 'complete';

export interface SceneDistribution {
    beatId: string;
    beatName: string;
    sceneNumbers: number[];
    sceneCount: number;
}

// ============================================
// API Request/Response Types
// ============================================

// Scene Plot CRUD
export interface CreateScenePlotRequest {
    project_id: string;
    scene_number: number;
    title?: string;
    synopsis?: string;
    emotional_beat?: string;
    story_beat_id?: string;
    story_beat_name?: string;
    location?: string;
    location_image_url?: string;
    time_of_day?: 'day' | 'night' | 'dawn' | 'dusk';
    characters_involved?: SceneCharacter[];
    estimated_duration?: number;
}

export interface UpdateScenePlotRequest {
    title?: string;
    synopsis?: string;
    emotional_beat?: string;
    story_beat_id?: string;
    story_beat_name?: string;
    location?: string;
    location_description?: string;
    location_image_url?: string;
    time_of_day?: 'day' | 'night' | 'dawn' | 'dusk';
    weather?: string;
    characters_involved?: SceneCharacter[];
    props?: SceneProp[];
    estimated_duration?: number;
    status?: ScenePlotStatus;
}

// Generation Requests
export interface GenerateSceneDistributionRequest {
    projectId: string;
    duration: number; // minutes
    storyBeats: {
        id: string;
        name: string;
        description: string;
    }[];
    synopsis: string;
}

export interface GenerateScenePlotsBatchRequest {
    projectId: string;
    sceneNumbers: number[];
    context: {
        synopsis: string;
        previousScenesSummary?: string;
        characters: SceneCharacter[];
        locations: { name: string; description?: string; imageUrl?: string }[];
        storyBeats: Record<string, { beatName: string; description: string }>;
    };
}

export interface GenerateShotsRequest {
    sceneId: string;
    scenePlot: {
        title: string;
        synopsis: string;
        location: string;
        charactersInvolved: string[];
        emotionalBeat: string;
    };
    projectStyle: {
        genre: string;
        tone: string;
        visualStyle: string;
    };
}

export interface GenerateScriptRequest {
    sceneId: string;
    forceNewVersion?: boolean; // Create new version even if no upstream changes
}

export interface GenerateSceneImageRequest {
    sceneId: string;
    shotId?: string; // Optional: generate for specific shot
    customPrompt?: string; // Optional: override auto-generated prompt
}

export interface GenerateClipRequest {
    sceneId: string;
    imageVersionId: string;
    shotId?: string;
    movement: CameraMovement;
    direction?: MovementDirection;
    speed?: MovementSpeed;
    customPrompt?: string;
}

// List/Query Types
export interface ListScenePlotsQuery {
    projectId: string;
    includeDeleted?: boolean;
    status?: ScenePlotStatus;
    storyBeatId?: string;
}

export interface ListVersionsQuery {
    sceneId: string;
    includeDeleted?: boolean;
}
