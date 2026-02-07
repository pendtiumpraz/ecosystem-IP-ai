'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    BookOpen, Target, Zap, Mountain, Activity,
    ChevronRight, AlignLeft, Layout, MousePointerClick,
    RefreshCcw, MoveRight, Star, Heart, Skull, Sparkles,
    Users, User, FileText, Layers, Play, Eye, Plus, Loader2, Wand2, Edit3,
    Trash2, RotateCcw, Image as ImageIcon, Film, AlertCircle, Settings2,
    Lightbulb, Camera, X
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
import { ScenePlotView } from './story-formula/ScenePlotView';
import { CreateAnimationVersionModal } from './CreateAnimationVersionModal';
import { CreateMoodboardModal } from './CreateMoodboardModal';
import { PrerequisiteWarningModal } from './PrerequisiteWarningModal';
import { CustomStructureEditor, CustomStructureDefinition, CustomBeat } from './CustomStructureEditor';
import { showConfirm, loading, toast, alert } from '@/lib/sweetalert';

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

    // NEW: Reference fields for generation guidance (optional INPUT for AI)
    premiseReference?: string;  // Optional guidance/reference for premise generation
    synopsisReference?: string;  // Optional guidance/reference for synopsis generation
    globalSynopsisReference?: string;  // Optional guidance/reference for global synopsis

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

    // Dramatic Intensity levels for Arc View graph (1-3 per beat: 1=Calm, 2=Rising, 3=Intense)
    dramaticIntensity?: Record<string, number>;
    // Legacy tensionLevels (0-100) - kept for backward compatibility
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
    // New: Medium type for episodic detection
    mediumType?: string;
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
    // NEW: Re-generate specific beats based on intensity change
    onRegenerateBeats?: (beatKeys: string[], intensityLevels: Record<string, number>) => Promise<void>;
}

// Helper: Check if medium type is episodic (series format)
const isEpisodicFormat = (mediumType?: string): boolean => {
    if (!mediumType) return false;
    const lower = mediumType.toLowerCase();
    return lower.includes('series') || lower.includes('episode');
};

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

// NEW: Dramatic Intensity Levels (Dramatic Equalizer)
const DRAMATIC_INTENSITY_LEVELS = [
    { level: 1, label: 'Calm', icon: '🌿', desc: 'Setup, eksposisi, momen tenang', color: 'from-blue-400 to-blue-500', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
    { level: 2, label: 'Rising', icon: '📈', desc: 'Konflik naik, komplikasi berkembang', color: 'from-amber-400 to-orange-500', bgColor: 'bg-amber-100', textColor: 'text-amber-600' },
    { level: 3, label: 'Intense', icon: '🔥', desc: 'Klimaks, puncak emosional', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-100', textColor: 'text-red-600' },
];

type ViewMode = 'idea' | 'beats' | 'sceneplot' | 'script' | 'shotlist';

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
    mediumType,
    onUpdate,
    onGenerate,
    onGeneratePremise,
    isGenerating,
    isGeneratingPremise,
    // Key actions / Moodboard integration
    projectId,
    userId,
    onOpenMoodboard,
    onRegenerateBeats,
}: StoryArcStudioProps) {
    // Check if this is episodic format (series)
    const isEpisodic = isEpisodicFormat(mediumType);
    const [activeBeat, setActiveBeat] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('idea');
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

    // NEW: Dramatic Equalizer state - track beats with changed intensity
    const [changedIntensityBeats, setChangedIntensityBeats] = useState<Set<string>>(new Set());
    const [originalIntensity, setOriginalIntensity] = useState<Record<string, number>>({});
    const [showRegenerateWarning, setShowRegenerateWarning] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Key Action Editor state
    const [editingKeyAction, setEditingKeyAction] = useState<{ id: string; beatKey: string; description: string } | null>(null);
    const [isSavingKeyAction, setIsSavingKeyAction] = useState(false);

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

        // If no moodboard exists, show create moodboard modal
        if (!hasMoodboard || !moodboardInfo) {
            setShowCreateMoodboardModal(true);
            return;
        }

        // Check if key actions already exist - show confirmation before regenerating
        const existingKeyActions = beatKey
            ? keyActionsByBeat[beatKey]?.keyActions?.filter((k: any) => k.description).length || 0
            : Object.values(keyActionsByBeat).reduce((sum: number, beat: any) => sum + (beat?.keyActions?.filter((k: any) => k.description).length || 0), 0);

        if (existingKeyActions > 0) {
            const confirmed = await showConfirm(
                'Regenerate Key Actions?',
                `This will overwrite ${existingKeyActions} existing key action${existingKeyActions > 1 ? 's' : ''}. This action cannot be undone.`
            );
            if (!confirmed) return;
        }

        // Show loading progress
        setIsGeneratingKeyActions(true);
        loading.show('Generating Key Actions...', 'AI is analyzing story beats and generating key actions');

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

            loading.hide();

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to generate key actions');
            }

            // Reload key actions after generation (already saved to DB by the API)
            await loadKeyActions();

            // Show success notification
            toast.success('Key actions generated and saved successfully!');
        } catch (error: any) {
            loading.hide();
            console.error('Failed to generate key actions:', error.message);
            toast.error(`Failed to generate: ${error.message}`);
        } finally {
            setIsGeneratingKeyActions(false);
        }
    };

    // Save key action description
    const saveKeyAction = async () => {
        if (!editingKeyAction || !projectId) return;

        setIsSavingKeyAction(true);
        try {
            const res = await fetch(`/api/creator/projects/${projectId}/moodboard/items/${editingKeyAction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyActionDescription: editingKeyAction.description }),
            });

            if (!res.ok) throw new Error('Failed to save');

            // Update local state
            setKeyActionsByBeat(prev => {
                const beat = prev[editingKeyAction.beatKey];
                if (!beat) return prev;
                return {
                    ...prev,
                    [editingKeyAction.beatKey]: {
                        ...beat,
                        keyActions: beat.keyActions.map(ka =>
                            ka.id === editingKeyAction.id
                                ? { ...ka, description: editingKeyAction.description }
                                : ka
                        ),
                    },
                };
            });

            // Update stats
            setKeyActionsStats(prev => {
                const wasEmpty = !keyActionsByBeat[editingKeyAction.beatKey]?.keyActions.find(k => k.id === editingKeyAction.id)?.description;
                const nowHas = !!editingKeyAction.description;
                const delta = wasEmpty && nowHas ? 1 : (!wasEmpty && !nowHas ? -1 : 0);
                return {
                    ...prev,
                    withDescription: prev.withDescription + delta,
                    percent: prev.total > 0 ? Math.round(((prev.withDescription + delta) / prev.total) * 100) : 0,
                };
            });

            setEditingKeyAction(null);
        } catch (error) {
            console.error('Failed to save key action:', error);
        } finally {
            setIsSavingKeyAction(false);
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
                            variant={viewMode === 'idea' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('idea')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'idea' ? 'shadow-sm text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <Lightbulb className="h-3 w-3" />
                            <span className="hidden sm:inline">Idea</span>
                        </Button>
                        <Button
                            variant={viewMode === 'beats' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('beats')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'beats' ? 'shadow-sm text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <Layers className="h-3 w-3" />
                            <span className="hidden sm:inline">Beats</span>
                        </Button>
                        <Button
                            variant={viewMode === 'sceneplot' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => {
                                // With the new design, Scene Plot doesn't require Animation Version
                                // It works directly with scene_plots table
                                setViewMode('sceneplot');
                            }}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'sceneplot' ? 'shadow-sm text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <Film className="h-3 w-3" />
                            <span className="hidden sm:inline">Scene Plot</span>
                        </Button>
                        <Button
                            variant={viewMode === 'script' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('script')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'script' ? 'shadow-sm text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <FileText className="h-3 w-3" />
                            <span className="hidden sm:inline">Script</span>
                        </Button>
                        <Button
                            variant={viewMode === 'shotlist' ? 'white' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('shotlist')}
                            className={`gap-1 text-xs h-8 px-2 ${viewMode === 'shotlist' ? 'shadow-sm text-orange-600 font-bold' : 'text-gray-500 hover:text-orange-600'}`}
                        >
                            <Camera className="h-3 w-3" />
                            <span className="hidden sm:inline">Shot List</span>
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

                            {/* Hide manual story creation - stories are created from IP Project episode count
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onNewStory}
                                className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                            */}

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

                            {/* Delete Story Button - Hidden per user request
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
                            */}
                        </>
                    ) : (
                        /* No stories - show message */
                        <div className="flex items-center gap-2 text-xs text-gray-500 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
                            <AlertCircle className="h-3.5 w-3.5 text-orange-400" />
                            <span>No story versions available. Create a new project to get started.</span>
                        </div>
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
                            <span className="hidden sm:inline">
                                {currentStructure}
                                {isEpisodic && beats.length > 0 && (
                                    <span className="ml-1 text-orange-500">({beats.length} eps)</span>
                                )}
                            </span>
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

                    {/* Generate button - only show in idea and beats views */}
                    {(viewMode === 'idea' || viewMode === 'beats') && (
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
                    )}
                </div>
            </div>

            {/* STORY DNA PANEL - Only visible in Idea view */}
            {viewMode === 'idea' && (
                <>
                    {/* PREMISE / LOGLINE - Full width like Synopsis */}
                    <div className="p-2 md:p-4 rounded-xl glass-panel border border-gray-100/50 space-y-3">
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
                            className="min-h-[80px] bg-white border-gray-200 text-gray-800 text-sm resize-none focus:ring-orange-200 focus:border-orange-400"
                            placeholder="A young wizard discovers he is the chosen one... (Generate from project & characters!)"
                        />
                        {/* Premise Reference - for guidance */}
                        <div className="space-y-1">
                            <Label className="text-[9px] uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1">
                                <Edit3 className="h-3 w-3 text-purple-400" />
                                Premise Reference (Optional)
                            </Label>
                            <Textarea
                                value={story.premiseReference || ''}
                                onChange={(e) => onUpdate({ premiseReference: e.target.value })}
                                className="min-h-[50px] bg-purple-50/50 border-purple-200 text-gray-700 text-xs resize-none focus:ring-purple-200 focus:border-purple-400 placeholder:text-gray-400"
                                placeholder='e.g. "Fokus pada perjalanan tokoh utama ke kota baru, pertemuan dengan karakter baru X, dan konflik tentang..."'
                            />
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
                                Synopsis Reference (Optional)
                            </Label>
                            <Textarea
                                value={story.synopsisReference || ''}
                                onChange={(e) => onUpdate({ synopsisReference: e.target.value })}
                                className="min-h-[50px] bg-purple-50/50 border-purple-200 text-gray-700 text-xs resize-none focus:ring-purple-200 focus:border-purple-400 placeholder:text-gray-400"
                                placeholder='e.g. "Synopsis harus mencakup: pertemuan dengan villain, plot twist tentang keluarga, dan cliffhanger di ending..."'
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
                                Global Synopsis Reference (Optional)
                            </Label>
                            <Textarea
                                value={story.globalSynopsisReference || ''}
                                onChange={(e) => onUpdate({ globalSynopsisReference: e.target.value })}
                                className="min-h-[50px] bg-indigo-50/50 border-indigo-200 text-gray-700 text-xs resize-none focus:ring-indigo-200 focus:border-indigo-400 placeholder:text-gray-400"
                                placeholder='e.g. "Fokuskan pada sub-arc tentang perjalanan karakter B, dan bagaimana ini terhubung ke plot utama..."'
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

                {/* IDEA VIEW - Story Overview */}
                {/* viewMode === 'idea' && (
                    <div className="p-6 space-y-4">
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <h3 className="text-xs font-bold text-gray-900">Premise</h3>
                            </div>
                            <p className="text-sm text-gray-700">{story.premise || <span className="text-gray-400 italic">No premise yet</span>}</p>
                        </div>
                        <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <h3 className="text-xs font-bold text-gray-900">Synopsis</h3>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-4">{story.synopsis || <span className="text-gray-400 italic">No synopsis yet</span>}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Layers className="h-4 w-4 text-purple-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Structure</h3>
                                </div>
                                <Badge className="text-xs bg-purple-100 text-purple-700">{story.structure === 'hero' ? "Hero's Journey" : story.structure === 'cat' ? "Save the Cat" : "Dan Harmon"}</Badge>
                                <span className="text-xs text-gray-500 ml-2">{beats.length} beats</span>
                            </div>
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-2">
                                    <Heart className="h-4 w-4 text-rose-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Theme</h3>
                                </div>
                                <p className="text-sm text-gray-700">{story.theme || '-'}</p>
                            </div>
                        </div>
                        {story.wantNeedMatrix && (
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200/50">
                                <div className="flex items-center gap-2 mb-3">
                                    <Target className="h-4 w-4 text-orange-500" />
                                    <h3 className="text-xs font-bold text-gray-900">Want vs Need</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <h4 className="text-[10px] font-bold text-orange-600 mb-1">WANT</h4>
                                        <p className="text-xs text-gray-600">{story.wantNeedMatrix.want?.external || '-'}</p>
                                    </div>
                                    <div className="bg-white/60 rounded-lg p-3">
                                        <h4 className="text-[10px] font-bold text-purple-600 mb-1">NEED</h4>
                                        <p className="text-xs text-gray-600">{story.wantNeedMatrix.need?.internal || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="text-center py-4">
                            <p className="text-sm text-gray-500 mb-3">Edit beats, graph, dan key actions di Beats view</p>
                            <Button onClick={() => setViewMode('beats')} className="bg-orange-500 hover:bg-orange-600">
                                <Zap className="h-4 w-4 mr-2" /> Go to Beats
                            </Button>
                        </div>
                    </div>
                )*/}

                {/* BEATS CARD VIEW */}
                {viewMode === 'beats' && (
                    <ScrollArea className="h-full">
                        {/* DRAMATIC INTENSITY GRAPH - at top */}
                        <div className="mx-6 mt-6 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            <div className="bg-gray-50/50">
                                <div className="relative p-4 md:p-6 flex" style={{ minHeight: '180px' }}>
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />

                                    {/* Toggle Button + Apply Re-generate */}
                                    <div className="absolute top-2 right-4 z-20 flex items-center gap-2">
                                        {isEditingTension && changedIntensityBeats.size > 0 && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setShowRegenerateWarning(true)}
                                                disabled={isRegenerating}
                                                className="h-7 text-[10px] gap-1.5 bg-purple-600 hover:bg-purple-700 text-white"
                                            >
                                                {isRegenerating ? (
                                                    <>
                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                        Regenerating...
                                                    </>
                                                ) : (
                                                    <>
                                                        <RefreshCcw className="h-3 w-3" />
                                                        Apply ({changedIntensityBeats.size})
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsEditingTension(!isEditingTension)}
                                            className={`h-6 text-[9px] gap-1 ${isEditingTension ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-white'}`}
                                        >
                                            {isEditingTension ? (
                                                <><Activity className="h-3 w-3" /> Curve</>
                                            ) : (
                                                <><Edit3 className="h-3 w-3" /> Edit</>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Intensity Ruler */}
                                    {isEditingTension && (
                                        <div className="relative w-12 h-20 md:h-28 flex flex-col justify-between text-[8px] pr-1 shrink-0 mt-4">
                                            <div className="flex items-center gap-0.5"><span>🔥</span><span className="text-red-600 font-bold">3</span></div>
                                            <div className="flex items-center gap-0.5"><span>📈</span><span className="text-amber-600 font-bold">2</span></div>
                                            <div className="flex items-center gap-0.5"><span>🌿</span><span className="text-blue-600 font-bold">1</span></div>
                                        </div>
                                    )}

                                    <div className="flex-1 h-20 md:h-28 relative z-10 mt-4">
                                        {/* Act Markers */}
                                        <div className="absolute bottom-0 left-[20%] top-0 border-l border-dashed border-gray-200">
                                            <span className="absolute -top-4 left-0.5 text-[8px] px-1 py-0.5 rounded bg-blue-100 text-blue-600 font-bold">ACT2</span>
                                        </div>
                                        <div className="absolute bottom-0 left-[75%] top-0 border-l border-dashed border-gray-200">
                                            <span className="absolute -top-4 left-0.5 text-[8px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-600 font-bold">ACT3</span>
                                        </div>

                                        {/* Curve View */}
                                        {!isEditingTension && (
                                            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                <defs>
                                                    <linearGradient id="beatsArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="#3b82f6" />
                                                        <stop offset="50%" stopColor="#8b5cf6" />
                                                        <stop offset="100%" stopColor="#10b981" />
                                                    </linearGradient>
                                                </defs>
                                                <path
                                                    d={(() => {
                                                        const defInt: Record<string, number> = {
                                                            'openingImage': 1, 'themeStated': 1, 'setup': 1, 'catalyst': 2, 'debate': 2,
                                                            'ordinaryWorld': 1, 'callToAdventure': 2, 'refusalOfCall': 1, 'meetingMentor': 2,
                                                            'breakIntoTwo': 2, 'bStory': 1, 'funAndGames': 2, 'midpoint': 3, 'badGuysCloseIn': 2,
                                                            'allIsLost': 3, 'darkNightOfTheSoul': 2,
                                                            'crossingThreshold': 2, 'testsAlliesEnemies': 2, 'approachCave': 2, 'ordeal': 3, 'reward': 2,
                                                            'breakIntoThree': 2, 'finale': 3, 'finalImage': 1,
                                                            'roadBack': 2, 'resurrection': 3, 'returnWithElixir': 1,
                                                        };
                                                        const pts = beats.map((b, i) => {
                                                            const int = story.dramaticIntensity?.[b.key] ?? defInt[b.key] ?? 2;
                                                            const h = int === 1 ? 25 : int === 2 ? 55 : 90;
                                                            return { x: beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50, y: 100 - h };
                                                        });
                                                        if (pts.length < 2) return '';
                                                        let p = `M ${pts[0].x} ${pts[0].y}`;
                                                        for (let i = 0; i < pts.length - 1; i++) {
                                                            const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
                                                            const t = 0.3;
                                                            p += ` C ${p1.x + (p2.x - p0.x) * t} ${p1.y + (p2.y - p0.y) * t}, ${p2.x - (p3.x - p1.x) * t} ${p2.y - (p3.y - p1.y) * t}, ${p2.x} ${p2.y}`;
                                                        }
                                                        return p;
                                                    })()}
                                                    fill="none" stroke="url(#beatsArcGrad)" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke"
                                                />
                                                {beats.map((b, i) => (
                                                    <text key={b.key} x={`${beats.length > 1 ? (i / (beats.length - 1)) * 100 : 50}%`} y="100%" dy="8" textAnchor="middle" className="fill-gray-400 text-[6px] font-bold">{i + 1}</text>
                                                ))}
                                            </svg>
                                        )}

                                        {/* Edit Mode - Level Bars */}
                                        {isEditingTension && (
                                            <div className="flex items-end justify-between h-full pb-2 relative z-10">
                                                {beats.map((beat, i) => {
                                                    const defInt: Record<string, number> = {
                                                        'openingImage': 1, 'themeStated': 1, 'setup': 1, 'catalyst': 2, 'debate': 2,
                                                        'ordinaryWorld': 1, 'callToAdventure': 2, 'refusalOfCall': 1, 'meetingMentor': 2,
                                                        'breakIntoTwo': 2, 'bStory': 1, 'funAndGames': 2, 'midpoint': 3, 'badGuysCloseIn': 2,
                                                        'allIsLost': 3, 'darkNightOfTheSoul': 2, 'crossingThreshold': 2, 'testsAlliesEnemies': 2,
                                                        'approachCave': 2, 'ordeal': 3, 'reward': 2, 'breakIntoThree': 2, 'finale': 3, 'finalImage': 1,
                                                        'roadBack': 2, 'resurrection': 3, 'returnWithElixir': 1,
                                                    };
                                                    const intensity = story.dramaticIntensity?.[beat.key] ?? defInt[beat.key] ?? 2;
                                                    const isActive = activeBeat === beat.key;
                                                    const isChanged = changedIntensityBeats.has(beat.key);
                                                    return (
                                                        <div key={beat.key} className="flex flex-col items-center gap-0.5 h-full justify-end">
                                                            <div className="flex flex-col gap-0.5 h-full justify-end">
                                                                {[3, 2, 1].map(level => {
                                                                    const lvl = DRAMATIC_INTENSITY_LEVELS.find(l => l.level === level)!;
                                                                    const isOn = level <= intensity;
                                                                    return (
                                                                        <button
                                                                            key={level}
                                                                            className={`w-3 md:w-4 h-[30%] rounded-sm transition-all ${isOn ? `bg-gradient-to-t ${lvl.color}` : 'bg-gray-200 hover:bg-gray-300'} ${isChanged ? 'ring-1 ring-purple-400' : ''} ${isActive && isOn ? 'ring-2 ring-orange-400' : ''}`}
                                                                            onClick={() => {
                                                                                const prev = story.dramaticIntensity?.[beat.key] ?? defInt[beat.key] ?? 2;
                                                                                if (level !== prev) {
                                                                                    if (!originalIntensity[beat.key]) setOriginalIntensity(p => ({ ...p, [beat.key]: prev }));
                                                                                    setChangedIntensityBeats(p => new Set([...p, beat.key]));
                                                                                }
                                                                                onUpdate({ dramaticIntensity: { ...story.dramaticIntensity, [beat.key]: level } });
                                                                                setActiveBeat(beat.key);
                                                                            }}
                                                                            title={`${lvl.icon} ${lvl.label}`}
                                                                        />
                                                                    );
                                                                })}
                                                            </div>
                                                            <div className="flex items-center gap-0.5">
                                                                {isChanged && <div className="w-1 h-1 rounded-full bg-purple-500" />}
                                                                <span className={`text-[6px] font-bold ${isActive ? 'text-orange-600' : isChanged ? 'text-purple-600' : 'text-gray-400'}`}>{i + 1}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* BEAT EDITOR - directly below graph in same container */}
                            {activeBeat && (
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-900">
                                                {isEpisodic ? `Episode ${beats.findIndex(b => b.key === activeBeat) + 1}: ` : ''}
                                                {beats.find(b => b.key === activeBeat)?.label}
                                            </h3>
                                            <p className="text-xs text-gray-500">{beats.find(b => b.key === activeBeat)?.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {characters.slice(0, 6).map(char => {
                                                const isInBeat = (beatCharacters[activeBeat] || []).includes(char.id);
                                                return (
                                                    <button key={char.id} onClick={() => toggleCharacterInBeat(activeBeat, char.id)} className={`transition-all ${isInBeat ? 'ring-2 ring-orange-500 ring-offset-2' : 'opacity-50 grayscale'}`} title={char.name}>
                                                        <Avatar className="h-7 w-7"><AvatarImage src={char.imagePoses?.portrait} /><AvatarFallback className="text-[9px] bg-gray-200">{char.name?.slice(0, 2)}</AvatarFallback></Avatar>
                                                    </button>
                                                );
                                            })}
                                            <Button variant="ghost" size="sm" onClick={() => setActiveBeat(null)} className="h-6 px-2 text-gray-400"><X className="h-3 w-3" /></Button>
                                        </div>
                                    </div>
                                    <Textarea value={beatData[activeBeat] || ''} onChange={(e) => updateBeat(activeBeat, e.target.value)} placeholder={`Describe "${beats.find(b => b.key === activeBeat)?.label}"...`} className="bg-gray-50 border-gray-200 text-sm resize-none min-h-[80px]" />

                                    {/* KEY ACTIONS SECTION */}
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Film className="h-4 w-4 text-purple-500" />
                                                <span className="text-xs font-bold text-gray-700">Key Actions</span>
                                                {keyActionsByBeat[activeBeat]?.keyActions?.length > 0 && <Badge className="text-[9px] bg-purple-100 text-purple-600">{keyActionsByBeat[activeBeat].keyActions.filter((k: any) => k.description).length}/{keyActionsByBeat[activeBeat].keyActions.length}</Badge>}
                                            </div>
                                            <div className="flex gap-1">
                                                {hasMoodboard && onOpenMoodboard && <Button variant="ghost" size="sm" onClick={onOpenMoodboard} className="h-6 px-2 text-[10px] text-purple-600"><ImageIcon className="h-3 w-3 mr-1" />Moodboard</Button>}
                                                <Button variant="ghost" size="sm" onClick={() => handleGenerateKeyActions(hasMoodboard ? activeBeat : undefined)} disabled={isGeneratingKeyActions} className="h-6 px-2 text-[10px] text-purple-600">{isGeneratingKeyActions ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}{hasMoodboard ? 'Regenerate' : 'Generate'}</Button>
                                            </div>
                                        </div>
                                        {keyActionsByBeat[activeBeat]?.keyActions?.length > 0 ? (
                                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(keyActionsByBeat[activeBeat].keyActions.length, 4)}, 1fr)` }}>
                                                {keyActionsByBeat[activeBeat].keyActions.map((action: any) => (
                                                    editingKeyAction?.id === action.id ? (
                                                        <div key={action.id} className="p-2 rounded-lg border-2 border-purple-400 bg-purple-50 text-xs">
                                                            <div className="flex items-center gap-1 mb-1">
                                                                <span className="font-bold text-purple-600">#{action.index}</span>
                                                                <Edit3 className="h-3 w-3 text-purple-400" />
                                                            </div>
                                                            <textarea
                                                                value={editingKeyAction!.description}
                                                                onChange={(e) => setEditingKeyAction({ id: editingKeyAction!.id, beatKey: editingKeyAction!.beatKey, description: e.target.value })}
                                                                className="w-full text-[10px] p-1 border border-purple-200 rounded bg-white resize-none min-h-[60px]"
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-1 mt-1">
                                                                <Button size="sm" onClick={saveKeyAction} disabled={isSavingKeyAction} className="h-5 px-2 text-[9px] bg-purple-600 hover:bg-purple-700">
                                                                    {isSavingKeyAction ? <Loader2 className="h-2 w-2 animate-spin" /> : 'Save'}
                                                                </Button>
                                                                <Button size="sm" variant="ghost" onClick={() => setEditingKeyAction(null)} className="h-5 px-2 text-[9px]">Cancel</Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            key={action.id}
                                                            className={`p-2 rounded-lg border text-xs ${action.description ? 'bg-purple-50 border-purple-200' : 'bg-gray-50 border-gray-200'}`}
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="font-bold text-purple-600">#{action.index}</span>
                                                                    {action.hasImage && <ImageIcon className="h-3 w-3 text-green-500" />}
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => setEditingKeyAction({ id: action.id, beatKey: activeBeat, description: action.description || '' })}
                                                                    className="h-5 px-1.5 text-[9px] text-purple-500 hover:text-purple-700 hover:bg-purple-100"
                                                                >
                                                                    <Edit3 className="h-2.5 w-2.5 mr-0.5" />Edit
                                                                </Button>
                                                            </div>
                                                            <p className="text-[10px] text-gray-600 whitespace-pre-wrap">{action.description || <span className="text-gray-400 italic">No description yet</span>}</p>
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        ) : <p className="text-center py-2 text-gray-400 text-[10px]">Click Generate to create key actions</p>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BEAT CARDS GRID */}
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
                                        onClick={() => setActiveBeat(beat.key)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge variant="outline" className={`text-[10px] bg-gradient-to-r ${getActColor(beat.act)} text-white border-0 opacity-80 group-hover:opacity-100`}>
                                                {isEpisodic ? `Ep ${idx + 1}` : idx + 1}. {beat.label}
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

                                        {/* Key Actions - Show ALL for this beat */}
                                        {beatKeyActions.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1 text-[9px] text-purple-600">
                                                        <Zap className="h-3 w-3" />
                                                        <span className="font-bold uppercase tracking-wider">Key Actions ({beatKeyActions.length})</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    {beatKeyActions.map((action, actionIdx) => (
                                                        <div key={action.id || actionIdx} className="bg-purple-50/50 rounded-lg p-2 border border-purple-100">
                                                            <div className="flex items-start gap-2">
                                                                <Badge className="text-[8px] bg-purple-200 text-purple-700 h-4 min-w-[20px] justify-center shrink-0">
                                                                    {actionIdx + 1}
                                                                </Badge>
                                                                <p className="text-[10px] text-gray-700 leading-relaxed">
                                                                    {action.description || <span className="text-gray-400 italic">No description yet</span>}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
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

                {/* SCENE PLOT VIEW */}
                {viewMode === 'sceneplot' && projectId && userId && (
                    <div className="p-4" style={{ minHeight: '500px' }}>
                        <ScenePlotView
                            projectId={projectId}
                            userId={userId}
                            storyVersionId={selectedStoryId}
                            synopsis={story.synopsis || story.premise || ''}
                            storyBeats={beats.map(b => ({
                                id: b.key,
                                name: b.label,
                                description: beatData[b.key] || b.desc
                            }))}
                            characters={characters.map(c => ({
                                id: c.id,
                                name: c.name,
                                role: c.role,
                                imageUrl: c.imagePoses?.portrait || c.portrait
                            }))}
                            genre={story.genre}
                            tone={story.tone}
                            targetDuration={60}
                            onRefresh={loadKeyActions}
                        />
                    </div>
                )}

                {/* SHOT LIST VIEW - Coming Soon */}
                {viewMode === 'shotlist' && (
                    <div className="p-8 flex flex-col items-center justify-center" style={{ minHeight: '400px' }}>
                        <Camera className="h-16 w-16 text-emerald-200 mb-4" />
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Shot List</h3>
                        <p className="text-sm text-gray-500 text-center max-w-md">
                            Manage detailed shot breakdowns for each scene. Coming soon!
                        </p>
                        <Badge variant="outline" className="mt-4 text-emerald-600 border-emerald-200">
                            In Development
                        </Badge>
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
                    setViewMode('beats'); // Key Actions now in Beats view
                }}
            />

            {/* Re-generate Warning Modal */}
            {
                showRegenerateWarning && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                                    <RefreshCcw className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Re-generate Beats?</h3>
                                    <p className="text-sm text-gray-500">Adjust dramatic intensity</p>
                                </div>
                            </div>

                            <div className="bg-purple-50 rounded-lg p-4 space-y-2">
                                <p className="text-sm text-gray-700">
                                    <strong>{changedIntensityBeats.size} beat{changedIntensityBeats.size > 1 ? 's' : ''}</strong> akan di-regenerate dengan level intensitas baru:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from(changedIntensityBeats).map(beatKey => {
                                        const beat = beats.find(b => b.key === beatKey);
                                        const newLevel = story.dramaticIntensity?.[beatKey] || 2;
                                        const lvl = DRAMATIC_INTENSITY_LEVELS.find(l => l.level === newLevel);
                                        return (
                                            <Badge key={beatKey} className={`text-[10px] ${lvl?.bgColor} ${lvl?.textColor}`}>
                                                {lvl?.icon} {beat?.label || beatKey}
                                            </Badge>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-xs text-amber-800">
                                    ⚠️ <strong>Perhatian:</strong> Konten beat dan key action yang sudah ada akan diganti dengan versi baru sesuai level intensitas.
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRegenerateWarning(false)}
                                >
                                    Batal
                                </Button>
                                <Button
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={async () => {
                                        setShowRegenerateWarning(false);
                                        setIsRegenerating(true);

                                        try {
                                            if (onRegenerateBeats) {
                                                await onRegenerateBeats(
                                                    Array.from(changedIntensityBeats),
                                                    story.dramaticIntensity || {}
                                                );
                                            }
                                            // Clear changed beats after successful regeneration
                                            setChangedIntensityBeats(new Set());
                                            setOriginalIntensity({});
                                            // Show success toast (will be handled by parent)
                                        } catch (error) {
                                            console.error('Failed to regenerate beats:', error);
                                        } finally {
                                            setIsRegenerating(false);
                                        }
                                    }}
                                >
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Re-generate Beats
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }

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
        </div >
    );
}
