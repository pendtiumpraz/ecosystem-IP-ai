'use client';

import { useState, useRef } from 'react';
import {
    FileText, Download, Printer, ChevronLeft, ChevronRight,
    Book, Users, Globe, Film, Palette, Sparkles,
    ZoomIn, ZoomOut, Maximize2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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

interface CharacterData {
    id: string;
    name: string;
    role: string;
    archetype?: string;
    personality?: string;
    backstory?: string;
    imagePoses?: { portrait?: string };
}

interface StoryData {
    premise: string;
    theme?: string;
    tone?: string;
    genre?: string;
    structure?: string;
    catBeats?: Record<string, string>;
    heroBeats?: Record<string, string>;
}

interface UniverseData {
    name?: string;
    era?: string;
    description?: string;
    [key: string]: any;
}

interface IPBibleStudioProps {
    project: ProjectData;
    characters: CharacterData[];
    story: StoryData;
    universe: UniverseData;
    moodboardImages: Record<string, string>;
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
    onExportPDF,
    isExporting = false
}: IPBibleStudioProps) {
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(0.8);
    const contentRef = useRef<HTMLDivElement>(null);

    // Calculate pages dynamically
    const pages = [
        { id: 'cover', title: 'Cover Page' },
        { id: 'overview', title: 'Project Overview' },
        { id: 'characters', title: 'Character Profiles' },
        { id: 'story', title: 'Story Structure' },
        { id: 'world', title: 'World Building' },
        { id: 'visuals', title: 'Visual Development' },
    ];

    // Add extra character pages if needed
    const extraCharPages = Math.ceil(characters.length / 2) - 1;
    for (let i = 0; i < extraCharPages; i++) {
        pages.splice(3 + i, 0, { id: `characters-${i + 2}`, title: `Characters (${i + 2})` });
    }

    const goToPage = (delta: number) => {
        setCurrentPage(prev => Math.max(0, Math.min(pages.length - 1, prev + delta)));
    };

    const beats = story.structure === "The Hero's Journey" ? story.heroBeats : story.catBeats;

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

                {/* Right: Zoom & Export */}
                <div className="flex items-center gap-3">
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

                {/* RIGHT: Page Preview */}
                <div className="flex-1 rounded-xl border border-white/10 bg-slate-800/50 overflow-hidden flex items-center justify-center p-8">
                    <div
                        ref={contentRef}
                        className="bg-white shadow-2xl transition-transform"
                        style={{
                            width: A4_WIDTH,
                            height: A4_HEIGHT,
                            transform: `scale(${zoom})`,
                            transformOrigin: 'center center'
                        }}
                    >
                        {/* COVER PAGE */}
                        {pages[currentPage]?.id === 'cover' && (
                            <div className="h-full flex flex-col">
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

                        {/* CHARACTERS PAGE */}
                        {pages[currentPage]?.id === 'characters' && (
                            <div className="h-full p-12 overflow-auto">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-purple-500">
                                    <Users className="h-6 w-6 text-purple-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Character Profiles</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {characters.slice(0, 4).map(char => (
                                        <div key={char.id} className="border border-slate-200 rounded-lg p-4">
                                            <div className="flex gap-4">
                                                <div className="w-20 h-20 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                    {char.imagePoses?.portrait ? (
                                                        <img src={char.imagePoses.portrait} alt={char.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                            <Users className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-slate-900">{char.name}</h3>
                                                    <p className="text-sm text-purple-600">{char.role}</p>
                                                    {char.archetype && <Badge variant="outline" className="mt-1 text-[10px]">{char.archetype}</Badge>}
                                                </div>
                                            </div>
                                            {char.personality && (
                                                <p className="text-xs text-slate-600 mt-3 line-clamp-3">{char.personality}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {characters.length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No characters defined yet</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STORY PAGE */}
                        {pages[currentPage]?.id === 'story' && (
                            <div className="h-full p-12 overflow-auto">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-500">
                                    <Film className="h-6 w-6 text-blue-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Story Structure</h2>
                                </div>

                                <div className="mb-6">
                                    <Badge className="bg-blue-100 text-blue-700 border-0 mb-2">{story.structure || 'Save the Cat'}</Badge>
                                    <h3 className="text-lg font-medium text-slate-900 mb-2">Premise</h3>
                                    <p className="text-slate-700">{story.premise || 'No premise defined.'}</p>
                                </div>

                                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-4">Story Beats</h3>
                                <div className="space-y-3">
                                    {beats && Object.entries(beats).slice(0, 8).map(([key, value], index) => (
                                        <div key={key} className="flex gap-3 text-sm">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <span className="font-medium text-slate-900 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>
                                                <span className="text-slate-600">{value || 'Not defined'}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* WORLD PAGE */}
                        {pages[currentPage]?.id === 'world' && (
                            <div className="h-full p-12 overflow-auto">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-emerald-500">
                                    <Globe className="h-6 w-6 text-emerald-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">World Building</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Universe Name</h3>
                                            <p className="text-slate-700">{universe.name || 'Unnamed'}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Era / Period</h3>
                                            <p className="text-slate-700">{universe.era || 'Not specified'}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-2">Description</h3>
                                        <p className="text-sm text-slate-700 leading-relaxed">{universe.description || 'No world description provided.'}</p>
                                    </div>

                                    {/* World Levels */}
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        {['Private', 'Community', 'City', 'Institution', 'Rules', 'Nation', 'Geography', 'Society', 'Politics'].map((level, i) => (
                                            <div key={level} className="p-3 bg-slate-50 rounded-lg">
                                                <span className="font-bold text-emerald-600">{level}</span>
                                                <p className="text-slate-500 mt-1">{universe[level.toLowerCase()] || 'TBD'}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* VISUALS PAGE */}
                        {pages[currentPage]?.id === 'visuals' && (
                            <div className="h-full p-12 overflow-auto">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-pink-500">
                                    <Palette className="h-6 w-6 text-pink-500" />
                                    <h2 className="text-2xl font-bold text-slate-900">Visual Development</h2>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    {Object.entries(moodboardImages).slice(0, 9).map(([key, url]) => (
                                        <div key={key} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                                            <img src={url} alt={key} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>

                                {Object.keys(moodboardImages).length === 0 && (
                                    <div className="text-center py-12 text-slate-400">
                                        <Palette className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                        <p>No visuals generated yet</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
