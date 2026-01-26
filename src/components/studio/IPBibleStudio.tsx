'use client';

import { useState, useRef, useMemo } from 'react';
import {
    FileText, Download, Printer, ChevronLeft, ChevronRight,
    Book, Users, Globe, Film, Palette, Sparkles,
    ZoomIn, ZoomOut, Maximize2, Eye, Settings, Video
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SearchableStoryDropdown } from './SearchableStoryDropdown';
import { SearchableMoodboardDropdown } from './SearchableMoodboardDropdown';

// Interfaces
interface ProjectData {
    title: string;
    studioName?: string;
    logline?: string;
    description?: string;
    genre?: string;
    format?: string;
    targetAudience?: string;
    logoUrl?: string;
    ipOwner?: string;
}

interface CharacterImageVersion {
    versionNumber: number;
    imageUrl: string;
    prompt?: string;
    isActive?: boolean;
    style?: string;
    model?: string;
    createdAt?: string;
}

interface CharacterData {
    id: string;
    name: string;
    role: string;
    age?: string;
    castReference?: string;
    imageUrl?: string;
    imagePoses?: { portrait?: string;[key: string]: string | undefined };
    imageVersions?: CharacterImageVersion[];
    imageReferences?: string[];
    // Physiological traits
    physiological?: {
        gender?: string;
        ethnicity?: string;
        skinTone?: string;
        faceShape?: string;
        eyeShape?: string;
        eyeColor?: string;
        noseShape?: string;
        lipsShape?: string;
        hairStyle?: string;
        hairColor?: string;
        hijab?: string;
        bodyType?: string;
        height?: string;
        uniqueness?: string;
    };
    // Psychological traits
    psychological?: {
        archetype?: string;
        fears?: string;
        wants?: string;
        needs?: string;
        alterEgo?: string;
        traumatic?: string;
        personalityType?: string;
    };
    // Emotional traits
    emotional?: {
        logos?: string;
        ethos?: string;
        pathos?: string;
        tone?: string;
        style?: string;
        mode?: string;
    };
    // Family relations
    family?: {
        spouse?: string;
        children?: string;
        parents?: string;
    };
    // Sociocultural background
    sociocultural?: {
        affiliation?: string;
        groupRelationshipLevel?: string;
        cultureTradition?: string;
        language?: string;
        tribe?: string;
        economicClass?: string;
    };
    // Core beliefs
    coreBeliefs?: {
        faith?: string;
        religionSpirituality?: string;
        trustworthy?: string;
        willingness?: string;
        vulnerability?: string;
        commitments?: string;
        integrity?: string;
    };
    // Educational background
    educational?: {
        graduate?: string;
        achievement?: string;
        fellowship?: string;
    };
    // Sociopolitics
    sociopolitics?: {
        partyId?: string;
        nationalism?: string;
        citizenship?: string;
    };
    // SWOT analysis
    swot?: {
        strength?: string;
        weakness?: string;
        opportunity?: string;
        threat?: string;
    };
    clothingStyle?: string;
    accessories?: string[];
    props?: string;
    personalityTraits?: string[];
    // Visual grids from active image version
    keyPoses?: Record<string, string>;
    facialExpressions?: Record<string, string>;
    emotionGestures?: Record<string, string>;
    // Legacy fields (for backward compatibility)
    archetype?: string;
    personality?: string;
    backstory?: string;
}

interface StoryData {
    premise: string;
    synopsis?: string;
    globalSynopsis?: string;
    theme?: string;
    tone?: string;
    genre?: string;
    format?: string;
    duration?: string;
    targetAudience?: string;
    conflict?: string;
    endingType?: string;
    structure?: string;
    // Story beats
    catBeats?: Record<string, string>;
    heroBeats?: Record<string, string>;
    harmonBeats?: Record<string, string>;
    // Key actions per beat
    catKeyActions?: Record<string, string>;
    heroKeyActions?: Record<string, string>;
    harmonKeyActions?: Record<string, string>;
    // Additional story data
    tensionLevels?: Record<string, number>;
    wantNeedMatrix?: {
        want?: { external?: string; known?: string; specific?: string; achieved?: string };
        need?: { internal?: string; unknown?: string; universal?: string; achieved?: string };
    };
}

interface UniverseData {
    name?: string;
    era?: string;
    description?: string;
    [key: string]: any;
}

// Story item for SearchableStoryDropdown
interface StoryItem {
    id: string;
    name: string;
    structureType?: string;
    episodeNumber?: number;
    characterCount?: number;
    characterIds?: string[];
}

// Moodboard item for SearchableMoodboardDropdown
interface MoodboardItem {
    id: string;
    versionNumber: number;
    versionName: string;
    artStyle?: string;
    createdAt?: string;
    isActive?: boolean;
}

// Animate item (similar structure to moodboard)
interface AnimateItem {
    id: string;
    versionNumber: number;
    versionName: string;
    style?: string;
    createdAt?: string;
    isActive?: boolean;
}

// Full moodboard item with key actions (from moodboard V2 API)
interface MoodboardItemDetail {
    beatKey: string;
    beatLabel: string;
    beatContent?: string;
    keyActionDescription?: string;
    charactersInvolved?: string[];
    imageUrl?: string;
    prompt?: string;
}

interface IPBibleStudioProps {
    project: ProjectData;
    characters: CharacterData[];
    story: StoryData;
    universe: UniverseData;
    moodboardImages: Record<string, string>;
    moodboardItems?: MoodboardItemDetail[]; // Full moodboard items with key actions
    animationThumbnails?: Record<string, string>; // Animation frame/thumbnail images
    // Story version selection
    storyVersions?: StoryItem[];
    selectedStoryVersionId?: string;
    onStoryVersionChange?: (storyId: string) => void;
    // Moodboard version selection  
    moodboardVersions?: MoodboardItem[];
    selectedMoodboardVersionNumber?: number | null;
    onMoodboardVersionChange?: (versionNumber: number) => void;
    // Animate version selection
    animateVersions?: AnimateItem[];
    selectedAnimateVersionNumber?: number | null;
    onAnimateVersionChange?: (versionNumber: number) => void;
    // Export
    onExportPDF?: () => void;
    isExporting?: boolean;
}

// A4 Page dimensions (in pixels at 96 DPI)
const A4_WIDTH = 794; // 210mm
const A4_HEIGHT = 1123; // 297mm

export function IPBibleStudio({
    project,
    characters,
    story,
    universe,
    moodboardImages,
    moodboardItems = [],
    animationThumbnails = {},
    storyVersions = [],
    selectedStoryVersionId,
    onStoryVersionChange,
    moodboardVersions = [],
    selectedMoodboardVersionNumber,
    onMoodboardVersionChange,
    animateVersions = [],
    selectedAnimateVersionNumber,
    onAnimateVersionChange,
    onExportPDF,
    isExporting = false
}: IPBibleStudioProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(0.8);
    const [showVersionSelector, setShowVersionSelector] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    // Filter characters based on selected story version's characterIds
    const selectedStoryVersion = storyVersions.find(sv => sv.id === selectedStoryVersionId);
    const filteredCharacters = useMemo(() => {
        if (selectedStoryVersion?.characterIds && selectedStoryVersion.characterIds.length > 0) {
            return characters.filter(c => selectedStoryVersion.characterIds?.includes(c.id));
        }
        return characters; // If no characterIds, show all
    }, [characters, selectedStoryVersion]);

    // Constants for pagination
    const IMAGES_PER_PAGE = 6; // Max moodboard/animation images per page
    const BEATS_PER_PAGE = 2; // Max story beats per page (reduced to prevent overflow)

    // Get beats based on structure type - handle both original and converted format
    const structureLower = (story.structure || '').toLowerCase();
    const isHeroJourney = structureLower.includes('hero');
    const isDanHarmon = structureLower.includes('harmon') || structureLower.includes('circle');

    const beats = isHeroJourney
        ? story.heroBeats
        : isDanHarmon
            ? story.harmonBeats
            : story.catBeats;

    // Get key actions based on structure type
    const keyActions = isHeroJourney
        ? story.heroKeyActions
        : isDanHarmon
            ? story.harmonKeyActions
            : story.catKeyActions;

    // Calculate pages dynamically with proper pagination
    const pages = useMemo(() => {
        const allPages: { id: string; title: string; icon?: string; previewType?: string }[] = [
            { id: 'cover', title: 'Cover Page', previewType: 'cover' },
            { id: 'overview', title: 'Project Overview', previewType: 'text' },
        ];

        // Add characters overview page (if there are characters)
        if (filteredCharacters.length > 0) {
            allPages.push({
                id: 'characters-overview',
                title: 'Characters Overview',
                previewType: 'characters-grid'
            });
        }

        // Add individual character pages (3 pages per character: details-1, details-2, images)
        filteredCharacters.forEach((char) => {
            // Page 1: Character Basic Info + Physiological
            allPages.push({
                id: `character-${char.id}-details-1`,
                title: `${char.name}`,
                previewType: 'character'
            });
            // Page 2: Character Psychological + Social
            allPages.push({
                id: `character-${char.id}-details-2`,
                title: `${char.name} (cont.)`,
                previewType: 'character'
            });
            // Page 3: Character Images
            allPages.push({
                id: `character-${char.id}-images`,
                title: `${char.name} Images`,
                previewType: 'character-images'
            });
        });

        // Story Overview page 1 (metadata + premise)
        allPages.push({ id: 'story-overview-1', title: 'Story Overview', previewType: 'text' });

        // Story Overview page 2 (synopsis content) - always add if there's synopsis or global synopsis
        if (story.synopsis || story.globalSynopsis) {
            allPages.push({ id: 'story-overview-2', title: 'Story Synopsis', previewType: 'text' });
        }

        // Story Beats pages (paginated) - always show at least 1 page
        const beatsArray = beats ? Object.entries(beats) : [];
        const totalBeatPages = Math.max(1, Math.ceil(beatsArray.length / BEATS_PER_PAGE));
        for (let i = 0; i < totalBeatPages; i++) {
            allPages.push({
                id: `story-beats-${i + 1}`,
                title: beatsArray.length > 0 ? `Story Beats ${i + 1}/${totalBeatPages}` : 'Story Beats',
                previewType: 'text'
            });
        }

        // World Building pages (split into 2)
        allPages.push({ id: 'world-1', title: 'World Building', previewType: 'text' });
        allPages.push({ id: 'world-2', title: 'World Building (cont.)', previewType: 'text' });

        // Moodboard pages (paginated - 2 BEATS per page, with all images for each beat)
        // Group moodboard items by beat
        const moodboardItemsWithImages = moodboardItems.filter(item => item.imageUrl);
        const uniqueBeatsWithImages = [...new Set(moodboardItemsWithImages.map(item => item.beatKey))];
        const totalMoodboardPages = Math.max(1, Math.ceil(uniqueBeatsWithImages.length / BEATS_PER_PAGE));
        for (let i = 0; i < totalMoodboardPages; i++) {
            allPages.push({
                id: `moodboard-${i + 1}`,
                title: `Moodboard ${i + 1}/${totalMoodboardPages}`,
                previewType: 'images'
            });
        }

        // Animation pages (paginated - 6 thumbnails per page)
        const animationEntries = Object.entries(animationThumbnails);
        if (animationEntries.length > 0) {
            const totalAnimationPages = Math.ceil(animationEntries.length / IMAGES_PER_PAGE);
            for (let i = 0; i < totalAnimationPages; i++) {
                allPages.push({
                    id: `animation-${i + 1}`,
                    title: `Animation ${i + 1}/${totalAnimationPages}`,
                    previewType: 'images'
                });
            }
        } else {
            // Always show at least 1 animation page even if empty
            allPages.push({ id: 'animation-1', title: 'Animation', previewType: 'images' });
        }

        return allPages;
    }, [filteredCharacters, beats, moodboardImages, animationThumbnails]);

    const goToPage = (delta: number) => {
        setCurrentPage(prev => Math.max(0, Math.min(pages.length - 1, prev + delta)));
    };

    return (
        <div className="h-full flex flex-col gap-4">

            {/* TOOLBAR */}
            <div className="flex items-center justify-between p-3 rounded-xl glass-panel">

                {/* Left: Page Navigation */}
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => goToPage(-1)}
                            disabled={currentPage === 0}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-slate-700 font-mono min-w-[80px] text-center font-semibold">
                            {currentPage + 1} / {pages.length}
                        </span>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => goToPage(1)}
                            disabled={currentPage === pages.length - 1}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="h-8 w-px bg-white/10" />

                    {/* Current Page Title */}
                    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300">
                        {pages[currentPage]?.title}
                    </Badge>
                </div>

                {/* Right: Settings, Zoom & Export */}
                <div className="flex items-center gap-3">
                    {/* Toggle Version Selector */}
                    <Button
                        size="sm"
                        variant={showVersionSelector ? "default" : "outline"}
                        className="h-8"
                        onClick={() => setShowVersionSelector(!showVersionSelector)}
                    >
                        <Settings className="h-3 w-3 mr-1" />
                        Versions
                    </Button>

                    <div className="h-8 w-px bg-white/10" />

                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-slate-600 w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                    >
                        <Printer className="h-3 w-3 mr-1" />
                        Print
                    </Button>

                    <Button
                        size="sm"
                        onClick={onExportPDF}
                        disabled={isExporting}
                        className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white h-8 px-4 text-xs font-bold"
                    >
                        <Download className="h-3 w-3 mr-1" />
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                </div>
            </div>

            {/* VERSION SELECTOR PANEL */}
            {showVersionSelector && (
                <div className="p-4 rounded-xl glass-panel border border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                        <Settings className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-semibold text-slate-700">Select Content Versions</span>
                        {selectedStoryVersion && (
                            <Badge variant="outline" className="ml-auto text-[9px] border-orange-500/30 text-orange-400">
                                {filteredCharacters.length} characters
                            </Badge>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Story Version Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-orange-400 uppercase flex items-center gap-1">
                                <Book className="h-3 w-3" />
                                Story Version
                            </label>
                            <SearchableStoryDropdown
                                stories={storyVersions}
                                selectedId={selectedStoryVersionId}
                                onSelect={(storyId) => onStoryVersionChange?.(storyId)}
                                placeholder="Select story..."
                                showRestore={false}
                            />
                        </div>

                        {/* Moodboard Version Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pink-400 uppercase flex items-center gap-1">
                                <Palette className="h-3 w-3" />
                                Moodboard Version
                            </label>
                            <SearchableMoodboardDropdown
                                moodboards={moodboardVersions}
                                selectedVersionNumber={selectedMoodboardVersionNumber}
                                onSelect={(versionNumber) => onMoodboardVersionChange?.(versionNumber)}
                                placeholder="Select moodboard..."
                                showRestore={false}
                                showCreateNew={false}
                            />
                        </div>

                        {/* Animate Version Selector */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-purple-400 uppercase flex items-center gap-1">
                                <Video className="h-3 w-3" />
                                Animate Version
                            </label>
                            {/* Simple dropdown for now - can create SearchableAnimateDropdown later */}
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    className="h-8 px-2 text-xs justify-between min-w-[120px] w-full bg-white border-gray-200"
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <Video className="h-3 w-3 text-purple-500 flex-shrink-0" />
                                        <span className="truncate">
                                            {animateVersions.find(a => a.versionNumber === selectedAnimateVersionNumber)?.versionName || 'Select animate...'}
                                        </span>
                                    </div>
                                </Button>
                                {/* TODO: Implement SearchableAnimateDropdown similar to moodboard */}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex-1 min-h-0 flex gap-4">

                {/* LEFT: Page Thumbnails with Mini Preview */}
                <div className="w-36 rounded-xl border border-white/10 bg-slate-900/50">
                    <ScrollArea className="h-full p-2">
                        <div className="space-y-2">
                            {pages.map((page, index) => {
                                // Get character for character pages (format: character-{id}-details or character-{id}-images)
                                const charMatch = page.id.match(/^character-(.+?)-(details|images)$/);
                                const charId = charMatch ? charMatch[1] : null;
                                const isCharacterImages = charMatch ? charMatch[2] === 'images' : false;
                                const char = charId ? filteredCharacters.find(c => c.id === charId) : null;
                                const charImage = char?.imageUrl;
                                // Get visual grids for images page preview (combine all grids)
                                const allCharGridImages = [
                                    ...(char?.keyPoses ? Object.entries(char.keyPoses).filter(([_, url]) => url) : []),
                                    ...(char?.facialExpressions ? Object.entries(char.facialExpressions).filter(([_, url]) => url) : []),
                                    ...(char?.emotionGestures ? Object.entries(char.emotionGestures).filter(([_, url]) => url) : []),
                                ];

                                // Get moodboard page number
                                const moodboardPageMatch = page.id.match(/^moodboard-(\d+)$/);
                                const moodboardPageNum = moodboardPageMatch ? parseInt(moodboardPageMatch[1]) : 0;
                                const moodboardStart = (moodboardPageNum - 1) * IMAGES_PER_PAGE;
                                const moodboardSlice = Object.entries(moodboardImages).slice(moodboardStart, moodboardStart + 4);

                                // Get animation page number
                                const animationPageMatch = page.id.match(/^animation-(\d+)$/);
                                const animationPageNum = animationPageMatch ? parseInt(animationPageMatch[1]) : 0;
                                const animationStart = (animationPageNum - 1) * IMAGES_PER_PAGE;
                                const animationSlice = Object.entries(animationThumbnails).slice(animationStart, animationStart + 4);

                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => setCurrentPage(index)}
                                        className={`w-full aspect-[210/297] rounded-lg border-2 transition-all ${currentPage === index ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/10 hover:border-white/30'} bg-white overflow-hidden relative group`}
                                    >
                                        {/* Cover Page Preview */}
                                        {page.id === 'cover' && (
                                            <div className="w-full h-full bg-gradient-to-b from-slate-100 to-white flex flex-col items-center justify-center p-2">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mb-1">
                                                    <Book className="h-4 w-4 text-orange-500" />
                                                </div>
                                                <p className="text-[6px] font-bold text-slate-700 text-center leading-tight truncate w-full">
                                                    {project.title}
                                                </p>
                                            </div>
                                        )}

                                        {/* Overview Page Preview */}
                                        {page.id === 'overview' && (
                                            <div className="w-full h-full p-2 flex flex-col gap-1">
                                                <div className="h-1.5 w-3/4 bg-orange-200 rounded" />
                                                <div className="h-1 w-full bg-slate-200 rounded" />
                                                <div className="h-1 w-5/6 bg-slate-200 rounded" />
                                                <div className="h-1 w-4/5 bg-slate-200 rounded" />
                                                <div className="flex-1 grid grid-cols-2 gap-1 mt-1">
                                                    <div className="bg-slate-100 rounded" />
                                                    <div className="bg-slate-100 rounded" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Characters Overview Page Preview */}
                                        {page.id === 'characters-overview' && (
                                            <div className="w-full h-full p-1.5 flex flex-col">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Users className="h-2 w-2 text-purple-500" />
                                                    <div className="h-1.5 w-1/2 bg-purple-200 rounded" />
                                                </div>
                                                <div className="grid grid-cols-3 gap-0.5 flex-1">
                                                    {filteredCharacters.slice(0, 6).map((c) => (
                                                        <div key={c.id} className="bg-slate-100 rounded overflow-hidden">
                                                            {(c.imagePoses?.portrait || c.imageUrl) ? (
                                                                <img src={c.imagePoses?.portrait || c.imageUrl} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Users className="h-2 w-2 text-slate-300" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[4px] text-slate-400 text-center mt-1">{filteredCharacters.length} Characters</p>
                                            </div>
                                        )}

                                        {/* Character Details Page Preview */}
                                        {charId && !isCharacterImages && (
                                            <div className="w-full h-full p-1.5 flex flex-col">
                                                <div className="w-full aspect-square bg-slate-100 rounded overflow-hidden mb-1">
                                                    {charImage ? (
                                                        <img src={charImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Users className="h-4 w-4 text-slate-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[5px] font-bold text-purple-600 text-center truncate">{char?.name}</p>
                                                <p className="text-[4px] text-slate-400 text-center">Details</p>
                                            </div>
                                        )}

                                        {/* Character Images Page Preview */}
                                        {charId && isCharacterImages && (
                                            <div className="w-full h-full p-1.5 flex flex-col">
                                                <div className="grid grid-cols-2 gap-0.5 flex-1 mb-1">
                                                    {allCharGridImages.slice(0, 4).map(([key, url]) => (
                                                        <div key={key} className="bg-slate-100 rounded overflow-hidden">
                                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    ))}
                                                    {allCharGridImages.length === 0 && [...Array(4)].map((_, i) => (
                                                        <div key={i} className="bg-purple-50 rounded flex items-center justify-center">
                                                            <Users className="h-2 w-2 text-purple-200" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-[5px] font-bold text-purple-600 text-center truncate">{char?.name}</p>
                                                <p className="text-[4px] text-slate-400 text-center">Images</p>
                                            </div>
                                        )}

                                        {/* Story Overview Preview */}
                                        {page.id === 'story-overview' && (
                                            <div className="w-full h-full p-2 flex flex-col gap-1">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Film className="h-2 w-2 text-blue-500" />
                                                    <div className="h-1.5 w-1/2 bg-blue-200 rounded" />
                                                </div>
                                                <div className="h-1 w-full bg-slate-200 rounded" />
                                                <div className="h-1 w-4/5 bg-slate-200 rounded" />
                                                <div className="grid grid-cols-2 gap-1 flex-1 mt-1">
                                                    <div className="bg-blue-50 rounded" />
                                                    <div className="bg-blue-50 rounded" />
                                                    <div className="bg-blue-50 rounded" />
                                                    <div className="bg-blue-50 rounded" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Story Beats Preview */}
                                        {page.id.startsWith('story-beats-') && (
                                            <div className="w-full h-full p-2 flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Film className="h-2 w-2 text-blue-500" />
                                                    <div className="h-1.5 w-8 bg-blue-200 rounded" />
                                                </div>
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="flex gap-1 items-center">
                                                        <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                                                        <div className="h-1 flex-1 bg-slate-200 rounded" />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* World Page Preview */}
                                        {page.id === 'world' && (
                                            <div className="w-full h-full p-2 flex flex-col gap-1">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Globe className="h-2 w-2 text-green-500" />
                                                    <div className="h-1.5 w-1/2 bg-green-200 rounded" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-1 flex-1">
                                                    <div className="bg-green-50 rounded border-l-2 border-green-300" />
                                                    <div className="bg-teal-50 rounded border-l-2 border-teal-300" />
                                                    <div className="bg-blue-50 rounded border-l-2 border-blue-300" />
                                                    <div className="bg-purple-50 rounded border-l-2 border-purple-300" />
                                                </div>
                                            </div>
                                        )}

                                        {/* Moodboard Page Preview */}
                                        {moodboardPageMatch && (
                                            <div className="w-full h-full p-1.5 flex flex-col">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Palette className="h-2 w-2 text-pink-500" />
                                                    <div className="h-1 w-8 bg-pink-200 rounded" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-0.5 flex-1">
                                                    {moodboardSlice.length > 0 ? moodboardSlice.map(([key, url]) => (
                                                        <div key={key} className="bg-slate-100 rounded overflow-hidden">
                                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )) : [...Array(4)].map((_, i) => (
                                                        <div key={i} className="bg-pink-50 rounded" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Animation Page Preview */}
                                        {animationPageMatch && (
                                            <div className="w-full h-full p-1.5 flex flex-col">
                                                <div className="flex items-center gap-1 mb-1">
                                                    <Video className="h-2 w-2 text-purple-500" />
                                                    <div className="h-1 w-8 bg-purple-200 rounded" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-0.5 flex-1">
                                                    {animationSlice.length > 0 ? animationSlice.map(([key, url]) => (
                                                        <div key={key} className="bg-slate-100 rounded overflow-hidden">
                                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                    )) : [...Array(4)].map((_, i) => (
                                                        <div key={i} className="bg-purple-50 rounded flex items-center justify-center">
                                                            <Video className="h-2 w-2 text-purple-200" />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Page number badge */}
                                        <div className="absolute bottom-0.5 right-0.5 bg-slate-800/80 text-white text-[6px] px-1 rounded">
                                            {index + 1}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </ScrollArea>
                </div>

                {/* RIGHT: Page Preview - Now scrollable */}
                <div className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 overflow-auto">
                    <div className="min-h-full flex items-start justify-center p-8">
                        <div
                            ref={contentRef}
                            className="bg-white shadow-2xl transition-transform shrink-0"
                            style={{
                                width: A4_WIDTH,
                                minHeight: A4_HEIGHT,
                                transform: `scale(${zoom})`,
                                transformOrigin: 'top center',
                                marginBottom: zoom < 1 ? 0 : 50,
                            }}
                        >
                            {/* COVER PAGE */}
                            {pages[currentPage]?.id === 'cover' && (
                                <div className="flex flex-col" style={{ height: A4_HEIGHT }}>
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gradient-to-b from-slate-50 to-white">
                                        <p className="text-[10px] text-red-600 font-bold tracking-[0.3em] mb-8">CONFIDENTIAL</p>

                                        {project.logoUrl && (
                                            <img src={project.logoUrl} className="h-20 mb-8" alt="Logo" />
                                        )}

                                        <h1 className="text-4xl font-black text-slate-900 text-center mb-4">
                                            {project.title || 'Untitled Project'}
                                        </h1>

                                        <p className="text-lg text-slate-600 text-center max-w-md mb-8">
                                            {project.logline || 'Series Bible & IP Documentation'}
                                        </p>

                                        <div className="flex items-center gap-4 text-sm text-slate-500">
                                            {project.genre && <Badge variant="outline">{project.genre}</Badge>}
                                            {project.format && <Badge variant="outline">{project.format}</Badge>}
                                        </div>
                                    </div>

                                    <div className="p-8 border-t-4 border-orange-500 bg-slate-50">
                                        <div className="flex justify-between items-end text-sm text-slate-600">
                                            <div>
                                                <p>Version 1.0</p>
                                                <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                            <div className="text-right">
                                                {project.studioName && <p className="font-bold">{project.studioName}</p>}
                                                {project.ipOwner && <p>IP Owner: {project.ipOwner}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* OVERVIEW PAGE */}
                            {pages[currentPage]?.id === 'overview' && (
                                <div className="h-full p-12 overflow-auto">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-orange-500">
                                        <Book className="h-6 w-6 text-orange-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Project Overview</h2>
                                    </div>

                                    <div className="space-y-6 text-slate-700">
                                        <div>
                                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Logline</h3>
                                            <p className="text-lg">{project.logline || story.premise || 'No logline defined.'}</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Genre</h3>
                                                <p>{project.genre || story.genre || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Format</h3>
                                                <p>{project.format || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Target Audience</h3>
                                                <p>{project.targetAudience || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Tone</h3>
                                                <p>{story.tone || 'Not specified'}</p>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Description</h3>
                                            <p className="text-sm leading-relaxed">{project.description || 'No description provided.'}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-2">Core Theme</h3>
                                            <p>{story.theme || 'Not defined'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* CHARACTERS OVERVIEW PAGE */}
                            {pages[currentPage]?.id === 'characters-overview' && (
                                <div style={{ height: A4_HEIGHT }} className="p-8 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-500">
                                        <Users className="h-6 w-6 text-purple-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Characters</h2>
                                        <Badge className="bg-purple-100 text-purple-700 border-0 ml-auto">
                                            {filteredCharacters.length} Characters
                                        </Badge>
                                    </div>

                                    {/* Characters Grid */}
                                    <div className="grid grid-cols-4 gap-4">
                                        {filteredCharacters.map((char) => (
                                            <div key={char.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                {/* Character Photo */}
                                                <div className="aspect-square bg-slate-100 overflow-hidden">
                                                    {(char.imagePoses?.portrait || char.imageUrl) ? (
                                                        <img
                                                            src={char.imagePoses?.portrait || char.imageUrl}
                                                            alt={char.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <Users className="h-10 w-10" />
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Character Info */}
                                                <div className="p-2">
                                                    <p className="font-bold text-sm text-slate-900 truncate">{char.name}</p>
                                                    <p className="text-xs text-purple-600 truncate">{char.role}</p>
                                                    {char.age && <p className="text-[10px] text-slate-500">{char.age} years old</p>}
                                                    {char.psychological?.archetype && (
                                                        <p className="text-[10px] text-slate-400 truncate mt-1">
                                                            {char.psychological.archetype}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredCharacters.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-[70%] text-slate-400">
                                            <Users className="h-20 w-20 mb-4 opacity-50" />
                                            <p className="text-lg">No characters defined yet</p>
                                            <p className="text-sm mt-2">Create characters from the Character tab</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CHARACTER DETAILS PAGE 1 - Image + Physiological + Personality */}
                            {pages[currentPage]?.id.match(/^character-(.+)-details-1$/) && (() => {
                                const match = pages[currentPage].id.match(/^character-(.+)-details-1$/);
                                const charId = match ? match[1] : null;
                                const char = charId ? filteredCharacters.find(c => c.id === charId) : null;
                                if (!char) return null;

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-500">
                                            <Users className="h-6 w-6 text-purple-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">{char.name}</h2>
                                            <Badge className="bg-purple-100 text-purple-700 border-0">{char.role}</Badge>
                                            {char.age && <Badge variant="outline">{char.age} years old</Badge>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Column 1: Profile Image */}
                                            <div className="space-y-4">
                                                {/* Main Profile Image */}
                                                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden shadow-lg">
                                                    {(char.imagePoses?.portrait || char.imageUrl) ? (
                                                        <img src={char.imagePoses?.portrait || char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Users className="h-20 w-20" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Cast Reference */}
                                                {char.castReference && (
                                                    <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase">Cast Reference</p>
                                                        <p className="text-sm text-slate-700">{char.castReference}</p>
                                                    </div>
                                                )}

                                                {/* Personality Traits */}
                                                {char.personalityTraits && char.personalityTraits.length > 0 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">Personality Traits</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {char.personalityTraits.map((trait, idx) => (
                                                                <Badge key={idx} variant="outline" className="text-xs">{trait}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Column 2: Physiological Profile */}
                                            <div className="space-y-4">
                                                {/* Physiological Traits */}
                                                {char.physiological && (
                                                    <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                                                        <p className="text-sm font-bold text-pink-600 uppercase mb-3">Physiological Profile</p>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                            {char.physiological.gender && <div><span className="text-slate-500">Gender:</span> {char.physiological.gender}</div>}
                                                            {char.physiological.ethnicity && <div><span className="text-slate-500">Ethnicity:</span> {char.physiological.ethnicity}</div>}
                                                            {char.physiological.height && <div><span className="text-slate-500">Height:</span> {char.physiological.height}</div>}
                                                            {char.physiological.bodyType && <div><span className="text-slate-500">Body:</span> {char.physiological.bodyType}</div>}
                                                            {char.physiological.skinTone && <div><span className="text-slate-500">Skin:</span> {char.physiological.skinTone}</div>}
                                                            {char.physiological.faceShape && <div><span className="text-slate-500">Face:</span> {char.physiological.faceShape}</div>}
                                                            {char.physiological.eyeShape && <div><span className="text-slate-500">Eyes:</span> {char.physiological.eyeShape}</div>}
                                                            {char.physiological.eyeColor && <div><span className="text-slate-500">Eye Color:</span> {char.physiological.eyeColor}</div>}
                                                            {char.physiological.hairStyle && <div><span className="text-slate-500">Hair:</span> {char.physiological.hairStyle}</div>}
                                                            {char.physiological.hairColor && <div><span className="text-slate-500">Hair Color:</span> {char.physiological.hairColor}</div>}
                                                        </div>
                                                        {char.physiological.uniqueness && (
                                                            <div className="mt-3 pt-3 border-t border-pink-200">
                                                                <p className="text-xs text-pink-600 font-medium">Uniqueness:</p>
                                                                <p className="text-sm text-slate-600">{char.physiological.uniqueness}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Emotional Traits */}
                                                {char.emotional && (
                                                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200">
                                                        <p className="text-sm font-bold text-rose-600 uppercase mb-3">Emotional Traits</p>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                            {char.emotional.logos && <p><span className="text-slate-500">Logos:</span> {char.emotional.logos}</p>}
                                                            {char.emotional.ethos && <p><span className="text-slate-500">Ethos:</span> {char.emotional.ethos}</p>}
                                                            {char.emotional.pathos && <p><span className="text-slate-500">Pathos:</span> {char.emotional.pathos}</p>}
                                                            {char.emotional.tone && <p><span className="text-slate-500">Tone:</span> {char.emotional.tone}</p>}
                                                            {char.emotional.style && <p><span className="text-slate-500">Style:</span> {char.emotional.style}</p>}
                                                            {char.emotional.mode && <p><span className="text-slate-500">Mode:</span> {char.emotional.mode}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* CHARACTER DETAILS PAGE 2 - Psychological + Social + SWOT */}
                            {pages[currentPage]?.id.match(/^character-(.+)-details-2$/) && (() => {
                                const match = pages[currentPage].id.match(/^character-(.+)-details-2$/);
                                const charId = match ? match[1] : null;
                                const char = charId ? filteredCharacters.find(c => c.id === charId) : null;
                                if (!char) return null;

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-purple-500">
                                            <Users className="h-6 w-6 text-purple-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">{char.name}</h2>
                                            <Badge variant="outline">continued</Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            {/* Column 1: Psychological + Family + Core Beliefs */}
                                            <div className="space-y-4">
                                                {/* Psychological Profile */}
                                                {char.psychological && (
                                                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                                                        <p className="text-sm font-bold text-purple-600 uppercase mb-3">Psychological Profile</p>
                                                        {char.psychological.archetype && (
                                                            <Badge className="bg-purple-600 mb-3">{char.psychological.archetype}</Badge>
                                                        )}
                                                        <div className="space-y-2 text-sm">
                                                            {char.psychological.personalityType && (
                                                                <p><span className="text-slate-500">Type:</span> {char.psychological.personalityType}</p>
                                                            )}
                                                            {char.psychological.wants && (
                                                                <p><span className="text-slate-500 font-medium">Wants:</span> {char.psychological.wants}</p>
                                                            )}
                                                            {char.psychological.needs && (
                                                                <p><span className="text-slate-500 font-medium">Needs:</span> {char.psychological.needs}</p>
                                                            )}
                                                            {char.psychological.fears && (
                                                                <p><span className="text-slate-500 font-medium">Fears:</span> {char.psychological.fears}</p>
                                                            )}
                                                            {char.psychological.alterEgo && (
                                                                <p><span className="text-slate-500">Alter Ego:</span> {char.psychological.alterEgo}</p>
                                                            )}
                                                        </div>
                                                        {char.psychological.traumatic && (
                                                            <div className="mt-3 pt-3 border-t border-purple-200">
                                                                <p className="text-xs text-purple-600 font-medium">Traumatic Experience:</p>
                                                                <p className="text-sm text-slate-600">{char.psychological.traumatic}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Family Relations */}
                                                {char.family && (char.family.spouse || char.family.children || char.family.parents) && (
                                                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="text-sm font-bold text-blue-600 uppercase mb-3">Family</p>
                                                        <div className="space-y-2 text-sm">
                                                            {char.family.parents && <p><span className="text-slate-500">Parents:</span> {char.family.parents}</p>}
                                                            {char.family.spouse && <p><span className="text-slate-500">Spouse:</span> {char.family.spouse}</p>}
                                                            {char.family.children && <p><span className="text-slate-500">Children:</span> {char.family.children}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Core Beliefs */}
                                                {char.coreBeliefs && (
                                                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-sm font-bold text-amber-600 uppercase mb-3">Core Beliefs</p>
                                                        <div className="space-y-2 text-sm">
                                                            {char.coreBeliefs.faith && <p><span className="text-slate-500">Faith:</span> {char.coreBeliefs.faith}</p>}
                                                            {char.coreBeliefs.religionSpirituality && <p><span className="text-slate-500">Religion:</span> {char.coreBeliefs.religionSpirituality}</p>}
                                                            {char.coreBeliefs.integrity && <p><span className="text-slate-500">Integrity:</span> {char.coreBeliefs.integrity}</p>}
                                                            {char.coreBeliefs.commitments && <p><span className="text-slate-500">Commitments:</span> {char.coreBeliefs.commitments}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Column 2: Sociocultural + SWOT + Costume */}
                                            <div className="space-y-4">
                                                {/* Sociocultural */}
                                                {char.sociocultural && (
                                                    <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
                                                        <p className="text-sm font-bold text-teal-600 uppercase mb-3">Sociocultural</p>
                                                        <div className="space-y-2 text-sm">
                                                            {char.sociocultural.affiliation && <p><span className="text-slate-500">Affiliation:</span> {char.sociocultural.affiliation}</p>}
                                                            {char.sociocultural.tribe && <p><span className="text-slate-500">Tribe:</span> {char.sociocultural.tribe}</p>}
                                                            {char.sociocultural.language && <p><span className="text-slate-500">Language:</span> {char.sociocultural.language}</p>}
                                                            {char.sociocultural.cultureTradition && <p><span className="text-slate-500">Culture:</span> {char.sociocultural.cultureTradition}</p>}
                                                            {char.sociocultural.economicClass && <p><span className="text-slate-500">Class:</span> {char.sociocultural.economicClass}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* SWOT Analysis */}
                                                {char.swot && (
                                                    <div className="p-4 bg-slate-100 rounded-lg border border-slate-200">
                                                        <p className="text-sm font-bold text-slate-600 uppercase mb-3">SWOT Analysis</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {char.swot.strength && (
                                                                <div className="p-2 bg-green-50 rounded border-l-2 border-green-400">
                                                                    <p className="text-[10px] font-bold text-green-600">Strength</p>
                                                                    <p className="text-xs text-slate-600">{char.swot.strength}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.weakness && (
                                                                <div className="p-2 bg-red-50 rounded border-l-2 border-red-400">
                                                                    <p className="text-[10px] font-bold text-red-600">Weakness</p>
                                                                    <p className="text-xs text-slate-600">{char.swot.weakness}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.opportunity && (
                                                                <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                                                    <p className="text-[10px] font-bold text-blue-600">Opportunity</p>
                                                                    <p className="text-xs text-slate-600">{char.swot.opportunity}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.threat && (
                                                                <div className="p-2 bg-orange-50 rounded border-l-2 border-orange-400">
                                                                    <p className="text-[10px] font-bold text-orange-600">Threat</p>
                                                                    <p className="text-xs text-slate-600">{char.swot.threat}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Costume & Props */}
                                                {(char.clothingStyle || char.props || (char.accessories && char.accessories.length > 0)) && (
                                                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                                                        <p className="text-sm font-bold text-indigo-600 uppercase mb-3">Costume & Props</p>
                                                        <div className="space-y-2 text-sm">
                                                            {char.clothingStyle && <p><span className="text-slate-500">Style:</span> {char.clothingStyle}</p>}
                                                            {char.props && <p><span className="text-slate-500">Props:</span> {char.props}</p>}
                                                            {char.accessories && char.accessories.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {char.accessories.map((acc, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-xs">{acc}</Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* CHARACTER IMAGES PAGE - Active Version + Visual Grids */}
                            {pages[currentPage]?.id.match(/^character-(.+)-images$/) && (() => {
                                const match = pages[currentPage].id.match(/^character-(.+)-images$/);
                                const charId = match ? match[1] : null;
                                const char = charId ? filteredCharacters.find(c => c.id === charId) : null;
                                if (!char) return null;

                                // Count visual grid images
                                const keyPosesCount = char.keyPoses ? Object.values(char.keyPoses).filter(Boolean).length : 0;
                                const expressionsCount = char.facialExpressions ? Object.values(char.facialExpressions).filter(Boolean).length : 0;
                                const gesturesCount = char.emotionGestures ? Object.values(char.emotionGestures).filter(Boolean).length : 0;
                                const totalGridImages = keyPosesCount + expressionsCount + gesturesCount;

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4 pb-2 border-b-2 border-purple-500">
                                            <Users className="h-5 w-5 text-purple-500" />
                                            <h2 className="text-xl font-bold text-slate-900">{char.name}</h2>
                                            <Badge className="bg-purple-100 text-purple-700 border-0">Visual Assets</Badge>
                                            <Badge variant="outline" className="ml-auto">{totalGridImages + (char.imageUrl ? 1 : 0)} images</Badge>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            {/* LEFT COLUMN: Active Image Version */}
                                            <div className="space-y-3">
                                                <h3 className="text-sm font-bold text-purple-600 uppercase">Active Image</h3>
                                                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden shadow-lg border-2 border-green-500">
                                                    {char.imageUrl ? (
                                                        <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Users className="h-16 w-16" />
                                                        </div>
                                                    )}
                                                </div>
                                                <Badge className="bg-green-500 text-white w-full justify-center">Active Version</Badge>
                                            </div>

                                            {/* RIGHT 2 COLUMNS: Visual Grids */}
                                            <div className="col-span-2 space-y-4">
                                                {/* KEY POSES GRID */}
                                                {char.keyPoses && keyPosesCount > 0 && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-blue-600 uppercase mb-2">
                                                            Key Poses ({keyPosesCount})
                                                        </h3>
                                                        <div className="grid grid-cols-5 gap-1.5">
                                                            {Object.entries(char.keyPoses).map(([key, url]) => {
                                                                if (!url) return null;
                                                                return (
                                                                    <div key={key} className="rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
                                                                        <div className="aspect-square">
                                                                            <img src={url} alt={key} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <p className="text-[6px] font-medium text-blue-600 text-center py-0.5 truncate px-0.5">
                                                                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* FACIAL EXPRESSIONS GRID */}
                                                {char.facialExpressions && expressionsCount > 0 && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-pink-600 uppercase mb-2">
                                                            Facial Expressions ({expressionsCount})
                                                        </h3>
                                                        <div className="grid grid-cols-5 gap-1.5">
                                                            {Object.entries(char.facialExpressions).map(([key, url]) => {
                                                                if (!url) return null;
                                                                return (
                                                                    <div key={key} className="rounded-lg overflow-hidden border border-pink-200 bg-pink-50">
                                                                        <div className="aspect-square">
                                                                            <img src={url} alt={key} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <p className="text-[6px] font-medium text-pink-600 text-center py-0.5 truncate px-0.5">
                                                                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* EMOTION GESTURES GRID */}
                                                {char.emotionGestures && gesturesCount > 0 && (
                                                    <div>
                                                        <h3 className="text-xs font-bold text-amber-600 uppercase mb-2">
                                                            Emotion Gestures ({gesturesCount})
                                                        </h3>
                                                        <div className="grid grid-cols-5 gap-1.5">
                                                            {Object.entries(char.emotionGestures).map(([key, url]) => {
                                                                if (!url) return null;
                                                                return (
                                                                    <div key={key} className="rounded-lg overflow-hidden border border-amber-200 bg-amber-50">
                                                                        <div className="aspect-square">
                                                                            <img src={url} alt={key} className="w-full h-full object-cover" />
                                                                        </div>
                                                                        <p className="text-[6px] font-medium text-amber-600 text-center py-0.5 truncate px-0.5">
                                                                            {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Empty State for Grids */}
                                                {totalGridImages === 0 && (
                                                    <div className="flex flex-col items-center justify-center py-8 text-slate-400 bg-slate-50 rounded-xl">
                                                        <Users className="h-12 w-12 mb-3 opacity-50" />
                                                        <p className="text-sm">No visual grids generated yet</p>
                                                        <p className="text-xs mt-1">Generate poses, expressions & gestures from Character tab</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* STORY OVERVIEW PAGE 1 - Metadata + Premise + Conflict */}
                            {pages[currentPage]?.id === 'story-overview-1' && (
                                <div style={{ height: A4_HEIGHT }} className="p-8 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
                                        <Film className="h-6 w-6 text-blue-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Story Overview</h2>
                                        <Badge className="bg-blue-100 text-blue-700 border-0 ml-auto">{story.structure || 'Save the Cat'}</Badge>
                                    </div>

                                    {/* Story Metadata */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <p className="text-xs font-bold text-blue-600 uppercase">Genre</p>
                                            <p className="text-sm text-slate-700 mt-1">{story.genre || 'Not set'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <p className="text-xs font-bold text-blue-600 uppercase">Tone</p>
                                            <p className="text-sm text-slate-700 mt-1">{story.tone || 'Not set'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <p className="text-xs font-bold text-blue-600 uppercase">Theme</p>
                                            <p className="text-sm text-slate-700 mt-1">{story.theme || 'Not set'}</p>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-lg">
                                            <p className="text-xs font-bold text-blue-600 uppercase">Format</p>
                                            <p className="text-sm text-slate-700 mt-1">{story.format || 'Not set'}</p>
                                        </div>
                                    </div>

                                    {/* Premise */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Premise</h3>
                                        <p className="text-slate-700 leading-relaxed bg-blue-50 p-4 rounded-lg">{story.premise || 'No premise defined.'}</p>
                                    </div>

                                    {/* Conflict & Ending */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                                            <p className="text-xs font-bold text-red-600 uppercase">Core Conflict</p>
                                            <p className="text-sm text-slate-700 mt-2">{story.conflict || 'Not defined'}</p>
                                        </div>
                                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                                            <p className="text-xs font-bold text-green-600 uppercase">Ending Type</p>
                                            <p className="text-sm text-slate-700 mt-2">{story.endingType || 'Not defined'}</p>
                                        </div>
                                    </div>

                                    {/* Want/Need Matrix */}
                                    {story.wantNeedMatrix && (
                                        <div>
                                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Want vs Need</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {story.wantNeedMatrix.want && (
                                                    <div className="p-4 bg-blue-50 rounded-lg">
                                                        <p className="text-xs font-bold text-blue-600 uppercase mb-2">WANT (External)</p>
                                                        <div className="space-y-2 text-sm">
                                                            {story.wantNeedMatrix.want.external && <p><b>External:</b> {story.wantNeedMatrix.want.external}</p>}
                                                            {story.wantNeedMatrix.want.known && <p><b>Known:</b> {story.wantNeedMatrix.want.known}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                                {story.wantNeedMatrix.need && (
                                                    <div className="p-4 bg-rose-50 rounded-lg">
                                                        <p className="text-xs font-bold text-rose-600 uppercase mb-2">NEED (Internal)</p>
                                                        <div className="space-y-2 text-sm">
                                                            {story.wantNeedMatrix.need.internal && <p><b>Internal:</b> {story.wantNeedMatrix.need.internal}</p>}
                                                            {story.wantNeedMatrix.need.unknown && <p><b>Unknown:</b> {story.wantNeedMatrix.need.unknown}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STORY OVERVIEW PAGE 2 - Synopsis Content */}
                            {pages[currentPage]?.id === 'story-overview-2' && (
                                <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-blue-500">
                                        <Film className="h-5 w-5 text-blue-500" />
                                        <h2 className="text-xl font-bold text-slate-900">Story Synopsis</h2>
                                        <Badge variant="outline" className="ml-auto text-xs">continued</Badge>
                                    </div>

                                    {/* Premise */}
                                    {story.premise && (
                                        <div className="mb-4">
                                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Premise</h3>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-700 leading-relaxed">{story.premise}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Synopsis */}
                                    {story.synopsis && (
                                        <div className="mb-4">
                                            <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Synopsis</h3>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{story.synopsis}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Global Synopsis */}
                                    {story.globalSynopsis && (
                                        <div>
                                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Global Synopsis</h3>
                                            <div className="bg-purple-50 p-3 rounded-lg">
                                                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">{story.globalSynopsis}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Show message if no synopsis */}
                                    {!story.synopsis && !story.globalSynopsis && (
                                        <div className="flex flex-col items-center justify-center h-[70%] text-slate-400">
                                            <Film className="h-16 w-16 mb-4 opacity-50" />
                                            <p className="text-base">No synopsis defined yet</p>
                                            <p className="text-xs mt-2">Add synopsis from the Story tab</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* STORY BEATS PAGES (paginated) */}
                            {pages[currentPage]?.id.startsWith('story-beats-') && (() => {
                                const pageMatch = pages[currentPage].id.match(/^story-beats-(\d+)$/);
                                const pageNum = pageMatch ? parseInt(pageMatch[1]) : 1;
                                const beatsArray = beats ? Object.entries(beats) : [];
                                const startIdx = (pageNum - 1) * BEATS_PER_PAGE;
                                const pageBeats = beatsArray.slice(startIdx, startIdx + BEATS_PER_PAGE);

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-10 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
                                            <Film className="h-6 w-6 text-blue-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">Story Beats</h2>
                                            <Badge className="bg-blue-100 text-blue-700 border-0 ml-auto">
                                                Page {pageNum} • {story.structure || 'Save the Cat'}
                                            </Badge>
                                        </div>

                                        <div className="space-y-3">
                                            {pageBeats.map(([key, value], index) => {
                                                const beatKeyAction = keyActions?.[key] || '';
                                                // Get ALL key actions from moodboard items for this beat (not just first one)
                                                const beatMoodboardItems = moodboardItems.filter(mi => mi.beatKey === key && mi.keyActionDescription);
                                                const beatNum = startIdx + index + 1;
                                                return (
                                                    <div key={key} className="bg-slate-50 rounded-lg p-3 border-l-4 border-blue-500">
                                                        <div className="flex gap-2 items-start">
                                                            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                                {beatNum}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-bold text-slate-900 capitalize text-sm">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                </span>
                                                                <p className="text-slate-600 text-xs mt-1 line-clamp-2">{value || 'Not defined'}</p>

                                                                {/* Show ALL key actions from moodboard */}
                                                                {beatMoodboardItems.length > 0 ? (
                                                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">
                                                                            Key Actions ({beatMoodboardItems.length}):
                                                                        </p>
                                                                        <div className="space-y-1">
                                                                            {beatMoodboardItems.map((item, itemIdx) => (
                                                                                <p key={itemIdx} className="text-[10px] text-slate-600">
                                                                                    <span className="font-medium text-purple-500">{itemIdx + 1}.</span> {item.keyActionDescription}
                                                                                </p>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                ) : beatKeyAction && (
                                                                    <div className="mt-2 pt-2 border-t border-slate-200">
                                                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">
                                                                            Key Action:
                                                                        </p>
                                                                        <p className="text-[11px] text-slate-600 line-clamp-2">{beatKeyAction}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {pageBeats.length === 0 && (
                                            <div className="text-center py-8 text-slate-400">
                                                <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                                <p>No story beats defined yet</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* WORLD PAGE 1 - Universe Info + Private/Community Levels */}
                            {pages[currentPage]?.id === 'world-1' && (
                                <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-emerald-500">
                                        <Globe className="h-5 w-5 text-emerald-500" />
                                        <h2 className="text-xl font-bold text-slate-900">World Building</h2>
                                    </div>

                                    {/* Universe Basic Info */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-3 bg-emerald-50 rounded-lg">
                                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Universe Name</h3>
                                            <p className="text-sm text-slate-900 font-medium">{universe.name || universe.universeName || 'Unnamed Universe'}</p>
                                        </div>
                                        <div className="p-3 bg-emerald-50 rounded-lg">
                                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Era / Period</h3>
                                            <p className="text-sm text-slate-900">{universe.era || universe.period || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    {/* Environment & Landscape */}
                                    {(universe.description || universe.environmentLandscape || universe.environment) && (
                                        <div className="mb-4">
                                            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Environment & Landscape</h3>
                                            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                                {universe.description || universe.environmentLandscape || universe.environment}
                                            </p>
                                        </div>
                                    )}

                                    {/* Private Level */}
                                    <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Private Level</h3>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1 text-[10px]">Private Interior</span>
                                            <p className="text-slate-600 text-[10px]">{universe.roomCave || universe.privateInterior || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1 text-[10px]">House / Castle</span>
                                            <p className="text-slate-600 text-[10px]">{universe.houseCastle || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1 text-[10px]">Family Circle</span>
                                            <p className="text-slate-600 text-[10px]">{universe.familyInnerCircle || 'Not defined'}</p>
                                        </div>
                                    </div>

                                    {/* Community Level */}
                                    <h3 className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Community Level</h3>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1 text-[10px]">Neighborhood</span>
                                            <p className="text-slate-600 text-[10px]">{universe.neighborhoodEnvironment || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1 text-[10px]">Town / District</span>
                                            <p className="text-slate-600 text-[10px]">{universe.townDistrictCity || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1 text-[10px]">Working / School</span>
                                            <p className="text-slate-600 text-[10px]">{universe.workingOfficeSchool || 'Not defined'}</p>
                                        </div>
                                    </div>

                                    {/* National Level */}
                                    <h3 className="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-2">National Level</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1 text-[10px]">Country</span>
                                            <p className="text-slate-600 text-[10px]">{universe.country || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1 text-[10px]">Government</span>
                                            <p className="text-slate-600 text-[10px]">{universe.governmentSystem || universe.government || 'Not defined'}</p>
                                        </div>
                                        <div className="p-2 bg-slate-50 rounded-lg border-l-3 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1 text-[10px]">Kingdom / Tribe</span>
                                            <p className="text-slate-600 text-[10px]">{universe.kingdomTribeCommunal || 'Not defined'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* WORLD PAGE 2 - Society & Rules */}
                            {pages[currentPage]?.id === 'world-2' && (
                                <div style={{ height: A4_HEIGHT }} className="p-6 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-emerald-500">
                                        <Globe className="h-5 w-5 text-emerald-500" />
                                        <h2 className="text-xl font-bold text-slate-900">World Building</h2>
                                        <Badge variant="outline" className="ml-auto text-xs">continued</Badge>
                                    </div>

                                    {/* Society Level */}
                                    <h3 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">Society Level</h3>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-3 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1 text-xs">Society System</span>
                                            <p className="text-slate-600 text-xs">{universe.societyAndSystem || universe.society || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-3 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1 text-xs">Sociocultural</span>
                                            <p className="text-slate-600 text-xs">{universe.socioculturalSystem || universe.culture || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-3 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1 text-xs">Economy</span>
                                            <p className="text-slate-600 text-xs">{universe.sociopoliticEconomy || universe.economy || 'Not defined'}</p>
                                        </div>
                                    </div>

                                    {/* Rules & Laws */}
                                    <h3 className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2">Rules & Laws</h3>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-3 border-violet-400">
                                            <span className="font-bold text-violet-700 block mb-1 text-xs">Labor Laws</span>
                                            <p className="text-slate-600 text-xs">{universe.laborLaw || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-3 border-violet-400">
                                            <span className="font-bold text-violet-700 block mb-1 text-xs">Rules of Work</span>
                                            <p className="text-slate-600 text-xs">{universe.rulesOfWork || 'Not defined'}</p>
                                        </div>
                                    </div>

                                    {/* Technology & Magic (if any) */}
                                    {(universe.technology || universe.magic || universe.specialRules) && (
                                        <div className="mb-4">
                                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-2">Special Elements</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {universe.technology && (
                                                    <div className="p-3 bg-purple-50 rounded-lg">
                                                        <span className="font-bold text-purple-700 block mb-1 text-xs">Technology</span>
                                                        <p className="text-slate-600 text-xs">{universe.technology}</p>
                                                    </div>
                                                )}
                                                {universe.magic && (
                                                    <div className="p-3 bg-purple-50 rounded-lg">
                                                        <span className="font-bold text-purple-700 block mb-1 text-xs">Magic / Supernatural</span>
                                                        <p className="text-slate-600 text-xs">{universe.magic}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* No data fallback */}
                                    {!universe.name && !universe.universeName && !universe.era && !universe.period && (
                                        <div className="text-center py-8 text-slate-400 mt-4">
                                            <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p>No universe data defined yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MOODBOARD PAGES (paginated by beats - 2 beats per page) */}
                            {pages[currentPage]?.id.startsWith('moodboard-') && (() => {
                                const pageMatch = pages[currentPage].id.match(/^moodboard-(\d+)$/);
                                const pageNum = pageMatch ? parseInt(pageMatch[1]) : 1;

                                // Group items by beat
                                const itemsWithImages = moodboardItems.filter(item => item.imageUrl);
                                const uniqueBeats = [...new Set(itemsWithImages.map(item => item.beatKey))];
                                const totalPages = Math.max(1, Math.ceil(uniqueBeats.length / BEATS_PER_PAGE));

                                // Get beats for this page
                                const startBeatIdx = (pageNum - 1) * BEATS_PER_PAGE;
                                const pageBeats = uniqueBeats.slice(startBeatIdx, startBeatIdx + BEATS_PER_PAGE);

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-10 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-500">
                                            <Palette className="h-6 w-6 text-pink-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">Moodboard</h2>
                                            <Badge variant="outline" className="ml-auto border-pink-300 text-pink-600">
                                                Page {pageNum}/{totalPages} • {uniqueBeats.length} beats
                                            </Badge>
                                        </div>

                                        <div className="space-y-6">
                                            {pageBeats.map((beatKey, beatIdx) => {
                                                // Get all images for this beat
                                                const beatImages = itemsWithImages.filter(item => item.beatKey === beatKey);
                                                const beatLabel = beatImages[0]?.beatLabel || beatKey
                                                    .replace(/_/g, ' ')
                                                    .replace(/([A-Z])/g, ' $1')
                                                    .trim()
                                                    .split(' ')
                                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                    .join(' ');

                                                return (
                                                    <div key={beatKey} className="bg-slate-50 rounded-lg p-4 border-l-4 border-pink-500">
                                                        <h3 className="text-sm font-bold text-pink-600 uppercase mb-3">
                                                            {startBeatIdx + beatIdx + 1}. {beatLabel}
                                                        </h3>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {beatImages.map((item, idx) => (
                                                                <div key={`${item.beatKey}-${idx}`} className="group relative">
                                                                    <div className="aspect-video bg-slate-100 rounded overflow-hidden shadow-sm">
                                                                        <img src={item.imageUrl} alt={`${beatLabel} ${idx + 1}`} className="w-full h-full object-cover" />
                                                                    </div>
                                                                    {item.keyActionDescription && (
                                                                        <p className="text-[8px] text-slate-500 line-clamp-1 mt-1">{item.keyActionDescription}</p>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {pageBeats.length === 0 && (
                                            <div className="text-center py-12 text-slate-400">
                                                <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No moodboard visuals generated yet</p>
                                                <p className="text-xs mt-1">Generate moodboard images from the Moodboard tab</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* ANIMATION PAGES (paginated) */}
                            {pages[currentPage]?.id.startsWith('animation-') && (() => {
                                const pageMatch = pages[currentPage].id.match(/^animation-(\d+)$/);
                                const pageNum = pageMatch ? parseInt(pageMatch[1]) : 1;
                                const animationEntries = Object.entries(animationThumbnails);
                                const totalPages = Math.max(1, Math.ceil(animationEntries.length / IMAGES_PER_PAGE));
                                const startIdx = (pageNum - 1) * IMAGES_PER_PAGE;
                                const pageImages = animationEntries.slice(startIdx, startIdx + IMAGES_PER_PAGE);

                                return (
                                    <div style={{ height: A4_HEIGHT }} className="p-10 overflow-hidden">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-500">
                                            <Video className="h-6 w-6 text-purple-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">Animation</h2>
                                            <Badge variant="outline" className="ml-auto border-purple-300 text-purple-600">
                                                {animationEntries.length > 0 ? `Page ${pageNum}/${totalPages} • ${animationEntries.length} frames` : 'No frames'}
                                            </Badge>
                                        </div>

                                        {pageImages.length > 0 ? (
                                            <div className="grid grid-cols-3 gap-4">
                                                {pageImages.map(([key, url]) => {
                                                    const frameLabel = key
                                                        .replace(/_/g, ' ')
                                                        .replace(/([A-Z])/g, ' $1')
                                                        .trim()
                                                        .split(' ')
                                                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                        .join(' ');

                                                    return (
                                                        <div key={key} className="group relative">
                                                            <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-md">
                                                                <img src={url} alt={frameLabel} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="mt-2">
                                                                <p className="text-xs font-bold text-purple-600 uppercase truncate">{frameLabel}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12 text-slate-400">
                                                <Video className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No animation frames generated yet</p>
                                                <p className="text-xs mt-1">Generate animation from the Animate tab</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
