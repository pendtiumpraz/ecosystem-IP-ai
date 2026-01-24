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

interface IPBibleStudioProps {
    project: ProjectData;
    characters: CharacterData[];
    story: StoryData;
    universe: UniverseData;
    moodboardImages: Record<string, string>;
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

    // Calculate pages dynamically - each character gets their own dedicated page
    const pages = useMemo(() => {
        const basePages = [
            { id: 'cover', title: 'Cover Page' },
            { id: 'overview', title: 'Project Overview' },
        ];

        // Add individual character pages
        filteredCharacters.forEach((char, idx) => {
            basePages.push({
                id: `character-${char.id}`,
                title: `Character: ${char.name}`
            });
        });

        // Add remaining pages
        basePages.push(
            { id: 'story', title: 'Story Structure' },
            { id: 'world', title: 'World Building' },
            { id: 'visuals', title: 'Visual Development' },
        );

        return basePages;
    }, [filteredCharacters]);

    const goToPage = (delta: number) => {
        setCurrentPage(prev => Math.max(0, Math.min(pages.length - 1, prev + delta)));
    };

    // Get beats based on structure type
    const beats = story.structure === "The Hero's Journey"
        ? story.heroBeats
        : story.structure === "Dan Harmon Circle"
            ? story.harmonBeats
            : story.catBeats;

    // Get key actions based on structure type
    const keyActions = story.structure === "The Hero's Journey"
        ? story.heroKeyActions
        : story.structure === "Dan Harmon Circle"
            ? story.harmonKeyActions
            : story.catKeyActions;

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
                        <span className="text-sm text-white font-mono min-w-[80px] text-center">
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
                    <Badge variant="outline" className="bg-white/5 text-white border-white/20">
                        {pages[currentPage]?.title}
                    </Badge>
                </div>

                {/* Right: Settings, Zoom & Export */}
                <div className="flex items-center gap-3">
                    {/* Toggle Version Selector */}
                    <Button
                        size="sm"
                        variant={showVersionSelector ? "secondary" : "ghost"}
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
                        <span className="text-xs text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
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
                        <span className="text-sm font-semibold text-white">Select Content Versions</span>
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

                {/* LEFT: Page Thumbnails */}
                <div className="w-32 rounded-xl border border-white/10 bg-slate-900/50">
                    <ScrollArea className="h-full p-2">
                        <div className="space-y-2">
                            {pages.map((page, index) => (
                                <button
                                    key={page.id}
                                    onClick={() => setCurrentPage(index)}
                                    className={`w-full aspect-[210/297] rounded-lg border-2 transition-all ${currentPage === index ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/10 hover:border-white/30'} bg-white overflow-hidden`}
                                >
                                    <div className="w-full h-full flex items-center justify-center text-[8px] text-slate-500 font-bold">
                                        {index + 1}
                                    </div>
                                </button>
                            ))}
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

                            {/* INDIVIDUAL CHARACTER PAGES */}
                            {pages[currentPage]?.id.startsWith('character-') && (() => {
                                const charId = pages[currentPage].id.replace('character-', '');
                                const char = filteredCharacters.find(c => c.id === charId);
                                if (!char) return null;

                                // Collect all available images
                                const allImages: { key: string; url: string }[] = [];
                                if (char.imagePoses) {
                                    Object.entries(char.imagePoses).forEach(([key, url]) => {
                                        if (url) allImages.push({ key, url });
                                    });
                                }
                                if (char.imageVersions) {
                                    char.imageVersions.forEach(iv => {
                                        allImages.push({ key: `v${iv.versionNumber}`, url: iv.imageUrl });
                                    });
                                }

                                return (
                                    <div style={{ minHeight: A4_HEIGHT }} className="p-8 overflow-auto">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-500">
                                            <Users className="h-6 w-6 text-purple-500" />
                                            <h2 className="text-2xl font-bold text-slate-900">{char.name}</h2>
                                            <Badge className="bg-purple-100 text-purple-700 border-0">{char.role}</Badge>
                                            {char.age && <Badge variant="outline">{char.age} years old</Badge>}
                                        </div>

                                        <div className="grid grid-cols-3 gap-6">
                                            {/* Column 1: Images & Basic Info */}
                                            <div className="space-y-4">
                                                {/* Main Profile Image */}
                                                <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden shadow-lg">
                                                    {allImages.length > 0 ? (
                                                        <img src={allImages[0].url} alt={char.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Users className="h-16 w-16" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* All Image Versions */}
                                                {allImages.length > 1 && (
                                                    <div>
                                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">
                                                            All Image Versions ({allImages.length})
                                                        </p>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {allImages.map((img, idx) => (
                                                                <div key={idx} className="aspect-square bg-slate-100 rounded-md overflow-hidden">
                                                                    <img src={img.url} alt={`${char.name} ${img.key}`} className="w-full h-full object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

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
                                                                <Badge key={idx} variant="outline" className="text-[9px]">{trait}</Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Column 2: Psychological & Emotional */}
                                            <div className="space-y-4">
                                                {/* Physiological Traits */}
                                                {char.physiological && (
                                                    <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
                                                        <p className="text-[10px] font-bold text-pink-600 uppercase mb-2">Physiological Profile</p>
                                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
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
                                                            <div className="mt-2 pt-2 border-t border-pink-200">
                                                                <p className="text-[10px] text-pink-600 font-medium">Uniqueness:</p>
                                                                <p className="text-[11px] text-slate-600">{char.physiological.uniqueness}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Psychological Profile */}
                                                {char.psychological && (
                                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                        <p className="text-[10px] font-bold text-purple-600 uppercase mb-2">Psychological Profile</p>
                                                        {char.psychological.archetype && (
                                                            <Badge className="bg-purple-600 mb-2 text-[9px]">{char.psychological.archetype}</Badge>
                                                        )}
                                                        {char.psychological.personalityType && (
                                                            <p className="text-[11px] mb-1"><span className="text-slate-500">Type:</span> {char.psychological.personalityType}</p>
                                                        )}
                                                        {char.psychological.wants && (
                                                            <p className="text-[11px] mb-1"><span className="text-slate-500 font-medium">Wants:</span> {char.psychological.wants}</p>
                                                        )}
                                                        {char.psychological.needs && (
                                                            <p className="text-[11px] mb-1"><span className="text-slate-500 font-medium">Needs:</span> {char.psychological.needs}</p>
                                                        )}
                                                        {char.psychological.fears && (
                                                            <p className="text-[11px] mb-1"><span className="text-slate-500 font-medium">Fears:</span> {char.psychological.fears}</p>
                                                        )}
                                                        {char.psychological.alterEgo && (
                                                            <p className="text-[11px] mb-1"><span className="text-slate-500">Alter Ego:</span> {char.psychological.alterEgo}</p>
                                                        )}
                                                        {char.psychological.traumatic && (
                                                            <div className="mt-2 pt-2 border-t border-purple-200">
                                                                <p className="text-[10px] text-purple-600 font-medium">Traumatic Experience:</p>
                                                                <p className="text-[11px] text-slate-600">{char.psychological.traumatic}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Emotional Traits */}
                                                {char.emotional && (
                                                    <div className="p-3 bg-rose-50 rounded-lg border border-rose-200">
                                                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-2">Emotional Traits</p>
                                                        <div className="space-y-1 text-[11px]">
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

                                            {/* Column 3: Social & Other */}
                                            <div className="space-y-4">
                                                {/* Family Relations */}
                                                {char.family && (char.family.spouse || char.family.children || char.family.parents) && (
                                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">Family</p>
                                                        <div className="space-y-1 text-[11px]">
                                                            {char.family.parents && <p><span className="text-slate-500">Parents:</span> {char.family.parents}</p>}
                                                            {char.family.spouse && <p><span className="text-slate-500">Spouse:</span> {char.family.spouse}</p>}
                                                            {char.family.children && <p><span className="text-slate-500">Children:</span> {char.family.children}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Sociocultural */}
                                                {char.sociocultural && (
                                                    <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                                                        <p className="text-[10px] font-bold text-teal-600 uppercase mb-2">Sociocultural</p>
                                                        <div className="space-y-1 text-[11px]">
                                                            {char.sociocultural.affiliation && <p><span className="text-slate-500">Affiliation:</span> {char.sociocultural.affiliation}</p>}
                                                            {char.sociocultural.tribe && <p><span className="text-slate-500">Tribe:</span> {char.sociocultural.tribe}</p>}
                                                            {char.sociocultural.language && <p><span className="text-slate-500">Language:</span> {char.sociocultural.language}</p>}
                                                            {char.sociocultural.cultureTradition && <p><span className="text-slate-500">Culture:</span> {char.sociocultural.cultureTradition}</p>}
                                                            {char.sociocultural.economicClass && <p><span className="text-slate-500">Class:</span> {char.sociocultural.economicClass}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Core Beliefs */}
                                                {char.coreBeliefs && (
                                                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-[10px] font-bold text-amber-600 uppercase mb-2">Core Beliefs</p>
                                                        <div className="space-y-1 text-[11px]">
                                                            {char.coreBeliefs.faith && <p><span className="text-slate-500">Faith:</span> {char.coreBeliefs.faith}</p>}
                                                            {char.coreBeliefs.religionSpirituality && <p><span className="text-slate-500">Religion:</span> {char.coreBeliefs.religionSpirituality}</p>}
                                                            {char.coreBeliefs.integrity && <p><span className="text-slate-500">Integrity:</span> {char.coreBeliefs.integrity}</p>}
                                                            {char.coreBeliefs.commitments && <p><span className="text-slate-500">Commitments:</span> {char.coreBeliefs.commitments}</p>}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* SWOT Analysis */}
                                                {char.swot && (
                                                    <div className="p-3 bg-slate-100 rounded-lg border border-slate-200">
                                                        <p className="text-[10px] font-bold text-slate-600 uppercase mb-2">SWOT Analysis</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {char.swot.strength && (
                                                                <div className="p-2 bg-green-50 rounded border-l-2 border-green-400">
                                                                    <p className="text-[9px] font-bold text-green-600">Strength</p>
                                                                    <p className="text-[10px] text-slate-600">{char.swot.strength}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.weakness && (
                                                                <div className="p-2 bg-red-50 rounded border-l-2 border-red-400">
                                                                    <p className="text-[9px] font-bold text-red-600">Weakness</p>
                                                                    <p className="text-[10px] text-slate-600">{char.swot.weakness}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.opportunity && (
                                                                <div className="p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                                                                    <p className="text-[9px] font-bold text-blue-600">Opportunity</p>
                                                                    <p className="text-[10px] text-slate-600">{char.swot.opportunity}</p>
                                                                </div>
                                                            )}
                                                            {char.swot.threat && (
                                                                <div className="p-2 bg-orange-50 rounded border-l-2 border-orange-400">
                                                                    <p className="text-[9px] font-bold text-orange-600">Threat</p>
                                                                    <p className="text-[10px] text-slate-600">{char.swot.threat}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Costume & Props */}
                                                {(char.clothingStyle || char.props || (char.accessories && char.accessories.length > 0)) && (
                                                    <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                                                        <p className="text-[10px] font-bold text-indigo-600 uppercase mb-2">Costume & Props</p>
                                                        <div className="space-y-1 text-[11px]">
                                                            {char.clothingStyle && <p><span className="text-slate-500">Style:</span> {char.clothingStyle}</p>}
                                                            {char.props && <p><span className="text-slate-500">Props:</span> {char.props}</p>}
                                                            {char.accessories && char.accessories.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {char.accessories.map((acc, idx) => (
                                                                        <Badge key={idx} variant="outline" className="text-[8px]">{acc}</Badge>
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

                            {/* STORY PAGE */}
                            {pages[currentPage]?.id === 'story' && (
                                <div style={{ minHeight: A4_HEIGHT }} className="p-10 overflow-auto">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
                                        <Film className="h-6 w-6 text-blue-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Story Structure</h2>
                                        <Badge className="bg-blue-100 text-blue-700 border-0 ml-auto">{story.structure || 'Save the Cat'}</Badge>
                                    </div>

                                    {/* Story Metadata */}
                                    <div className="grid grid-cols-4 gap-4 mb-6">
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Genre</p>
                                            <p className="text-sm text-slate-700">{story.genre || 'Not set'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Tone</p>
                                            <p className="text-sm text-slate-700">{story.tone || 'Not set'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Theme</p>
                                            <p className="text-sm text-slate-700">{story.theme || 'Not set'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg">
                                            <p className="text-[10px] font-bold text-blue-600 uppercase">Structure</p>
                                            <p className="text-sm text-slate-700">{story.structure || 'Save the Cat'}</p>
                                        </div>
                                    </div>

                                    {/* Premise & Synopsis */}
                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Premise</h3>
                                            <p className="text-slate-700 text-sm leading-relaxed bg-blue-50 p-3 rounded-lg">{story.premise || 'No premise defined.'}</p>
                                        </div>
                                        {story.synopsis && (
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Synopsis</h3>
                                                <p className="text-slate-700 text-sm leading-relaxed">{story.synopsis}</p>
                                            </div>
                                        )}
                                        {story.globalSynopsis && (
                                            <div>
                                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">Global Synopsis</h3>
                                                <p className="text-slate-700 text-sm leading-relaxed">{story.globalSynopsis}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Story Beats with Key Actions */}
                                    <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">
                                        Story Beats & Key Actions
                                    </h3>
                                    <div className="space-y-3 mb-6">
                                        {beats && Object.entries(beats).map(([key, value], index) => {
                                            const beatKeyAction = keyActions?.[key] || '';
                                            return (
                                                <div key={key} className="bg-slate-50 rounded-lg p-3 border-l-4 border-blue-500">
                                                    <div className="flex gap-2 items-start">
                                                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="font-bold text-slate-900 capitalize text-sm">
                                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                                            </span>
                                                            <p className="text-slate-600 text-xs mt-1">{value || 'Not defined'}</p>

                                                            {/* Key Action for this beat */}
                                                            {beatKeyAction && (
                                                                <div className="mt-2 pt-2 border-t border-slate-200">
                                                                    <p className="text-[10px] font-bold text-purple-600 uppercase mb-1">Key Action:</p>
                                                                    <p className="text-[11px] text-slate-600">{beatKeyAction}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Conflict & Ending */}
                                    {(story.conflict || story.endingType) && (
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            {story.conflict && (
                                                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                                                    <p className="text-[10px] font-bold text-red-600 uppercase">Core Conflict</p>
                                                    <p className="text-sm text-slate-700">{story.conflict}</p>
                                                </div>
                                            )}
                                            {story.endingType && (
                                                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                                                    <p className="text-[10px] font-bold text-green-600 uppercase">Ending Type</p>
                                                    <p className="text-sm text-slate-700">{story.endingType}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Want/Need Matrix */}
                                    {story.wantNeedMatrix && (story.wantNeedMatrix.want || story.wantNeedMatrix.need) && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-3">Want vs Need</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                {story.wantNeedMatrix.want && (
                                                    <div className="p-3 bg-blue-50 rounded-lg">
                                                        <p className="text-[10px] font-bold text-blue-600 uppercase mb-2">WANT (External)</p>
                                                        <div className="space-y-1 text-xs">
                                                            {story.wantNeedMatrix.want.external && <p><b>External:</b> {story.wantNeedMatrix.want.external}</p>}
                                                            {story.wantNeedMatrix.want.known && <p><b>Known:</b> {story.wantNeedMatrix.want.known}</p>}
                                                            {story.wantNeedMatrix.want.specific && <p><b>Specific:</b> {story.wantNeedMatrix.want.specific}</p>}
                                                            {story.wantNeedMatrix.want.achieved && <p><b>Achieved:</b> {story.wantNeedMatrix.want.achieved}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                                {story.wantNeedMatrix.need && (
                                                    <div className="p-3 bg-rose-50 rounded-lg">
                                                        <p className="text-[10px] font-bold text-rose-600 uppercase mb-2">NEED (Internal)</p>
                                                        <div className="space-y-1 text-xs">
                                                            {story.wantNeedMatrix.need.internal && <p><b>Internal:</b> {story.wantNeedMatrix.need.internal}</p>}
                                                            {story.wantNeedMatrix.need.unknown && <p><b>Unknown:</b> {story.wantNeedMatrix.need.unknown}</p>}
                                                            {story.wantNeedMatrix.need.universal && <p><b>Universal:</b> {story.wantNeedMatrix.need.universal}</p>}
                                                            {story.wantNeedMatrix.need.achieved && <p><b>Achieved:</b> {story.wantNeedMatrix.need.achieved}</p>}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {(!beats || Object.keys(beats).length === 0) && (
                                        <div className="text-center py-8 text-slate-400">
                                            <Film className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p>No story beats defined yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* WORLD PAGE */}
                            {pages[currentPage]?.id === 'world' && (
                                <div style={{ minHeight: A4_HEIGHT }} className="p-10 overflow-auto">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-500">
                                        <Globe className="h-6 w-6 text-emerald-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">World Building</h2>
                                    </div>

                                    {/* Universe Basic Info */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="p-4 bg-emerald-50 rounded-lg">
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Universe Name</h3>
                                            <p className="text-lg text-slate-900 font-medium">{universe.name || universe.universeName || 'Unnamed Universe'}</p>
                                        </div>
                                        <div className="p-4 bg-emerald-50 rounded-lg">
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Era / Period</h3>
                                            <p className="text-lg text-slate-900">{universe.era || universe.period || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    {/* Environment & Landscape */}
                                    {(universe.description || universe.environmentLandscape || universe.environment) && (
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Environment & Landscape</h3>
                                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg">
                                                {universe.description || universe.environmentLandscape || universe.environment}
                                            </p>
                                        </div>
                                    )}

                                    {/* World Levels - Detailed Grid */}
                                    <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">World Levels</h3>
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        {/* Private Level */}
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1">Private Interior</span>
                                            <p className="text-slate-600">{universe.roomCave || universe.privateInterior || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1">House / Castle</span>
                                            <p className="text-slate-600">{universe.houseCastle || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-emerald-400">
                                            <span className="font-bold text-emerald-700 block mb-1">Family Circle</span>
                                            <p className="text-slate-600">{universe.familyInnerCircle || 'Not defined'}</p>
                                        </div>

                                        {/* Community Level */}
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1">Neighborhood</span>
                                            <p className="text-slate-600">{universe.neighborhoodEnvironment || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1">Town / District</span>
                                            <p className="text-slate-600">{universe.townDistrictCity || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-teal-400">
                                            <span className="font-bold text-teal-700 block mb-1">Working / School</span>
                                            <p className="text-slate-600">{universe.workingOfficeSchool || 'Not defined'}</p>
                                        </div>

                                        {/* National Level */}
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1">Country</span>
                                            <p className="text-slate-600">{universe.country || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1">Government</span>
                                            <p className="text-slate-600">{universe.governmentSystem || universe.government || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-cyan-400">
                                            <span className="font-bold text-cyan-700 block mb-1">Kingdom / Tribe</span>
                                            <p className="text-slate-600">{universe.kingdomTribeCommunal || 'Not defined'}</p>
                                        </div>

                                        {/* Society Level */}
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1">Society System</span>
                                            <p className="text-slate-600">{universe.societyAndSystem || universe.society || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1">Sociocultural</span>
                                            <p className="text-slate-600">{universe.socioculturalSystem || universe.culture || 'Not defined'}</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-400">
                                            <span className="font-bold text-blue-700 block mb-1">Economy</span>
                                            <p className="text-slate-600">{universe.sociopoliticEconomy || universe.economy || 'Not defined'}</p>
                                        </div>

                                        {/* Rules Level */}
                                        <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-violet-400 col-span-3">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <span className="font-bold text-violet-700 block mb-1">Labor Laws</span>
                                                    <p className="text-slate-600">{universe.laborLaw || 'Not defined'}</p>
                                                </div>
                                                <div>
                                                    <span className="font-bold text-violet-700 block mb-1">Rules of Work</span>
                                                    <p className="text-slate-600">{universe.rulesOfWork || 'Not defined'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* No data fallback */}
                                    {!universe.name && !universe.universeName && !universe.era && !universe.period && (
                                        <div className="text-center py-8 text-slate-400 mt-4">
                                            <Globe className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                            <p>No universe data defined yet</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VISUALS PAGE */}
                            {pages[currentPage]?.id === 'visuals' && (
                                <div style={{ minHeight: A4_HEIGHT }} className="p-10 overflow-auto">
                                    <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-500">
                                        <Palette className="h-6 w-6 text-pink-500" />
                                        <h2 className="text-2xl font-bold text-slate-900">Visual Development</h2>
                                        <Badge variant="outline" className="ml-auto border-pink-300 text-pink-600">
                                            {Object.keys(moodboardImages).length} images
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.entries(moodboardImages).map(([key, url]) => {
                                            // Parse beat key to get readable name
                                            const beatLabel = key
                                                .replace(/_/g, ' ')
                                                .replace(/([A-Z])/g, ' $1')
                                                .replace(/(\d+)/g, ' $1')
                                                .trim()
                                                .split(' ')
                                                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                                                .join(' ');

                                            return (
                                                <div key={key} className="group relative">
                                                    <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-md">
                                                        <img src={url} alt={beatLabel} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="mt-2">
                                                        <p className="text-xs font-bold text-pink-600 uppercase truncate">{beatLabel}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {Object.keys(moodboardImages).length === 0 && (
                                        <div className="text-center py-12 text-slate-400">
                                            <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No moodboard visuals generated yet</p>
                                            <p className="text-xs mt-1">Generate moodboard images from the Moodboard tab</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
