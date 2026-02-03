'use client';

import { useState, useEffect } from 'react';
import {
    Briefcase, Calendar, Globe, Building2, UserCircle,
    Palette, Image as ImageIcon, Plus, Trash2, Eye,
    Film, Clock, Hash, Clapperboard, BookOpen, Sparkles, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MEDIUM_TYPE_OPTIONS,
    DURATION_OPTIONS,
    GENRE_OPTIONS,
    SUB_GENRE_OPTIONS,
    THEME_OPTIONS,
    TONE_OPTIONS,
    CORE_CONFLICT_OPTIONS,
    IP_STORY_STRUCTURE_OPTIONS,
} from '@/lib/studio-options';

interface ProjectData {
    title: string;
    studioName: string;
    description: string;
    ipOwner: string;
    productionDate: string;
    brandColors: string[];
    brandLogos: string[];
    // New fields for Format & Duration
    mediumType?: string;
    duration?: string;
    customDuration?: number;
    targetScenes?: number;
    episodeCount?: number; // 1-13, locked after initial creation
    // New fields for Genre & Structure
    mainGenre?: string;
    subGenre?: string;
    theme?: string;
    tone?: string;
    coreConflict?: string;
    storyStructure?: string;
    // Protagonist (required for story generation)
    protagonistName?: string;
    [key: string]: any;
}

interface Character {
    id: string;
    name: string;
    role?: string;
}

interface StoryVersion {
    id: string;
    versionNumber: number;
    structure?: string;
    isActive?: boolean;
}

interface IPPassportProps {
    project: ProjectData;
    onUpdate: (updates: Partial<ProjectData>) => void;
    isSaving?: boolean;
    characters?: Character[];
    storyVersions?: StoryVersion[];
}

export function IPPassport({ project, onUpdate, isSaving, characters = [], storyVersions = [] }: IPPassportProps) {
    // Normalize structure value from DB (maps labels to values)
    const normalizeStructure = (structure?: string): string => {
        if (!structure) return '';
        // Already normalized
        if (['hero-journey', 'save-the-cat', 'dan-harmon', 'three-act', 'freytag', 'custom'].includes(structure)) {
            return structure;
        }
        // Map common DB labels to values
        const lowerStructure = structure.toLowerCase();
        if (lowerStructure.includes('hero') || lowerStructure.includes('journey')) return 'hero-journey';
        if (lowerStructure.includes('cat')) return 'save-the-cat';
        if (lowerStructure.includes('harmon') || lowerStructure.includes('circle')) return 'dan-harmon';
        if (lowerStructure.includes('three') || lowerStructure.includes('3-act')) return 'three-act';
        if (lowerStructure.includes('freytag') || lowerStructure.includes('pyramid')) return 'freytag';
        return structure; // Return as-is if no match
    };

    // Get normalized structure from active story version (or first if none active)
    const activeVersion = storyVersions.find(v => v.isActive) || storyVersions[0] || null;
    const activeVersionStructure = activeVersion ? normalizeStructure(activeVersion.structure) : '';

    // Get existing protagonist from characters list (case-insensitive)
    const existingProtagonist = characters.find(c =>
        c.role?.toLowerCase() === 'protagonist'
    );

    // If there's an existing protagonist and protagonistName is not set, use that name
    const displayProtagonistName = project.protagonistName || existingProtagonist?.name || '';

    const handleColorChange = (index: number, value: string) => {
        const newColors = [...(project.brandColors || [])];
        newColors[index] = value;
        onUpdate({ brandColors: newColors });
    };

    const addColor = () => {
        onUpdate({
            brandColors: [...(project.brandColors || []), '#ffffff']
        });
    };

    const removeColor = (index: number) => {
        const newColors = [...(project.brandColors || [])];
        newColors.splice(index, 1);
        onUpdate({ brandColors: newColors });
    };

    // Get sub-genre options based on selected main genre
    const availableSubGenres = project.mainGenre ? (SUB_GENRE_OPTIONS[project.mainGenre] || []) : [];

    // Handle medium type change - auto-set duration and scenes
    const handleMediumTypeChange = (value: string) => {
        const selectedMedium = MEDIUM_TYPE_OPTIONS.find(m => m.value === value);
        onUpdate({
            mediumType: value,
            duration: String(selectedMedium?.defaultDuration || 90),
            targetScenes: selectedMedium?.defaultScenes || 45,
        });
    };

    // Handle duration change - auto-calculate scenes (1 scene per 2 minutes approx)
    const handleDurationChange = (value: string) => {
        if (value === 'custom') {
            onUpdate({ duration: value });
        } else {
            const selectedDuration = DURATION_OPTIONS.find(d => d.value === value);
            onUpdate({
                duration: value,
                targetScenes: selectedDuration?.scenes || Math.ceil(parseInt(value) / 2),
            });
        }
    };

    // Check if story setup is locked (episode count has been set)
    const isStorySetupLocked = !!project.episodeCount && project.episodeCount > 0;

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 p-2">

            {/* LEFT: THE VISUAL PASSPORT (Preview Card) */}
            <div className="lg:w-1/3 flex flex-col gap-6">
                <div className="sticky top-6">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 px-2 tracking-widest uppercase flex items-center gap-2">
                        <Eye className="h-4 w-4" /> Live Preview
                    </h3>

                    {/* The Glass Card / Passport */}
                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden glass-panel border-2 border-white/20 shadow-2xl transition-all duration-500 hover:scale-[1.02] group">
                        {/* Dynamic Background based on Brand Colors */}
                        <div
                            className="absolute inset-0 opacity-30 transition-colors duration-700"
                            style={{
                                background: `linear-gradient(135deg, ${project.brandColors?.[0] || '#6366f1'}, ${project.brandColors?.[1] || '#a855f7'})`
                            }}
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex flex-col justify-end">

                            {/* Studio Badge */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                <Badge variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white px-3 py-1">
                                    {project.studioName || 'STUDIO NAME'}
                                </Badge>
                                <div className="h-12 w-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center backdrop-blur-md">
                                    <Globe className="h-6 w-6 text-white/50" />
                                </div>
                            </div>

                            {/* Title & Desc */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-emerald-400 font-bold tracking-widest uppercase mb-1">
                                        IP PROJECT
                                    </p>
                                    <h1 className="text-4xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                                        {project.title || 'Untitled Project'}
                                    </h1>
                                </div>

                                <p className="text-sm text-slate-300 line-clamp-3 font-light leading-relaxed">
                                    {project.description || 'Add a description to see it appear here...'}
                                </p>

                                {/* Quick Info Badges */}
                                <div className="flex flex-wrap gap-2">
                                    {project.mainGenre && (
                                        <Badge className="bg-indigo-500/30 text-indigo-200 border-indigo-400/30">
                                            {GENRE_OPTIONS.find(g => g.value === project.mainGenre)?.label || project.mainGenre}
                                        </Badge>
                                    )}
                                    {project.mediumType && (
                                        <Badge className="bg-orange-500/30 text-orange-200 border-orange-400/30">
                                            {MEDIUM_TYPE_OPTIONS.find(m => m.value === project.mediumType)?.label || project.mediumType}
                                        </Badge>
                                    )}
                                    {project.duration && project.duration !== 'custom' && (
                                        <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/30">
                                            {project.duration} min
                                        </Badge>
                                    )}
                                </div>

                                {/* Footer Metadata */}
                                <div className="pt-4 border-t border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Creator/Owner</p>
                                        <p className="text-xs text-white font-medium truncate">{project.ipOwner || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Production</p>
                                        <p className="text-xs text-white font-medium truncate">{project.productionDate || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-6 grid grid-cols-3 gap-3">
                        <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-bold text-slate-700">{project.targetScenes || 0}</span>
                            <span className="text-[9px] uppercase text-slate-400 font-bold">Target Scenes</span>
                        </div>
                        <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-bold text-slate-700">{project.duration || 0}</span>
                            <span className="text-[9px] uppercase text-slate-400 font-bold">Minutes</span>
                        </div>
                        <div className="glass-panel p-3 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-lg font-bold text-slate-700">{project.brandColors?.length || 0}</span>
                            <span className="text-[9px] uppercase text-slate-400 font-bold">Colors</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT: THE CONTROL FORM */}
            <div className="flex-1 space-y-8 pb-12">

                {/* Section 1: Core Identity */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Core Identity</h2>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Project Title</Label>
                                <Input
                                    value={project.title || ''}
                                    onChange={(e) => onUpdate({ title: e.target.value })}
                                    className="font-bold text-lg bg-white/50 border-slate-200 focus:border-indigo-500 transition-all font-display"
                                    placeholder="e.g. The Last Cyberpunk"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Studio Name</Label>
                                <Input
                                    value={project.studioName || ''}
                                    onChange={(e) => onUpdate({ studioName: e.target.value })}
                                    className="bg-white/50 border-slate-200 focus:border-indigo-500 transition-all"
                                    placeholder="e.g. Neon Horizon Studios"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500">Logline / Description</Label>
                            <Textarea
                                value={project.description || ''}
                                onChange={(e) => onUpdate({ description: e.target.value })}
                                className="min-h-[120px] bg-white/50 border-slate-200 focus:border-indigo-500 transition-all resize-none leading-relaxed"
                                placeholder="What is this IP about? Describe the core essence..."
                            />
                        </div>
                    </div>
                </section>

                {/* Section 2: Ownership & Ledger */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                            <Building2 className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Ownership & Ledger</h2>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">IP Owner / Creator</Label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        value={project.ipOwner || ''}
                                        onChange={(e) => onUpdate({ ipOwner: e.target.value })}
                                        className="pl-10 bg-white/50 border-slate-200 focus:border-emerald-500 transition-all"
                                        placeholder="Full Name / Company"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Production Date</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="date"
                                        value={project.productionDate || ''}
                                        onChange={(e) => onUpdate({ productionDate: e.target.value })}
                                        className="pl-10 bg-white/50 border-slate-200 focus:border-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Format & Duration */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                            <Film className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Format & Duration</h2>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Type of Medium */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Type of Medium</Label>
                                <Select
                                    value={project.mediumType || ''}
                                    onValueChange={handleMediumTypeChange}
                                >
                                    <SelectTrigger className="bg-white/50 border-slate-200">
                                        <Clapperboard className="h-4 w-4 mr-2 text-slate-400" />
                                        <SelectValue placeholder="Select medium type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MEDIUM_TYPE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Duration</Label>
                                <Select
                                    value={project.duration || ''}
                                    onValueChange={handleDurationChange}
                                >
                                    <SelectTrigger className="bg-white/50 border-slate-200">
                                        <Clock className="h-4 w-4 mr-2 text-slate-400" />
                                        <SelectValue placeholder="Select duration..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {DURATION_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Custom Duration (only if custom selected) */}
                            {project.duration === 'custom' && (
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500">Custom Duration (minutes)</Label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={300}
                                        value={project.customDuration || ''}
                                        onChange={(e) => onUpdate({
                                            customDuration: parseInt(e.target.value) || 0,
                                            targetScenes: Math.ceil((parseInt(e.target.value) || 0) / 2)
                                        })}
                                        className="bg-white/50 border-slate-200"
                                        placeholder="Enter duration in minutes"
                                    />
                                </div>
                            )}

                            {/* Target Number of Scenes */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Target Number of Scenes</Label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="number"
                                        min={1}
                                        max={200}
                                        value={project.targetScenes || ''}
                                        onChange={(e) => onUpdate({ targetScenes: parseInt(e.target.value) || 0 })}
                                        className="pl-10 bg-white/50 border-slate-200"
                                        placeholder="e.g. 45"
                                    />
                                </div>
                                <p className="text-[10px] text-slate-400">Standard: ~1 scene per 2 minutes of runtime</p>
                            </div>

                            {/* Protagonist Name - Required for story generation */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500">Protagonist Name</Label>
                                    {displayProtagonistName && (
                                        <Badge variant="outline" className={`text-[10px] ${isStorySetupLocked || displayProtagonistName
                                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                                            : 'bg-green-50 text-green-600 border-green-200'
                                            }`}>
                                            {existingProtagonist ? (
                                                <><Lock className="h-2.5 w-2.5 mr-1" /> From Character</>
                                            ) : (
                                                <><Lock className="h-2.5 w-2.5 mr-1" /> Set</>
                                            )}
                                        </Badge>
                                    )}
                                </div>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                                    <Input
                                        value={displayProtagonistName}
                                        onChange={(e) => onUpdate({ protagonistName: e.target.value })}
                                        className={`pl-10 bg-white/50 border-slate-200 focus:border-orange-500 transition-all ${displayProtagonistName ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                                        placeholder="e.g. John Doe, Andi Pratama..."
                                        disabled={!!displayProtagonistName}
                                        readOnly={!!displayProtagonistName}
                                    />
                                </div>
                                {!displayProtagonistName && (
                                    <p className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-1">
                                        ⚠️ Required before setting episode count. You can also create a Protagonist in Character Formula first.
                                    </p>
                                )}
                                {displayProtagonistName && existingProtagonist && (
                                    <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg flex items-center gap-1">
                                        ℹ️ Auto-filled from Protagonist character. Edit in Character Formula to change.
                                    </p>
                                )}
                                {displayProtagonistName && !existingProtagonist && (
                                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                                        <Lock className="h-3 w-3" />
                                        Locked once set. Create new project to use different protagonist.
                                    </p>
                                )}
                            </div>

                            {/* Episode Count (1-13) - LOCKED after initial creation */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs uppercase font-bold text-slate-500">Episode Count</Label>
                                    {project.episodeCount && project.episodeCount > 0 && (
                                        <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                                            <Lock className="h-2.5 w-2.5 mr-1" />
                                            Locked
                                        </Badge>
                                    )}
                                </div>
                                {(() => {
                                    // Check all required fields
                                    // Story structure can come from project OR active story version
                                    const hasStoryStructure = !!project.storyStructure || !!activeVersionStructure;

                                    const missingFields = [];
                                    if (!hasStoryStructure) missingFields.push("Story Structure");
                                    if (!displayProtagonistName) missingFields.push("Protagonist Name");
                                    if (!project.mainGenre) missingFields.push("Main Genre");
                                    if (!project.theme) missingFields.push("Theme");
                                    if (!project.tone) missingFields.push("Tone");
                                    if (!project.coreConflict) missingFields.push("Core Conflict");

                                    const isDisabled = (!!project.episodeCount && project.episodeCount > 0) || missingFields.length > 0;

                                    return (
                                        <>
                                            <Select
                                                value={project.episodeCount?.toString() || ''}
                                                onValueChange={(value) => onUpdate({ episodeCount: parseInt(value), protagonistName: displayProtagonistName })}
                                                disabled={isDisabled}
                                            >
                                                <SelectTrigger className={`bg-white/50 border-slate-200 ${project.episodeCount ? 'opacity-75' : ''}`}>
                                                    <Film className="h-4 w-4 mr-2 text-slate-400" />
                                                    <SelectValue placeholder={
                                                        missingFields.length > 0
                                                            ? `Set ${missingFields[0]} first...`
                                                            : "Select number of episodes..."
                                                    } />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from({ length: 13 }, (_, i) => i + 1).map(num => (
                                                        <SelectItem key={num} value={num.toString()}>
                                                            {num} Episode{num > 1 ? 's' : ''}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {!project.episodeCount && missingFields.length > 0 && (
                                                <p className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-1">
                                                    ⚠️ Fill these first: {missingFields.join(", ")}
                                                </p>
                                            )}
                                            {!project.episodeCount && missingFields.length === 0 && (
                                                <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                                                    <Lock className="h-3 w-3" />
                                                    Episode count cannot be changed after selection. This will create story versions with protagonist character linked.
                                                </p>
                                            )}
                                        </>
                                    );
                                })()}
                                {project.episodeCount && project.episodeCount > 0 && (
                                    <p className="text-[10px] text-slate-400">
                                        {project.episodeCount} story version{project.episodeCount > 1 ? 's' : ''} created with {displayProtagonistName || project.protagonistName} as protagonist.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: Genre & Structure */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Genre & Structure</h2>
                        {isStorySetupLocked && (
                            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                                <Lock className="h-2.5 w-2.5 mr-1" />
                                Locked
                            </Badge>
                        )}
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-6">
                        {isStorySetupLocked && (
                            <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                All fields in this section are locked after episode count is set. To change, create a new project.
                            </p>
                        )}

                        {/* Row 1: Main Genre & Sub Genre */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Main Genre</Label>
                                <Select
                                    value={project.mainGenre || ''}
                                    onValueChange={(value) => onUpdate({ mainGenre: value, subGenre: '' })}
                                    disabled={isStorySetupLocked}
                                >
                                    <SelectTrigger className={`bg-white/50 border-slate-200 ${isStorySetupLocked ? 'opacity-75' : ''}`}>
                                        <SelectValue placeholder="Select main genre..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GENRE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Sub Genre <span className="text-slate-400">(Optional)</span></Label>
                                <Select
                                    value={project.subGenre || ''}
                                    onValueChange={(value) => onUpdate({ subGenre: value })}
                                    disabled={isStorySetupLocked || !project.mainGenre || availableSubGenres.length === 0}
                                >
                                    <SelectTrigger className={`bg-white/50 border-slate-200 ${isStorySetupLocked ? 'opacity-75' : ''}`}>
                                        <SelectValue placeholder={availableSubGenres.length > 0 ? "Select sub genre..." : "Select main genre first"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableSubGenres.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 2: Theme & Tone */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Theme</Label>
                                <Select
                                    value={project.theme || ''}
                                    onValueChange={(value) => onUpdate({ theme: value })}
                                    disabled={isStorySetupLocked}
                                >
                                    <SelectTrigger className={`bg-white/50 border-slate-200 ${isStorySetupLocked ? 'opacity-75' : ''}`}>
                                        <SelectValue placeholder="Select theme..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {THEME_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-slate-500">Tone</Label>
                                <Select
                                    value={project.tone || ''}
                                    onValueChange={(value) => onUpdate({ tone: value })}
                                    disabled={isStorySetupLocked}
                                >
                                    <SelectTrigger className={`bg-white/50 border-slate-200 ${isStorySetupLocked ? 'opacity-75' : ''}`}>
                                        <SelectValue placeholder="Select tone..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TONE_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Row 3: Core Conflict */}
                        <div className="space-y-2">
                            <Label className="text-xs uppercase font-bold text-slate-500">Core Conflict</Label>
                            <Select
                                value={project.coreConflict || ''}
                                onValueChange={(value) => onUpdate({ coreConflict: value })}
                                disabled={isStorySetupLocked}
                            >
                                <SelectTrigger className={`bg-white/50 border-slate-200 ${isStorySetupLocked ? 'opacity-75' : ''}`}>
                                    <SelectValue placeholder="Select core conflict type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {CORE_CONFLICT_OPTIONS.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex flex-col">
                                                <span>{option.label}</span>
                                                <span className="text-xs text-slate-400">{option.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Row 4: Story Structure (LOCKED if story versions exist) */}
                        <div className="space-y-2">
                            {(() => {
                                // Check if story versions exist
                                const hasExistingStoryVersions = storyVersions.length > 0;
                                // Use normalized structure from active version
                                const displayStructure = activeVersionStructure || project.storyStructure || '';
                                const isStructureLocked = hasExistingStoryVersions || !!project.storyStructure;

                                return (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Label className="text-xs uppercase font-bold text-slate-500">Story Structure</Label>
                                            {isStructureLocked && (
                                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                                                    <Lock className="h-2.5 w-2.5 mr-1" />
                                                    {hasExistingStoryVersions ? 'From Story Version' : 'Locked'}
                                                </Badge>
                                            )}
                                        </div>
                                        <Select
                                            value={displayStructure}
                                            onValueChange={(value) => onUpdate({ storyStructure: value })}
                                            disabled={isStructureLocked}
                                        >
                                            <SelectTrigger className={`bg-white/50 border-slate-200 ${isStructureLocked ? 'opacity-75' : ''}`}>
                                                <Sparkles className="h-4 w-4 mr-2 text-purple-400" />
                                                <SelectValue placeholder="Select story structure..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {IP_STORY_STRUCTURE_OPTIONS.map(option => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-lg">{option.icon}</span>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">{option.label} ({option.steps === 0 ? 'Custom' : `${option.steps} steps`})</span>
                                                                <span className="text-xs text-slate-400">{option.description}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {hasExistingStoryVersions && (
                                            <p className="text-[10px] text-blue-600 bg-blue-50 p-2 rounded-lg flex items-center gap-1">
                                                ℹ️ {storyVersions.length} story version{storyVersions.length > 1 ? 's' : ''} exist. Structure follows first version.
                                            </p>
                                        )}
                                        {!hasExistingStoryVersions && !project.storyStructure && (
                                            <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg flex items-center gap-1">
                                                <Lock className="h-3 w-3" />
                                                Warning: Story structure cannot be changed after selection. Choose carefully!
                                            </p>
                                        )}
                                        {!hasExistingStoryVersions && project.storyStructure && (
                                            <p className="text-[10px] text-slate-400">
                                                Story structure is locked. To use a different structure, create a new project.
                                            </p>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </section>

                {/* Section 5: Visual Identity System (HIDDEN - commented out for future use) */}
                {/* 
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                            <Palette className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Visual Identity</h2>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-8">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs uppercase font-bold text-slate-500">Primary Palette</Label>
                                <Button variant="ghost" size="sm" onClick={addColor} className="text-xs text-indigo-600 hover:bg-indigo-50">
                                    <Plus className="h-3 w-3 mr-1" /> Add Color
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(project.brandColors || []).map((color, idx) => (
                                    <div key={idx} className="group relative">
                                        <div
                                            className="h-12 w-12 rounded-xl shadow-sm border border-slate-200 cursor-pointer transition-transform hover:scale-110"
                                            style={{ backgroundColor: color }}
                                        >
                                            <input
                                                type="color"
                                                value={color}
                                                onChange={(e) => handleColorChange(idx, e.target.value)}
                                                className="opacity-0 w-full h-full cursor-pointer"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeColor(idx)}
                                            className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="h-3 w-3 text-red-500" />
                                        </button>
                                    </div>
                                ))}
                                {(project.brandColors || []).length === 0 && (
                                    <span className="text-sm text-slate-400 italic">No colors defined. Add one to set the mood.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
                */}

            </div>
        </div>
    );
}
