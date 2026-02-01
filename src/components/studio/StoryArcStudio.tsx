'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BookOpen, Target, Zap, Mountain, Activity,
    ChevronRight, AlignLeft, Layout, MousePointerClick,
    RefreshCcw, MoveRight, Star, Heart, Skull, Sparkles,
    Users, User, FileText, Layers, Play, Eye, Plus, Loader2, Wand2, Edit3,
    Trash2, RotateCcw, Image as ImageIcon, Film, AlertCircle, Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchableStoryDropdown } from './SearchableStoryDropdown';
import { WantNeedMatrixV2 } from './WantNeedMatrixV2';
import { KeyActionView } from './KeyActionView';
import { ScenePlotView } from './ScenePlotStudio';
import { CreateAnimationVersionModal } from './CreateAnimationVersionModal';
import { CreateMoodboardModal } from './CreateMoodboardModal';
import { PrerequisiteWarningModal } from './PrerequisiteWarningModal';
import { CustomStructureEditor, CustomStructureDefinition, CustomBeat } from './CustomStructureEditor';

// Interfaces
export interface CharacterData {
    id: string;
    name: string;
    role: string;
    archetype?: string;
    imagePoses?: { portrait?: string };
    [key: string]: any;
}

export interface StoryData {
    premise: string;
    synopsis?: string;
    theme: string;
    tone: string;
    genre: string;
    structure: string;
    conflict?: string;

    // NEW: Reference fields for episode-specific generation (optional INPUT for AI)
    premiseReference?: string;  // Optional guidance/reference for premise generation per episode
    synopsisReference?: string;  // Optional guidance/reference for synopsis generation per episode
    globalSynopsisReference?: string;  // Optional guidance/reference for global synopsis per episode

    // NEW: Global Synopsis & Preferences (Deck Slide 9)
    globalSynopsis?: string;
    synopsisPreference?: string;
    globalSynopsisPreference?: string;

    // NEW: Ending Types with Rasa (Deck Slide 10)
    endingType?: string; // Values: 'happy' | 'sad' | 'bitter_sweet' | 'ambiguous' | 'cliffhanger' | 'twisted'
    endingRasa?: string; // Emotional quality inspired by Navarasa

    // Beats
    catBeats: Record<string, string>;
    heroBeats: Record<string, string>;
    harmonBeats: Record<string, string>;
    threeActBeats?: Record<string, string>;     // NEW: Three Act
    freytagBeats?: Record<string, string>;      // NEW: Freytag's Pyramid
    customBeats?: Record<string, string>;       // NEW: Custom structure

    // Custom structure definition (user-defined beats)
    customStructureDefinition?: CustomStructureDefinition;

    // Character assignments per beat
    beatCharacters?: Record<string, string[]>;

    // Tension levels for Arc View graph (1-100 per beat)
    tensionLevels?: Record<string, number>;

    // Want/Need Matrix (V1 - existing)
    wantNeedMatrix?: {
        want?: { external?: string; known?: string; specific?: string; achieved?: string };
        need?: { internal?: string; unknown?: string; universal?: string; achieved?: string };
    };

    // NEW: Want/Need Matrix V2 (Deck Slide 10) - Journey stages
    wantStages?: {
        menginginkan?: string;  // Wanting (initial desire)
        memastikan?: string;    // Ensuring (committing to it)
        mengejar?: string;      // Chasing (pursuing actively)
        tercapai?: boolean;     // Achieved (yes/no)
    };
    needStages?: {
        membutuhkan?: string;   // Needing (internal need)
        menemukan?: string;     // Discovering (finding the truth)
        menerima?: string;      // Accepting (embracing change)
        terpenuhi?: boolean;    // Fulfilled (yes/no)
    };

    [key: string]: any;
}

interface StoryItem {
    id: string;
    name: string;
}

interface DeletedStoryItem {
    id: string;
    versionName: string;
    structure: string;
    deletedAt: string;
}

// Key Action data from moodboard
interface KeyActionData {
    id: string;
    index: number;
    description: string | null;
    charactersInvolved: string[];
    universeLevel: string | null;
    hasPrompt: boolean;
    hasImage: boolean;
}

interface BeatKeyActions {
    beatLabel: string;
    beatContent: string | null;
    beatIndex: number;
    keyActions: KeyActionData[];
}

interface StoryArcStudioProps {
    story: StoryData;
    characters?: CharacterData[];
    projectDescription?: string;
    // Multiple stories support
    stories?: StoryItem[];
    deletedStories?: DeletedStoryItem[];
    selectedStoryId?: string;
    onSelectStory?: (storyId: string) => void;
    onNewStory?: () => void;
    onEditStory?: () => void;
    onDeleteStory?: (storyId: string) => void;
    onRestoreStory?: (storyId: string) => void;
    // New: Structure locked at creation
    structureType?: string; // hero-journey, save-the-cat, dan-harmon
    // New: Characters linked to this story
    storyCharacterIds?: string[];
    // Updates
    onUpdate: (updates: Partial<StoryData>) => void;
    onGenerate?: (field: string) => void;
    onGeneratePremise?: () => void;
    isGenerating?: boolean;
    isGeneratingPremise?: boolean;
    // Key actions / Moodboard integration
    projectId?: string;
    userId?: string;
    onOpenMoodboard?: () => void;
    showCreateMoodboardModal?: boolean;
    onCreateMoodboard?: (artStyle: string, keyActionCount: number) => Promise<void>;
}

// BEAT DEFINITIONS
const STC_BEATS = [
    { key: 'openingImage', label: 'Opening Image', desc: 'A snapshot of the hero\'s world before the adventure.', act: 1 },
    { key: 'themeStated', label: 'Theme Stated', desc: 'What the story is really about.', act: 1 },
    { key: 'setup', label: 'Set-up', desc: 'Expand on the "before" world.', act: 1 },
    { key: 'catalyst', label: 'Catalyst', desc: 'The life-changing event.', act: 1 },
    { key: 'debate', label: 'Debate', desc: 'The hero resists the call.', act: 1 },
    { key: 'breakIntoTwo', label: 'Break into 2', desc: 'The hero enters the new world.', act: 2 },
    { key: 'bStory', label: 'B Story', desc: 'The love story or helper story.', act: 2 },
    { key: 'funAndGames', label: 'Fun and Games', desc: 'The promise of the premise.', act: 2 },
    { key: 'midpoint', label: 'Midpoint', desc: 'False victory or false defeat.', act: 2 },
    { key: 'badGuysCloseIn', label: 'Bad Guys Close In', desc: 'The stakes get higher.', act: 2 },
    { key: 'allIsLost', label: 'All is Lost', desc: 'Rock bottom.', act: 2 },
    { key: 'darkNightOfTheSoul', label: 'Dark Night of the Soul', desc: 'The hero reflects and gathers strength.', act: 2 },
    { key: 'breakIntoThree', label: 'Break into 3', desc: 'The solution is found.', act: 3 },
    { key: 'finale', label: 'Finale', desc: 'The final showdown.', act: 3 },
    { key: 'finalImage', label: 'Final Image', desc: 'Change has occurred.', act: 3 },
];

const HERO_BEATS = [
    { key: 'ordinaryWorld', label: 'Ordinary World', desc: 'The hero in their normal life.', act: 1 },
    { key: 'callToAdventure', label: 'Call to Adventure', desc: 'Something shakes up the situation.', act: 1 },
    { key: 'refusalOfCall', label: 'Refusal of Call', desc: 'The hero fears the unknown.', act: 1 },
    { key: 'meetingMentor', label: 'Meeting the Mentor', desc: 'Hero gets supplies or advice.', act: 1 },
    { key: 'crossingThreshold', label: 'Crossing Threshold', desc: 'Committing to the journey.', act: 2 },
    { key: 'testsAlliesEnemies', label: 'Tests, Allies, Enemies', desc: 'Exploring the new world.', act: 2 },
    { key: 'approachCave', label: 'Approach to Inmost Cave', desc: 'Preparing for the main danger.', act: 2 },
    { key: 'ordeal', label: 'The Ordeal', desc: 'The central crisis.', act: 2 },
    { key: 'reward', label: 'The Reward', desc: 'Seizing the sword.', act: 2 },
    { key: 'roadBack', label: 'The Road Back', desc: 'Recommitment to complete the journey.', act: 3 },
    { key: 'resurrection', label: 'Resurrection', desc: 'Final exam where hero is tested once more.', act: 3 },
    { key: 'returnElixir', label: 'Return with Elixir', desc: 'Hero returns home changed.', act: 3 },
];

const HARMON_BEATS = [
    { key: 'you', label: 'You (Comfort Zone)', desc: 'A character in their comfort zone.', act: 1 },
    { key: 'need', label: 'Need', desc: 'But they want something.', act: 1 },
    { key: 'go', label: 'Go', desc: 'They enter an unfamiliar situation.', act: 2 },
    { key: 'search', label: 'Search', desc: 'Adapt to the new situation.', act: 2 },
    { key: 'find', label: 'Find', desc: 'Get what they wanted.', act: 2 },
    { key: 'take', label: 'Take', desc: 'Pay a heavy price for it.', act: 3 },
    { key: 'return', label: 'Return', desc: 'Return to their familiar situation.', act: 3 },
    { key: 'change', label: 'Change', desc: 'Having changed.', act: 3 },
];

// NEW: Three Act Structure (Deck Slide 11)
const THREE_ACT_BEATS = [
    { key: 'setup', label: 'Setup', desc: 'Introduce the world, characters, and the status quo.', act: 1 },
    { key: 'incitingIncident', label: 'Inciting Incident', desc: 'The event that sets the story in motion.', act: 1 },
    { key: 'plotPoint1', label: 'Plot Point 1', desc: 'A turning point that propels the story into Act 2.', act: 1 },
    { key: 'risingAction', label: 'Rising Action', desc: 'Conflicts and obstacles escalate.', act: 2 },
    { key: 'midpoint', label: 'Midpoint', desc: 'A major revelation or reversal.', act: 2 },
    { key: 'plotPoint2', label: 'Plot Point 2', desc: 'Crisis point leading to Act 3.', act: 2 },
    { key: 'climax', label: 'Climax', desc: 'The highest point of tension; the main conflict is addressed.', act: 3 },
    { key: 'resolution', label: 'Resolution', desc: 'The aftermath; loose ends are tied up.', act: 3 },
];

// NEW: Freytag's Pyramid (Deck Slide 11)
const FREYTAG_BEATS = [
    { key: 'exposition', label: 'Exposition', desc: 'Background information, setting, and characters are introduced.', act: 1 },
    { key: 'risingAction', label: 'Rising Action', desc: 'Series of events that build toward the climax.', act: 2 },
    { key: 'climax', label: 'Climax', desc: 'The turning point; highest emotional intensity.', act: 2 },
    { key: 'fallingAction', label: 'Falling Action', desc: 'Events that unfold after the climax.', act: 3 },
    { key: 'denouement', label: 'Denouement', desc: 'Final resolution of the plot.', act: 3 },
];

// NEW: Ending Types with Rasa (Deck Slide 10)
const ENDING_TYPES = [
    { key: 'happy', label: 'Happy', icon: '😊', desc: 'Protagonist achieves goals, positive resolution', color: 'emerald' },
    { key: 'sad', label: 'Sad', icon: '😢', desc: 'Tragic ending, loss or defeat', color: 'blue' },
    { key: 'bitter_sweet', label: 'Bitter Sweet', icon: '🥹', desc: 'Mix of joy and sorrow, bittersweet victory', color: 'amber' },
    { key: 'ambiguous', label: 'Ambiguous', icon: '🤔', desc: 'Open to interpretation, unresolved', color: 'purple' },
    { key: 'cliffhanger', label: 'Cliffhanger', icon: '😱', desc: 'Suspenseful, leaves audience wanting more', color: 'red' },
    { key: 'twisted', label: 'Twisted', icon: '🌀', desc: 'Unexpected revelation that changes everything', color: 'pink' },
];

type ViewMode = 'arc' | 'beats' | 'script' | 'keyactions' | 'sceneplot';

export function StoryArcStudio({
    story,
    characters = [],
    projectDescription,
    stories = [],
    deletedStories = [],
    selectedStoryId,
    onSelectStory,
    onNewStory,
    onEditStory,
    onDeleteStory,
    onRestoreStory,
    structureType,
    storyCharacterIds = [],
    onUpdate,
    onGenerate,
    onGeneratePremise,
    isGenerating,
    isGeneratingPremise,
    // Key actions / Moodboard integration
    projectId,
    userId,
    onOpenMoodboard,
}: StoryArcStudioProps) {
    const [activeBeat, setActiveBeat] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('arc');
    const [isEditingTension, setIsEditingTension] = useState(false);
    const [storySearchQuery, setStorySearchQuery] = useState('');

    // Key Actions state
    const [keyActionsByBeat, setKeyActionsByBeat] = useState<Record<string, BeatKeyActions>>({});
    const [moodboardInfo, setMoodboardInfo] = useState<{
        id: string;
        versionName: string;
        artStyle: string;
        keyActionCount: number;
    } | null>(null);
    const [hasMoodboard, setHasMoodboard] = useState(false);
    const [isLoadingKeyActions, setIsLoadingKeyActions] = useState(false);
    const [isGeneratingKeyActions, setIsGeneratingKeyActions] = useState(false);
    const [showKeyActionsPanel, setShowKeyActionsPanel] = useState(false);
    const [keyActionsStats, setKeyActionsStats] = useState({ total: 0, withDescription: 0, percent: 0 });

    // Animation Version state for Scene Plot
    const [animationVersionId, setAnimationVersionId] = useState<string | null>(null);
    const [showCreateAnimationVersionModal, setShowCreateAnimationVersionModal] = useState(false);

    // Prerequisite modals state
    const [showCreateMoodboardModal, setShowCreateMoodboardModal] = useState(false);
    const [showMoodboardWarning, setShowMoodboardWarning] = useState(false);
    const [showKeyActionsWarning, setShowKeyActionsWarning] = useState(false);

    // Custom Structure Editor state
    const [showCustomStructureEditor, setShowCustomStructureEditor] = useState(false);

    // Fetch key actions from moodboard
    const loadKeyActions = useCallback(async () => {
        if (!projectId || !selectedStoryId) return;

        setIsLoadingKeyActions(true);
        try {
            const res = await fetch(
                `/api/creator/projects/${projectId}/story-key-actions?storyVersionId=${selectedStoryId}`
            );
            if (res.ok) {
                const data = await res.json();
                setHasMoodboard(data.hasMoodboard);
                setMoodboardInfo(data.moodboard);
                setKeyActionsByBeat(data.keyActionsByBeat || {});
                if (data.stats) {
                    setKeyActionsStats({
                        total: data.stats.totalKeyActions,
                        withDescription: data.stats.keyActionsWithDescription,
                        percent: data.stats.completionPercent,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load key actions:', error);
        } finally {
            setIsLoadingKeyActions(false);
        }
    }, [projectId, selectedStoryId]);

    // Load key actions when story version changes
    useEffect(() => {
        if (projectId && selectedStoryId) {
            loadKeyActions();
        }
    }, [projectId, selectedStoryId, loadKeyActions]);

    // Generate key actions handler - uses existing moodboard APIs
    const handleGenerateKeyActions = async (beatKey?: string) => {
        if (!projectId || !selectedStoryId || !userId) {
            console.error('Missing projectId, selectedStoryId, or userId');
            return;
        }

        // If no moodboard exists, redirect to moodboard tab to create one
        if (!hasMoodboard || !moodboardInfo) {
            if (onOpenMoodboard) {
                onOpenMoodboard();
            }
            return;
        }

        setIsGeneratingKeyActions(true);
        try {
            // Generate key actions via existing moodboard generate endpoint
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    moodboardId: moodboardInfo.id,
                    type: 'key_actions',
                    userId,
                    beatKey, // Optional: generate for specific beat only
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to generate key actions');
            }

            // Reload key actions after generation
            await loadKeyActions();
        } catch (error: any) {
            console.error('Failed to generate key actions:', error.message);
        } finally {
            setIsGeneratingKeyActions(false);
        }
    };

    // Use structureType if provided (locked), otherwise fallback to story.structure
    const effectiveStructure = structureType || story.structure || 'save-the-cat';

    // Map both old and new format to display names
    const getStructureDisplayName = (type: string) => {
        const normalized = type?.toLowerCase().replace(/['\s]/g, '-').replace(/--+/g, '-');
        if (normalized?.includes('hero')) {
            return "Hero's Journey";
        }
        if (normalized?.includes('harmon')) {
            return 'Dan Harmon';
        }
        if (normalized?.includes('three') || normalized?.includes('3-act')) {
            return 'Three Act';
        }
        if (normalized?.includes('freytag') || normalized?.includes('pyramid')) {
            return "Freytag's Pyramid";
        }
        if (normalized?.includes('custom')) {
            return story.customStructureDefinition?.name || 'Custom';
        }
        return 'Save the Cat';
    };

    // Check if using custom structure
    const isCustomStructure = effectiveStructure === 'custom' || effectiveStructure?.toLowerCase().includes('custom');

    const currentStructure = getStructureDisplayName(effectiveStructure);

    // Get characters linked to this story
    const linkedCharacters = characters.filter(c => storyCharacterIds.includes(c.id));

    const getBeatsConfig = () => {
        switch (effectiveStructure) {
            case 'hero-journey':
            case "The Hero's Journey": return HERO_BEATS;
            case 'dan-harmon':
            case 'Dan Harmon Story Circle': return HARMON_BEATS;
            case 'three-act':
            case 'Three Act Structure': return THREE_ACT_BEATS;
            case 'freytag':
            case "Freytag's Pyramid": return FREYTAG_BEATS;
            case 'custom':
                // Return custom beats from structure definition, or empty array if not defined
                if (story.customStructureDefinition?.beats) {
                    return story.customStructureDefinition.beats;
                }
                return [];
            default: return STC_BEATS;
        }
    };

    const getBeatsFieldName = () => {
        switch (effectiveStructure) {
            case 'hero-journey':
            case "The Hero's Journey": return 'heroBeats';
            case 'dan-harmon':
            case 'Dan Harmon Story Circle': return 'harmonBeats';
            case 'three-act':
            case 'Three Act Structure': return 'threeActBeats';
            case 'freytag':
            case "Freytag's Pyramid": return 'freytagBeats';
            case 'custom': return 'customBeats';
            default: return 'catBeats';
        }
    };

    const beats = getBeatsConfig();
    const beatsFieldName = getBeatsFieldName();
    const beatData = (story as any)[beatsFieldName] || {};
    const beatCharacters = story.beatCharacters || {};

    const updateBeat = (key: string, value: string) => {
        onUpdate({
            [beatsFieldName]: {
                ...beatData,
                [key]: value
            }
        });
    };

    const toggleCharacterInBeat = (beatKey: string, charId: string) => {
        const current = beatCharacters[beatKey] || [];
        const updated = current.includes(charId)
            ? current.filter(id => id !== charId)
            : [...current, charId];
        onUpdate({
            beatCharacters: {
                ...beatCharacters,
                [beatKey]: updated
            }
        });
    };

    const getActColor = (act: number) => {
        switch (act) {
            case 1: return 'from-blue-500 to-cyan-500';
            case 2: return 'from-orange-500 to-amber-500';
            case 3: return 'from-emerald-500 to-teal-500';
            default: return 'from-slate-500 to-gray-500';
        }
    };

    // Generate full script from beats
    const generateFullScript = () => {
        return beats.map((beat, idx) => {
            const content = beatData[beat.key] || '';
            const chars = (beatCharacters[beat.key] || [])
                .map(id => characters.find(c => c.id === id)?.name)
                .filter(Boolean);
            return `## ${idx + 1}. ${beat.label}\n${chars.length ? `*Characters: ${chars.join(', ')}*\n` : ''}${content || '*[Not written yet]*'}`;
        }).join('\n\n---\n\n');
    };

    return (
        <div className="flex flex-col gap-2 md:gap-4 relative">

            {/* TOP TOOLBAR - Responsive */}
            <div className="flex flex-wrap items-center gap-2 p-2 md:p-3 rounded-xl glass-panel">

                {/* Left: View Mode Switcher */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Button
                            variant={viewMode === 'arc' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('arc')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'arc' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Activity className="h-3 w-3" />
                            <span className="hidden sm:inline">Arc</span>
                        </Button>
                        <Button
                            variant={viewMode === 'beats' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('beats')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'beats' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <Layers className="h-3 w-3" />
                            <span className="hidden sm:inline">Beats</span>
                        </Button>
                        <Button
                            variant={viewMode === 'script' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('script')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'script' ? 'shadow-sm text-gray-900 font-bold' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <FileText className="h-3 w-3" />
                            <span className="hidden sm:inline">Script</span>
                        </Button>
                        <Button
                            variant={viewMode === 'keyactions' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!hasMoodboard) {
                                    setShowMoodboardWarning(true);
                                } else {
                                    setViewMode('keyactions');
                                }
                            }}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'keyactions' ? 'shadow-sm text-cyan-600 font-bold' : 'text-gray-500 hover:text-cyan-600'}`}
                        >
                            <Zap className="h-3 w-3" />
                            <span className="hidden sm:inline">Key Actions</span>
                        </Button>
                        <Button
                            variant={viewMode === 'sceneplot' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                if (!hasMoodboard) {
                                    setShowMoodboardWarning(true);
                                } else if (keyActionsStats.percent < 100 && keyActionsStats.total > 0) {
                                    setShowKeyActionsWarning(true);
                                } else if (!animationVersionId) {
                                    setShowCreateAnimationVersionModal(true);
                                } else {
                                    setViewMode('sceneplot');
                                }
                            }}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'sceneplot' ? 'shadow-sm text-purple-600 font-bold' : 'text-gray-500 hover:text-purple-600'}`}
                        >
                            <Film className="h-3 w-3" />
                            <span className="hidden sm:inline">Scene Plot</span>
                        </Button>
                    </div>

                    {/* Story Selector with Search - Supports many stories */}
                    {stories.length > 0 ? (
                        <>
                            <SearchableStoryDropdown
                                stories={stories.map(s => ({
                                    id: s.id,
                                    name: s.name || 'Untitled Story',
                                }))}
                                deletedStories={deletedStories.map(d => ({
                                    id: d.id,
                                    name: d.versionName,
                                    deletedAt: d.deletedAt,
                                    isDeleted: true,
                                }))}
                                selectedId={selectedStoryId}
                                onSelect={id => onSelectStory?.(id)}
                                onRestore={id => onRestoreStory?.(id)}
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onNewStory}
                                className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEditStory}
                                disabled={!selectedStoryId}
                                className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title="Edit story name & characters"
                            >
                                <Edit3 className="h-3 w-3" />
                            </Button>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => selectedStoryId && onDeleteStory?.(selectedStoryId)}
                                disabled={stories.length <= 1}
                                className="h-8 px-2 text-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-40"
                                title={stories.length <= 1 ? "Cannot delete the only story" : "Delete this story"}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        </>
                    ) : (
                        /* No stories - show Create Story button */
                        <Button
                            size="sm"
                            onClick={onNewStory}
                            className="bg-orange-500 hover:bg-orange-600 text-white h-8 px-3 gap-1"
                        >
                            <Plus className="h-3 w-3" />
                            <span>Create Story</span>
                        </Button>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-grow" />

                {/* Right: Characters + Structure + Generate */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Linked Characters - show avatars */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-md">
                            <Users className="h-4 w-4 text-orange-500" />
                        </div>
                        <div className="flex flex-col">
                            <Label className="text-[10px] text-gray-500 font-bold uppercase">Cast</Label>
                            <div className="flex items-center gap-1">
                                {linkedCharacters.length > 0 ? (
                                    <>
                                        <div className="flex -space-x-2">
                                            {linkedCharacters.slice(0, 4).map(char => (
                                                <Avatar key={char.id} className="w-6 h-6 border-2 border-white">
                                                    <AvatarImage src={char.imagePoses?.portrait} />
                                                    <AvatarFallback className="text-[8px] bg-orange-100 text-orange-600">
                                                        {char.name?.substring(0, 2).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {linkedCharacters.length > 4 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[9px] font-bold border-2 border-white">
                                                    +{linkedCharacters.length - 4}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-600 ml-1">{linkedCharacters.length}</span>
                                    </>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        {storyCharacterIds.length > 0 ? `${storyCharacterIds.length}` : '0'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Structure - Always shown as badge (locked at creation) */}
                    <div className="flex items-center gap-1">
                        <Badge className="h-8 px-2 sm:px-3 bg-orange-100 text-orange-700 hover:bg-orange-100 border border-orange-200 font-medium">
                            <BookOpen className="h-3 w-3 sm:mr-1" />
                            <span className="hidden sm:inline">{currentStructure}</span>
                        </Badge>
                        {isCustomStructure && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowCustomStructureEditor(true)}
                                className="h-8 w-8 p-0 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                title="Edit Custom Structure"
                            >
                                <Settings2 className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>

                    <Button
                        size="sm"
                        onClick={() => onGenerate?.('synopsis')}
                        disabled={isGenerating || !story.premise || characters.length === 0}
                        className="bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-500 hover:to-orange-500 text-white h-8 px-3 text-xs font-bold shadow-md shadow-orange-200"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-3 w-3 sm:mr-1 animate-spin" />
                                <span className="hidden sm:inline">Generating...</span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-3 w-3 sm:mr-1" />
                                <span className="hidden sm:inline">Generate</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* STORY DNA PANEL - Only visible in Arc view */}
            {viewMode === 'arc' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 p-2 md:p-4 rounded-xl glass-panel border border-gray-100/50">
                        <div className="lg:col-span-2 space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Premise / Logline</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onGeneratePremise}
                                    disabled={isGeneratingPremise || characters.length === 0}
                                    className="h-6 px-2 text-[10px] text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                >
                                    {isGeneratingPremise ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Wand2 className="h-3 w-3 mr-1" />
                                            Generate Premise
                                        </>
                                    )}
                                </Button>
                            </div>
                            <Textarea
                                value={story.premise || ''}
                                onChange={(e) => onUpdate({ premise: e.target.value })}
                                className="h-20 bg-white border-gray-200 text-gray-800 text-sm resize-none focus:ring-orange-200 focus:border-orange-400"
                                placeholder="A young wizard discovers he is the chosen one... (Generate from project & characters!)"
                            />
                            {/* Premise Reference - for episode-specific guidance */}
                            <div className="space-y-1 mt-2">
                                <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                    <Edit3 className="h-3 w-3 text-purple-400" />
                                    Premise Reference (Optional - for this Episode)
                                </Label>
                                <Textarea
                                    value={story.premiseReference || ''}
                                    onChange={(e) => onUpdate({ premiseReference: e.target.value })}
                                    className="min-h-[50px] bg-purple-50/50 border-purple-200 text-gray-700 text-xs resize-none focus:ring-purple-200 focus:border-purple-400 placeholder:text-gray-400"
                                    placeholder='e.g. "Episode ini fokus pada perjalanan tokoh utama ke kota baru, pertemuan dengan karakter baru X, dan konflik tentang..."'
                                />
                            </div>
                        </div>
                    </div>

                    {/* SYNOPSIS with Preference (Deck Slide 9) */}
                    <div className="p-2 md:p-4 rounded-xl glass-panel border border-gray-100/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Synopsis</Label>
                            <Badge variant="outline" className="text-[9px] h-5 bg-blue-50 text-blue-600 border-blue-200">
                                Episode/Film Level
                            </Badge>
                        </div>
                        <Textarea
                            value={story.synopsis || ''}
                            onChange={(e) => onUpdate({ synopsis: e.target.value })}
                            className="min-h-[100px] bg-white border-gray-200 text-gray-800 text-sm resize-none focus:ring-orange-200 focus:border-orange-400"
                            placeholder="A detailed synopsis of your story... (Generated automatically after clicking 'Generate Story')"
                        />
                        {/* Synopsis Reference - for episode-specific guidance */}
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                <Edit3 className="h-3 w-3 text-purple-400" />
                                Synopsis Reference (Optional - for this Episode)
                            </Label>
                            <Textarea
                                value={story.synopsisReference || ''}
                                onChange={(e) => onUpdate({ synopsisReference: e.target.value })}
                                className="min-h-[50px] bg-purple-50/50 border-purple-200 text-gray-700 text-xs resize-none focus:ring-purple-200 focus:border-purple-400 placeholder:text-gray-400"
                                placeholder='e.g. "Synopsis episode ini harus mencakup: pertemuan dengan villain, plot twist tentang keluarga, dan cliffhanger di ending..."'
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-orange-400" />
                                Synopsis Preference (Optional)
                            </Label>
                            <Textarea
                                value={story.synopsisPreference || ''}
                                onChange={(e) => onUpdate({ synopsisPreference: e.target.value })}
                                className="min-h-[60px] bg-amber-50/50 border-amber-200 text-gray-700 text-xs resize-none focus:ring-orange-200 focus:border-orange-400 placeholder:text-gray-400"
                                placeholder='e.g. "saya ingin synopsis untuk standar film festival cannes tetapi dengan sentuhan lokal, buat endingnya Bitter Sweet dan twisted"'
                            />
                        </div>
                    </div>

                    {/* GLOBAL SYNOPSIS - NEW (Deck Slide 9) */}
                    <div className="p-2 md:p-4 rounded-xl glass-panel border border-purple-200/50 bg-gradient-to-br from-purple-50/30 to-indigo-50/20 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-purple-100 rounded-lg">
                                    <BookOpen className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <Label className="text-[10px] uppercase text-purple-600 font-bold tracking-wider">Global Synopsis</Label>
                                    <p className="text-[9px] text-gray-400">For series/franchise overview</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="text-[9px] h-5 bg-purple-50 text-purple-600 border-purple-200">
                                ⭐ Series/Franchise
                            </Badge>
                        </div>
                        <Textarea
                            value={story.globalSynopsis || ''}
                            onChange={(e) => onUpdate({ globalSynopsis: e.target.value })}
                            className="min-h-[120px] bg-white border-purple-200 text-gray-800 text-sm resize-none focus:ring-purple-200 focus:border-purple-400"
                            placeholder="Write the overarching narrative for the entire series or franchise. This should encompass the grand story arc, major characters' journeys, and the ultimate resolution across multiple episodes/seasons..."
                        />
                        {/* Global Synopsis Reference - for episode-specific guidance */}
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                <Edit3 className="h-3 w-3 text-indigo-400" />
                                Global Synopsis Reference (Optional - for this Episode)
                            </Label>
                            <Textarea
                                value={story.globalSynopsisReference || ''}
                                onChange={(e) => onUpdate({ globalSynopsisReference: e.target.value })}
                                className="min-h-[50px] bg-indigo-50/50 border-indigo-200 text-gray-700 text-xs resize-none focus:ring-indigo-200 focus:border-indigo-400 placeholder:text-gray-400"
                                placeholder='e.g. "Untuk episode ini, fokuskan pada sub-arc tentang perjalanan karakter B, dan bagaimana ini terhubung ke plot utama..."'
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple-400" />
                                Global Synopsis Preference (Optional)
                            </Label>
                            <Textarea
                                value={story.globalSynopsisPreference || ''}
                                onChange={(e) => onUpdate({ globalSynopsisPreference: e.target.value })}
                                className="min-h-[60px] bg-purple-50/50 border-purple-200 text-gray-700 text-xs resize-none focus:ring-purple-200 focus:border-purple-400 placeholder:text-gray-400"
                                placeholder='e.g. "tuliskan dengan lebih dramatis dan dark seperti cliffhanger, referensi film The God Father, jangan terlalu kaku untuk market bioskop Indonesia"'
                            />
                        </div>
                    </div>



                    {/* WANT/NEED MATRIX V2 (Deck Slide 10) */}
                    <WantNeedMatrixV2
                        wantStages={story.wantStages}
                        needStages={story.needStages}
                        onUpdate={(updates) => onUpdate(updates)}
                    />
                </>
            )}

            {/* LEGACY: Old Want/Need Matrix (V1) - HIDDEN
            {(story.wantNeedMatrix?.want || story.wantNeedMatrix?.need) && (
                <div className="p-4 rounded-xl glass-panel border border-gray-200/50 bg-gray-50/50 opacity-75">
                    <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-[9px] bg-gray-100 text-gray-500 border-gray-200">
                            Legacy V1 - Read Only
                        </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-blue-100 rounded">
                                    <Target className="h-3 w-3 text-blue-600" />
                                </div>
                                <Label className="text-[10px] uppercase text-blue-600 font-bold">WANT (External Desire)</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400 text-[10px]">External:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.want?.external || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Known:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.want?.known || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Specific:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.want?.specific || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Achieved:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.want?.achieved || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1 bg-orange-100 rounded">
                                    <Heart className="h-3 w-3 text-orange-600" />
                                </div>
                                <Label className="text-[10px] uppercase text-orange-600 font-bold">NEED (Internal Growth)</Label>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-400 text-[10px]">Internal:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.need?.internal || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Unknown:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.need?.unknown || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Universal:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.need?.universal || '-'}</p>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-[10px]">Achieved:</span>
                                    <p className="text-gray-700">{story.wantNeedMatrix?.need?.achieved || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            */}

            {/* MAIN VIEW AREA */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50/50 relative">

                {/* ARC VIEW */}
                {viewMode === 'arc' && (
                    <div className="flex flex-col">
                        {/* Visual Arc */}
                        <div className="relative p-4 md:p-8 flex" style={{ minHeight: '250px' }}>
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                            {/* Toggle Button - Top Right */}
                            <div className="absolute top-2 right-2 z-20">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditingTension(!isEditingTension)}
                                    className={`h-7 text-[10px] gap-1.5 ${isEditingTension ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white'}`}
                                >
                                    {isEditingTension ? (
                                        <>
                                            <Activity className="h-3 w-3" />
                                            Show Curve
                                        </>
                                    ) : (
                                        <>
                                            <Edit3 className="h-3 w-3" />
                                            Edit Tension
                                        </>
                                    )}
                                </Button>
                            </div>

                            {/* Tension Ruler - Only in Edit Mode */}
                            {isEditingTension && (
                                <div className="relative w-8 md:w-10 h-32 md:h-48 flex flex-col justify-between text-[9px] text-gray-400 pr-2 shrink-0 mt-8">
                                    <span className="text-right">100</span>
                                    <span className="text-right">75</span>
                                    <span className="text-right">50</span>
                                    <span className="text-right">25</span>
                                    <span className="text-right">0</span>
                                </div>
                            )}

                            <div className="flex-1 max-w-5xl h-32 md:h-48 relative z-10 mt-8">
                                {/* Act Markers */}
                                <div className="absolute bottom-0 left-[20%] top-0 border-l border-dashed border-gray-300">
                                    <span className="absolute -top-6 left-1 text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-600 font-bold whitespace-nowrap">ACT 2</span>
                                </div>
                                <div className="absolute bottom-0 left-[75%] top-0 border-l border-dashed border-gray-300">
                                    <span className="absolute -top-6 left-1 text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-600 font-bold whitespace-nowrap">ACT 3</span>
                                </div>

                                {/* CURVE VIEW - Read Only (when NOT editing) */}
                                {!isEditingTension && (
                                    <svg
                                        className="absolute inset-0 w-full h-full"
                                        viewBox="0 0 100 100"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#3b82f6" />
                                                <stop offset="50%" stopColor="#8b5cf6" />
                                                <stop offset="100%" stopColor="#10b981" />
                                            </linearGradient>
                                        </defs>

                                        {/* Smooth Bezier Curve */}
                                        <path
                                            d={(() => {
                                                const defaultHeights = [30, 35, 40, 60, 50, 65, 55, 70, 90, 75, 40, 30, 55, 95, 60];
                                                const points = beats.map((beat, i) => {
                                                    const tension = story.tensionLevels?.[beat.key] || defaultHeights[i % 15];
                                                    const x = beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50;
                                                    const y = 100 - tension;
                                                    return { x, y };
                                                });

                                                if (points.length < 2) return '';

                                                // Use absolute values (viewBox handles scaling)
                                                let path = `M ${points[0].x} ${points[0].y}`;

                                                for (let i = 0; i < points.length - 1; i++) {
                                                    const p0 = points[Math.max(0, i - 1)];
                                                    const p1 = points[i];
                                                    const p2 = points[i + 1];
                                                    const p3 = points[Math.min(points.length - 1, i + 2)];

                                                    const t = 0.3;
                                                    const cp1x = p1.x + (p2.x - p0.x) * t;
                                                    const cp1y = p1.y + (p2.y - p0.y) * t;
                                                    const cp2x = p2.x - (p3.x - p1.x) * t;
                                                    const cp2y = p2.y - (p3.y - p1.y) * t;

                                                    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
                                                }

                                                return path;
                                            })()}
                                            fill="none"
                                            stroke="url(#arcGradient)"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            vectorEffect="non-scaling-stroke"
                                        />

                                        {/* Beat number labels along bottom */}
                                        {beats.map((beat, i) => {
                                            const x = beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50;
                                            return (
                                                <text
                                                    key={beat.key}
                                                    x={`${x}%`}
                                                    y="100%"
                                                    dy="12"
                                                    textAnchor="middle"
                                                    className="fill-gray-400 text-[8px] font-bold"
                                                >
                                                    {i + 1}
                                                </text>
                                            );
                                        })}
                                    </svg>
                                )}

                                {/* EDIT MODE - Draggable Bars (when editing) */}
                                {isEditingTension && (
                                    <div className="flex items-end justify-between h-full pb-4 relative z-10">
                                        {beats.map((beat, i) => {
                                            const defaultHeights = [30, 35, 40, 60, 50, 65, 55, 70, 90, 75, 40, 30, 55, 95, 60];
                                            const tension = story.tensionLevels?.[beat.key] || defaultHeights[i % 15];
                                            const isActive = activeBeat === beat.key;
                                            const hasBeatContent = !!beatData[beat.key];

                                            return (
                                                <div
                                                    key={beat.key}
                                                    className="flex flex-col items-center gap-1 group relative h-full justify-end"
                                                >
                                                    {/* Draggable Bar Container */}
                                                    <div
                                                        className="relative h-full flex items-end cursor-ns-resize"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            setActiveBeat(beat.key);

                                                            const container = e.currentTarget.parentElement?.parentElement;
                                                            if (!container) return;

                                                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                                                const rect = container.getBoundingClientRect();
                                                                const relativeY = (moveEvent.clientY - rect.top) / rect.height;
                                                                const newTension = Math.max(5, Math.min(95, Math.round((1 - relativeY) * 100)));

                                                                onUpdate({
                                                                    tensionLevels: {
                                                                        ...story.tensionLevels,
                                                                        [beat.key]: newTension
                                                                    }
                                                                });
                                                            };

                                                            const handleMouseUp = () => {
                                                                document.removeEventListener('mousemove', handleMouseMove);
                                                                document.removeEventListener('mouseup', handleMouseUp);
                                                                document.body.style.cursor = '';
                                                            };

                                                            document.body.style.cursor = 'ns-resize';
                                                            document.addEventListener('mousemove', handleMouseMove);
                                                            document.addEventListener('mouseup', handleMouseUp);
                                                        }}
                                                    >
                                                        {/* The Bar */}
                                                        <div
                                                            className={`w-4 md:w-5 transition-all duration-150 rounded-t-md ${isActive
                                                                ? 'bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.5)]'
                                                                : hasBeatContent
                                                                    ? `bg-gradient-to-t ${getActColor(beat.act)} group-hover:opacity-80`
                                                                    : 'bg-gray-300 group-hover:bg-gray-400'
                                                                }`}
                                                            style={{ height: `${tension}%`, minHeight: '8px' }}
                                                        >
                                                            {/* Drag Handle */}
                                                            <div className={`w-full h-2 rounded-t-md flex items-center justify-center ${isActive ? 'bg-orange-600' : 'bg-black/10'}`}>
                                                                <div className="w-2 h-0.5 bg-white/50 rounded" />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Beat Number */}
                                                    <span
                                                        className={`text-[8px] md:text-[9px] font-bold transition-colors cursor-pointer ${isActive ? 'text-orange-600' : 'text-gray-400 group-hover:text-gray-600'}`}
                                                        onClick={() => setActiveBeat(beat.key)}
                                                    >
                                                        {i + 1}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Beat Editor */}
                        <div className="h-[300px] bg-white border-t border-gray-200 p-4 flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.03)]">
                            {activeBeat ? (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">{beats.find(b => b.key === activeBeat)?.label}</h3>
                                            <p className="text-xs text-gray-500">{beats.find(b => b.key === activeBeat)?.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {characters.slice(0, 6).map(char => {
                                                const isInBeat = (beatCharacters[activeBeat] || []).includes(char.id);
                                                return (
                                                    <button
                                                        key={char.id}
                                                        onClick={() => toggleCharacterInBeat(activeBeat, char.id)}
                                                        className={`relative transition-all ${isInBeat ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-white' : 'opacity-50 hover:opacity-100 grayscale hover:grayscale-0'}`}
                                                        title={char.name}
                                                    >
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src={char.imagePoses?.portrait} />
                                                            <AvatarFallback className="text-[10px] bg-gray-200 text-gray-600">{char.name?.slice(0, 2)}</AvatarFallback>
                                                        </Avatar>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <Textarea
                                        value={beatData[activeBeat] || ''}
                                        onChange={(e) => updateBeat(activeBeat, e.target.value)}
                                        placeholder={`Describe what happens in "${beats.find(b => b.key === activeBeat)?.label}"...`}
                                        className="flex-1 bg-gray-50 border-gray-200 text-gray-800 text-sm resize-none focus:bg-white focus:ring-orange-200 focus:border-orange-400 min-h-[100px]"
                                    />

                                    {/* KEY ACTIONS SECTION */}
                                    <div className="mt-3 border-t border-gray-100 pt-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Film className="h-4 w-4 text-purple-500" />
                                                <span className="text-xs font-bold text-gray-700">Key Actions</span>
                                                {keyActionsByBeat[activeBeat]?.keyActions?.length > 0 && (
                                                    <Badge className="text-[9px] bg-purple-100 text-purple-600 hover:bg-purple-100">
                                                        {keyActionsByBeat[activeBeat].keyActions.filter(k => k.description).length}/
                                                        {keyActionsByBeat[activeBeat].keyActions.length}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {hasMoodboard && onOpenMoodboard && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); onOpenMoodboard(); }}
                                                        className="h-6 px-2 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                    >
                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                        Moodboard
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        // If moodboard exists, generate for this beat; otherwise redirect to create
                                                        handleGenerateKeyActions(hasMoodboard ? activeBeat : undefined);
                                                    }}
                                                    disabled={isGeneratingKeyActions || (!hasMoodboard && !beatData[activeBeat])}
                                                    className="h-6 px-2 text-[10px] text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                                >
                                                    {isGeneratingKeyActions ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                            Generating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            {hasMoodboard ? 'Regenerate' : 'Create Moodboard'}
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Key Actions List */}
                                        {keyActionsByBeat[activeBeat]?.keyActions?.length > 0 ? (
                                            <div className="flex gap-2 overflow-x-auto pb-1">
                                                {keyActionsByBeat[activeBeat].keyActions.map((action) => (
                                                    <div
                                                        key={action.id}
                                                        className={`flex-shrink-0 w-[140px] p-2 rounded-lg border text-xs ${action.description
                                                            ? 'bg-purple-50 border-purple-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-1 mb-1">
                                                            <span className="font-bold text-purple-600">#{action.index}</span>
                                                            {action.hasImage && (
                                                                <ImageIcon className="h-3 w-3 text-green-500" />
                                                            )}
                                                            {action.hasPrompt && !action.hasImage && (
                                                                <Wand2 className="h-3 w-3 text-amber-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-600 line-clamp-2">
                                                            {action.description || <span className="text-gray-400 italic">Belum di-generate</span>}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-3 text-gray-400 text-[10px]">
                                                {isLoadingKeyActions ? (
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Loading...
                                                    </div>
                                                ) : !hasMoodboard ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <AlertCircle className="h-4 w-4 text-gray-300" />
                                                        <p>Generate key actions untuk membuat moodboard</p>
                                                    </div>
                                                ) : (
                                                    <p>Belum ada key actions</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-gray-400">
                                    <div className="text-center">
                                        <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                        <p>Click a beat on the arc to edit</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* BEATS CARD VIEW */}
                {viewMode === 'beats' && (
                    <ScrollArea className="h-full">
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {beats.map((beat, idx) => {
                                const content = beatData[beat.key] || '';
                                const chars = (beatCharacters[beat.key] || []).map(id => characters.find(c => c.id === id)).filter(Boolean);
                                const beatKeyActions = keyActionsByBeat[beat.key]?.keyActions || [];
                                const keyActionsCount = beatKeyActions.filter(k => k.description).length;
                                return (
                                    <Card
                                        key={beat.key}
                                        className={`p-4 bg-white border-gray-200 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all cursor-pointer group`}
                                        onClick={() => { setActiveBeat(beat.key); setViewMode('arc'); }}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className={`text-[10px] bg-gradient-to-r ${getActColor(beat.act)} text-white border-0 opacity-80 group-hover:opacity-100`}>
                                                {idx + 1}. {beat.label}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                {keyActionsCount > 0 && (
                                                    <Badge className="text-[8px] bg-purple-100 text-purple-600 hover:bg-purple-100 h-4 px-1">
                                                        <Film className="h-2 w-2 mr-0.5" />
                                                        {keyActionsCount}
                                                    </Badge>
                                                )}
                                                {content && <div className="w-2 h-2 rounded-full bg-orange-500" />}
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-gray-500 mb-2 line-clamp-2">{beat.desc}</p>
                                        <p className="text-xs text-gray-700 line-clamp-3 min-h-[48px] font-medium">{content || <span className="text-gray-400 italic">Not written yet...</span>}</p>

                                        {/* Key Actions Preview */}
                                        {keyActionsCount > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                <div className="flex items-center gap-1 text-[9px] text-purple-600 mb-1">
                                                    <Film className="h-3 w-3" />
                                                    <span className="font-medium">Key Actions</span>
                                                </div>
                                                <p className="text-[10px] text-gray-500 line-clamp-2">
                                                    {beatKeyActions.find(k => k.description)?.description || 'No description'}
                                                </p>
                                            </div>
                                        )}

                                        {chars.length > 0 && (
                                            <div className="flex -space-x-2 mt-3">
                                                {chars.slice(0, 4).map((char: any) => (
                                                    <Avatar key={char.id} className="h-6 w-6 border-2 border-white ring-1 ring-gray-100">
                                                        <AvatarImage src={char.imagePoses?.portrait} />
                                                        <AvatarFallback className="text-[8px] bg-gray-100">{char.name?.slice(0, 2)}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                            </div>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    </ScrollArea>
                )}

                {/* FULL SCRIPT VIEW */}
                {viewMode === 'script' && (
                    <ScrollArea className="h-full">
                        <div className="max-w-3xl mx-auto p-8">
                            <div className="mb-8 text-center">
                                <h1 className="text-2xl font-bold text-white mb-2">{story.premise?.slice(0, 50) || 'Untitled Story'}...</h1>
                                <p className="text-sm text-slate-400">Structure: {currentStructure} • {beats.length} Beats</p>
                            </div>
                            <div className="prose prose-invert prose-sm max-w-none">
                                {beats.map((beat, idx) => {
                                    const content = beatData[beat.key] || '';
                                    const chars = (beatCharacters[beat.key] || []).map(id => characters.find(c => c.id === id)?.name).filter(Boolean);
                                    return (
                                        <div key={beat.key} className="mb-8 pb-8 border-b border-gray-100 last:border-0">
                                            <h3 className={`text-lg font-bold bg-gradient-to-r ${getActColor(beat.act)} bg-clip-text text-transparent mb-1`}>
                                                {idx + 1}. {beat.label}
                                            </h3>
                                            {chars.length > 0 && (
                                                <p className="text-xs text-orange-500 mb-2 flex items-center gap-1 font-medium">
                                                    <Users className="h-3 w-3" /> {chars.join(', ')}
                                                </p>
                                            )}
                                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {content || <span className="text-gray-400 italic">This beat has not been written yet...</span>}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </ScrollArea>
                )}

                {/* KEY ACTIONS VIEW */}
                {viewMode === 'keyactions' && projectId && selectedStoryId && userId && (
                    <div className="p-4" style={{ minHeight: '500px' }}>
                        <KeyActionView
                            projectId={projectId}
                            storyVersionId={selectedStoryId}
                            userId={userId}
                            beats={beats}
                            beatContents={beatData}
                            onRefresh={loadKeyActions}
                        />
                    </div>
                )}

                {/* SCENE PLOT VIEW */}
                {viewMode === 'sceneplot' && projectId && userId && (
                    <div className="p-4" style={{ minHeight: '500px' }}>
                        <ScenePlotView
                            projectId={projectId}
                            userId={userId}
                            animationVersionId={animationVersionId}
                            beats={beats}
                            onRefresh={loadKeyActions}
                            onCreateAnimationVersion={() => setShowCreateAnimationVersionModal(true)}
                        />
                    </div>
                )}

            </div>

            {/* Create Animation Version Modal */}
            <CreateAnimationVersionModal
                isOpen={showCreateAnimationVersionModal}
                onClose={() => setShowCreateAnimationVersionModal(false)}
                projectId={projectId || ''}
                storyVersionId={selectedStoryId || ''}
                moodboardId={moodboardInfo?.id || null}
                userId={userId || ''}
                onCreated={(id) => {
                    setAnimationVersionId(id);
                    setViewMode('sceneplot');
                }}
            />

            {/* Create Moodboard Modal */}
            <CreateMoodboardModal
                isOpen={showCreateMoodboardModal}
                onClose={() => setShowCreateMoodboardModal(false)}
                projectId={projectId || ''}
                storyVersionId={selectedStoryId || ''}
                userId={userId || ''}
                onCreated={() => {
                    loadKeyActions();
                    setShowCreateMoodboardModal(false);
                }}
            />

            {/* Prerequisite Warning: Moodboard Required */}
            <PrerequisiteWarningModal
                isOpen={showMoodboardWarning}
                onClose={() => setShowMoodboardWarning(false)}
                type="moodboard"
                onAction={() => {
                    setShowMoodboardWarning(false);
                    setShowCreateMoodboardModal(true);
                }}
            />

            {/* Prerequisite Warning: Key Actions Incomplete */}
            <PrerequisiteWarningModal
                isOpen={showKeyActionsWarning}
                onClose={() => setShowKeyActionsWarning(false)}
                type="keyactions"
                stats={{
                    total: keyActionsStats.total,
                    filled: keyActionsStats.withDescription,
                    percentage: keyActionsStats.percent
                }}
                onAction={() => {
                    setShowKeyActionsWarning(false);
                    setViewMode('keyactions');
                }}
            />

            {/* Custom Structure Editor Modal */}
            <CustomStructureEditor
                isOpen={showCustomStructureEditor}
                onClose={() => setShowCustomStructureEditor(false)}
                customStructure={story.customStructureDefinition}
                onSave={(structure) => {
                    onUpdate({ customStructureDefinition: structure });
                    setShowCustomStructureEditor(false);
                }}
            />
        </div>
    );
}
