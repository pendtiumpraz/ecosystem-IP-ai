'use client';

import { useState } from 'react';
import {
    Globe, Home, Users, Building, MapPin, Scale, Flag, Briefcase,
    Mountain, Crown, Loader2, Sparkles, ChevronDown, ChevronUp,
    Layout, Eye, Edit3, Trash2, Image, RefreshCw, Wand2, Zap, X, RotateCcw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { confirm } from '@/lib/sweetalert';

// Universe data structure
export interface UniverseData {
    // Identity (Center)
    universeName: string;
    period: string;
    // Level 1: Private Interior
    roomCave: string;
    houseCastle: string;
    privateInterior: string;
    // Level 2: Family
    familyInnerCircle: string;
    // Level 3: Neighborhood
    neighborhoodEnvironment: string;
    // Level 4: City
    townDistrictCity: string;
    workingOfficeSchool: string;
    // Level 5: Government
    country: string;
    governmentSystem: string;
    // Level 6: Law & Rules
    laborLaw: string;
    rulesOfWork: string;
    // Level 7: Culture
    societyAndSystem: string;
    socioculturalSystem: string;
    // Level 8: World
    environmentLandscape: string;
    sociopoliticEconomy: string;
    kingdomTribeCommunal: string;
}

// Story item for version selector
interface StoryItem {
    id: string;
    name: string;
}

interface UniverseFormulaStudioProps {
    universe: UniverseData;
    // Story version support
    stories?: StoryItem[];
    selectedStoryId?: string;
    onSelectStory?: (storyId: string) => void;
    // Updates
    onUpdate: (updates: Partial<UniverseData>) => void;
    onClear?: () => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
    // Image generation props
    projectId?: string;
    userId?: string;
    universeImages?: Record<string, UniverseFieldImage[]>;
    deletedUniverseImages?: Record<string, UniverseFieldImage[]>;
    onLoadUniverseImages?: () => Promise<void>;
    onGenerateFieldPrompt?: (fieldKey: string, levelNumber: number, fieldLabel: string, description: string, promptReference?: string) => Promise<void>;
    onGenerateFieldImage?: (fieldKey: string, levelNumber: number, prompt: string, description: string) => Promise<void>;
    onSetActiveImage?: (imageId: string) => Promise<void>;
    onDeleteImage?: (imageId: string) => Promise<void>;
    onRestoreImage?: (imageId: string) => Promise<void>;
    isGeneratingImage?: Record<string, boolean>;
    isGeneratingPrompt?: Record<string, boolean>;
    fieldPrompts?: Record<string, string>;
    onUpdateFieldPrompt?: (fieldKey: string, prompt: string) => void;
    promptReferences?: Record<string, string>;
    onUpdatePromptReference?: (fieldKey: string, reference: string) => void;
    // Batch generation
    onGenerateAllPrompts?: () => Promise<void>;
    onGenerateAllImages?: () => Promise<void>;
    isGeneratingAllPrompts?: boolean;
    isGeneratingAllImages?: boolean;
    // Credit costs
    promptCreditCost?: number; // per prompt
    imageCreditCost?: number; // per image
}

// Level configuration - Using ORANGE brand colors
const UNIVERSE_LEVELS = [
    {
        level: 1,
        name: 'Private Interior',
        icon: Home,
        color: 'from-orange-600 to-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        svgColor: '#ea580c', // orange-600
        fields: [
            { key: 'roomCave', label: 'Room / Cave' },
            { key: 'houseCastle', label: 'House / Castle' },
            { key: 'privateInterior', label: 'Private Interior' },
        ],
    },
    {
        level: 2,
        name: 'Family & Home',
        icon: Crown,
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        svgColor: '#f97316', // orange-500
        fields: [
            { key: 'familyInnerCircle', label: 'Family / Inner Circle' },
        ],
    },
    {
        level: 3,
        name: 'Neighborhood',
        icon: MapPin,
        color: 'from-amber-500 to-amber-400',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        svgColor: '#f59e0b', // amber-500
        fields: [
            { key: 'neighborhoodEnvironment', label: 'Neighborhood / Environment' },
        ],
    },
    {
        level: 4,
        name: 'City & Town',
        icon: Building,
        color: 'from-amber-400 to-yellow-500',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-300',
        svgColor: '#fbbf24', // amber-400
        fields: [
            { key: 'townDistrictCity', label: 'Town / District / City' },
            { key: 'workingOfficeSchool', label: 'Working Office / School' },
        ],
    },
    {
        level: 5,
        name: 'Government',
        icon: Flag,
        color: 'from-yellow-500 to-yellow-400',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300',
        svgColor: '#eab308', // yellow-500
        fields: [
            { key: 'country', label: 'Country' },
            { key: 'governmentSystem', label: 'Government System' },
        ],
    },
    {
        level: 6,
        name: 'Law & Rules',
        icon: Scale,
        color: 'from-orange-400 to-orange-500',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        svgColor: '#fb923c', // orange-400
        fields: [
            { key: 'laborLaw', label: 'Labor Law' },
            { key: 'rulesOfWork', label: 'Rules of Work' },
        ],
    },
    {
        level: 7,
        name: 'Society & Culture',
        icon: Users,
        color: 'from-orange-500 to-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        svgColor: '#f97316', // orange-500
        fields: [
            { key: 'societyAndSystem', label: 'Society & System' },
            { key: 'socioculturalSystem', label: 'Sociocultural System' },
        ],
    },
    {
        level: 8,
        name: 'World & Cosmos',
        icon: Mountain,
        color: 'from-orange-600 to-orange-700',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-300',
        svgColor: '#ea580c', // orange-600
        fields: [
            { key: 'environmentLandscape', label: 'Environment / Landscape' },
            { key: 'sociopoliticEconomy', label: 'Sociopolitic & Economy' },
            { key: 'kingdomTribeCommunal', label: 'Kingdom / Tribe / Communal' },
        ],
    },
];

// Universe field image type
export interface UniverseFieldImage {
    id: string;
    projectId: string;
    storyId?: string;
    fieldKey: string;
    levelNumber: number;
    versionNumber: number;
    imageUrl: string;
    thumbnailUrl?: string;
    enhancedPrompt?: string;
    originalDescription?: string;
    style?: string;
    isActive: boolean;
    createdAt: string;
    deletedAt?: string;
    isDeleted?: boolean;
}

type ViewMode = 'cards' | 'radial' | 'grid' | 'visual';

export function UniverseFormulaStudio({
    universe,
    stories = [],
    selectedStoryId,
    onSelectStory,
    onUpdate,
    onClear,
    onGenerate,
    isGenerating,
    // Image generation props
    projectId,
    userId,
    universeImages = {},
    deletedUniverseImages = {},
    onLoadUniverseImages,
    onGenerateFieldPrompt,
    onGenerateFieldImage,
    onSetActiveImage,
    onDeleteImage,
    onRestoreImage,
    isGeneratingImage = {},
    isGeneratingPrompt = {},
    fieldPrompts = {},
    onUpdateFieldPrompt,
    promptReferences = {},
    onUpdatePromptReference,
    // Batch generation
    onGenerateAllPrompts,
    onGenerateAllImages,
    isGeneratingAllPrompts = false,
    isGeneratingAllImages = false,
    // Credit costs
    promptCreditCost = 1,
    imageCreditCost = 12,
}: UniverseFormulaStudioProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('cards');
    const [expandedLevel, setExpandedLevel] = useState<number | null>(null);
    const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

    // Image detail modal state
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedFieldKey, setSelectedFieldKey] = useState<string | null>(null);
    const [showDeletedInModal, setShowDeletedInModal] = useState(false);

    // Calculate completion percentage
    const calculateProgress = () => {
        const allFields = UNIVERSE_LEVELS.flatMap(l => l.fields.map(f => f.key));
        const filledFields = allFields.filter(f => (universe as any)[f]?.trim());
        return Math.round((filledFields.length / allFields.length) * 100);
    };

    const progress = calculateProgress();

    // Get fields that have descriptions (can generate prompts)
    const getFieldsWithDescriptions = () => {
        return UNIVERSE_LEVELS.flatMap(l =>
            l.fields.filter(f => (universe as any)[f.key]?.trim())
                .map(f => ({ ...f, level: l.level }))
        );
    };

    // Get fields that have prompts (can generate images)
    const getFieldsWithPrompts = () => {
        return UNIVERSE_LEVELS.flatMap(l =>
            l.fields.filter(f => fieldPrompts[f.key]?.trim())
                .map(f => ({ ...f, level: l.level }))
        );
    };

    // Fields without prompts yet
    const fieldsNeedingPrompts = getFieldsWithDescriptions().filter(f => !fieldPrompts[f.key]?.trim());
    // Fields without images yet
    const fieldsNeedingImages = getFieldsWithPrompts().filter(f => !universeImages[f.key]?.length);

    // Calculate total credits
    const totalPromptCredits = fieldsNeedingPrompts.length * promptCreditCost;
    const totalImageCredits = fieldsNeedingImages.length * imageCreditCost;

    // Get position for each level segment (counter-clockwise from right going UP)
    // In SVG: Y increases downward, so we use positive angle to go counter-clockwise (up)
    const getSegmentPosition = (levelIndex: number) => {
        // Start at 0° (right/3 o'clock), go counter-clockwise (upward)
        // Each level is 45° apart
        const angle = (levelIndex * 45) * (Math.PI / 180); // Positive = counter-clockwise in SVG
        const radius = 140;
        const centerX = 200;
        const centerY = 200;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY - radius * Math.sin(angle), // Subtract to go up in SVG
        };
    };

    // Get arc path for segment
    const getArcPath = (levelIndex: number) => {
        // Start at 0° (right), counter-clockwise
        // Each segment spans 45° centered on its angle
        const centerAngle = levelIndex * 45;
        const startAngle = centerAngle - 22.5; // Start 22.5° before
        const endAngle = centerAngle + 22.5;   // End 22.5° after
        const innerRadius = 80;
        const outerRadius = 180;
        const centerX = 200;
        const centerY = 200;

        // Convert to radians (SVG Y is inverted, so we negate the sin)
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Inner arc points
        const x1 = centerX + innerRadius * Math.cos(startRad);
        const y1 = centerY - innerRadius * Math.sin(startRad);
        // Outer arc start
        const x2 = centerX + outerRadius * Math.cos(startRad);
        const y2 = centerY - outerRadius * Math.sin(startRad);
        // Outer arc end
        const x3 = centerX + outerRadius * Math.cos(endRad);
        const y3 = centerY - outerRadius * Math.sin(endRad);
        // Inner arc end
        const x4 = centerX + innerRadius * Math.cos(endRad);
        const y4 = centerY - innerRadius * Math.sin(endRad);

        // Draw: start at inner-start, line to outer-start, arc to outer-end, line to inner-end, arc back
        return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 0 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 1 ${x1} ${y1}`;
    };

    // Check if level is filled
    const isLevelFilled = (level: typeof UNIVERSE_LEVELS[0]) => {
        return level.fields.every(f => (universe as any)[f.key]?.trim());
    };

    const getLevelFillCount = (level: typeof UNIVERSE_LEVELS[0]) => {
        const filled = level.fields.filter(f => (universe as any)[f.key]?.trim()).length;
        return `${filled}/${level.fields.length}`;
    };

    return (
        <>
            <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
                {/* Header Toolbar - Responsive */}
                <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200/50 bg-white/80 backdrop-blur">
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Left: Story selector + Title */}
                        {stories.length > 0 && (
                            <div className="flex items-center gap-2 min-w-fit">
                                <div className="p-1.5 bg-orange-100 rounded-md">
                                    <Globe className="h-4 w-4 text-orange-600" />
                                </div>
                                <div className="flex flex-col">
                                    <Label className="text-[10px] text-gray-500 font-bold uppercase hidden sm:block">Story Version</Label>
                                    <Select value={selectedStoryId} onValueChange={onSelectStory}>
                                        <SelectTrigger className="h-7 w-[140px] sm:w-[180px] text-xs border-orange-200 bg-orange-50/50">
                                            <SelectValue placeholder="Select story..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[280px] min-w-[180px]">
                                            {/* Search input - Orange themed */}
                                            {stories.length > 3 && (
                                                <div className="p-2 border-b border-orange-100 bg-orange-50/50 sticky top-0">
                                                    <div className="relative">
                                                        <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                        </svg>
                                                        <input
                                                            type="text"
                                                            placeholder="Search stories..."
                                                            className="w-full text-xs pl-8 pr-3 py-1.5 border border-orange-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 placeholder:text-orange-300"
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => {
                                                                const search = e.target.value.toLowerCase();
                                                                const items = document.querySelectorAll('[data-story-search]');
                                                                items.forEach(item => {
                                                                    const text = item.getAttribute('data-story-search')?.toLowerCase() || '';
                                                                    (item as HTMLElement).style.display = text.includes(search) ? '' : 'none';
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                            {stories.map((s) => (
                                                <SelectItem key={s.id} value={s.id} data-story-search={s.name}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Progress */}
                        <div className="flex items-center gap-2">
                            <div className="w-16 sm:w-20 h-2 bg-orange-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-xs text-orange-600 font-bold">{progress}%</span>
                        </div>

                        {/* Spacer */}
                        <div className="flex-grow" />

                        {/* Right: View mode + Generate */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('cards')}
                                    className={`h-7 px-2 text-xs ${viewMode === 'cards' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                                >
                                    <Layout className="h-3 w-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Cards</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('radial')}
                                    className={`h-7 px-2 text-xs ${viewMode === 'radial' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                                >
                                    <Eye className="h-3 w-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Radial</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('grid')}
                                    className={`h-7 px-2 text-xs ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                                >
                                    <Edit3 className="h-3 w-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Grid</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setViewMode('visual')}
                                    className={`h-7 px-2 text-xs ${viewMode === 'visual' ? 'bg-white shadow-sm text-orange-600' : 'text-gray-500'}`}
                                >
                                    <Image className="h-3 w-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Visual</span>
                                </Button>
                            </div>

                            {/* Clear Universe Button */}
                            {onClear && (
                                <Button
                                    variant="outline"
                                    onClick={onClear}
                                    disabled={isGenerating || calculateProgress() === 0}
                                    className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                >
                                    <Trash2 className="h-3 w-3 sm:mr-1" />
                                    <span className="hidden sm:inline text-xs font-medium">Clear</span>
                                </Button>
                            )}

                            {/* Generate Button */}
                            <Button
                                onClick={onGenerate}
                                disabled={isGenerating}
                                className="h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
                            >
                                {isGenerating ? (
                                    <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
                                ) : (
                                    <Sparkles className="h-4 w-4 sm:mr-2" />
                                )}
                                <span className="hidden sm:inline text-xs font-bold">Generate</span>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto p-2 sm:p-4">
                    {viewMode === 'radial' && (
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            {/* Radial View - Responsive SVG */}
                            <div className="flex-shrink-0 flex justify-center">
                                <svg
                                    viewBox="0 0 400 400"
                                    className="drop-shadow-lg w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[400px] lg:h-[400px]"
                                >
                                    {/* Background circle */}
                                    <circle cx="200" cy="200" r="190" fill="white" stroke="#fed7aa" strokeWidth="2" />

                                    {/* Level segments */}
                                    {UNIVERSE_LEVELS.map((level, i) => {
                                        const filled = isLevelFilled(level);
                                        const isHovered = hoveredLevel === level.level;
                                        const isExpanded = expandedLevel === level.level;

                                        return (
                                            <g key={level.level}>
                                                <path
                                                    d={getArcPath(i)}
                                                    fill={filled ? level.svgColor : isHovered ? '#fff7ed' : '#fffbeb'}
                                                    stroke={isExpanded ? (filled ? '#ffffff' : '#ea580c') : '#fed7aa'}
                                                    strokeWidth={isExpanded ? 3 : 1}
                                                    className="cursor-pointer transition-all duration-200"
                                                    onMouseEnter={() => setHoveredLevel(level.level)}
                                                    onMouseLeave={() => setHoveredLevel(null)}
                                                    onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                                                />
                                            </g>
                                        );
                                    })}

                                    {/* Level labels - white text with orange background circle */}
                                    {UNIVERSE_LEVELS.map((level, i) => {
                                        const pos = getSegmentPosition(i);
                                        const filled = isLevelFilled(level);
                                        // Short labels for radial view
                                        const shortLabels: Record<number, string> = {
                                            1: 'Private',
                                            2: 'Family',
                                            3: 'Neighbor',
                                            4: 'City',
                                            5: 'Govt',
                                            6: 'Law',
                                            7: 'Society',
                                            8: 'World',
                                        };
                                        return (
                                            <g key={`label-${level.level}`}>
                                                {/* Background circle for visibility */}
                                                <circle
                                                    cx={pos.x}
                                                    cy={pos.y}
                                                    r="24"
                                                    fill={filled ? '#f97316' : 'white'}
                                                    stroke={filled ? '#ea580c' : '#e5e7eb'}
                                                    strokeWidth="2"
                                                    className="drop-shadow-sm"
                                                />
                                                <text
                                                    x={pos.x}
                                                    y={pos.y - 3}
                                                    textAnchor="middle"
                                                    className="text-[7px] font-semibold pointer-events-none"
                                                    fill={filled ? 'white' : '#374151'}
                                                >
                                                    {shortLabels[level.level]}
                                                </text>
                                                <text
                                                    x={pos.x}
                                                    y={pos.y + 8}
                                                    textAnchor="middle"
                                                    className="text-[6px] pointer-events-none"
                                                    fill={filled ? 'rgba(255,255,255,0.8)' : '#9ca3af'}
                                                >
                                                    L{level.level}
                                                </text>
                                            </g>
                                        );
                                    })}

                                    {/* Center Identity Circle - Orange themed */}
                                    <circle cx="200" cy="200" r="70" fill="url(#centerGrad)" />
                                    <defs>
                                        <radialGradient id="centerGrad" cx="50%" cy="30%" r="70%">
                                            <stop offset="0%" stopColor="#ffedd5" />
                                            <stop offset="100%" stopColor="#fed7aa" />
                                        </radialGradient>
                                    </defs>

                                    {/* Center text - with truncation for long text */}
                                    <clipPath id="center-clip">
                                        <circle cx="200" cy="200" r="65" />
                                    </clipPath>
                                    <g clipPath="url(#center-clip)">
                                        <text x="200" y="185" textAnchor="middle" className="text-[11px] font-bold" fill="#c2410c">
                                            {(universe.universeName || 'Universe').length > 18
                                                ? (universe.universeName || 'Universe').substring(0, 16) + '...'
                                                : universe.universeName || 'Universe'}
                                        </text>
                                        <text x="200" y="202" textAnchor="middle" className="text-[9px]" fill="#ea580c">
                                            {(universe.period || 'Period').length > 22
                                                ? (universe.period || 'Period').substring(0, 20) + '...'
                                                : universe.period || 'Period'}
                                        </text>
                                        <text x="200" y="218" textAnchor="middle" className="text-[8px] font-medium" fill="#f97316">
                                            IDENTITY
                                        </text>
                                    </g>
                                </svg>
                            </div>

                            {/* Level Detail Panel */}
                            <div className="flex-1 space-y-4">
                                {/* Identity Fields */}
                                <div className="p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                    <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        Universe Identity (Center)
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <Label className="text-xs text-orange-600 font-medium">Universe Name</Label>
                                            <Input
                                                value={universe.universeName || ''}
                                                onChange={(e) => onUpdate({ universeName: e.target.value })}
                                                placeholder="Enter universe name..."
                                                className="mt-1 h-8 text-sm border-orange-200 focus:border-orange-400"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-orange-600 font-medium">Period / Era</Label>
                                            <Input
                                                value={universe.period || ''}
                                                onChange={(e) => onUpdate({ period: e.target.value })}
                                                placeholder="e.g., 2045, Medieval..."
                                                className="mt-1 h-8 text-sm border-orange-200 focus:border-orange-400"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Level */}
                                {expandedLevel !== null && (
                                    <div className={`p-3 sm:p-4 rounded-xl border ${UNIVERSE_LEVELS[expandedLevel - 1].bgColor} ${UNIVERSE_LEVELS[expandedLevel - 1].borderColor}`}>
                                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                            {(() => {
                                                const Icon = UNIVERSE_LEVELS[expandedLevel - 1].icon;
                                                return <Icon className="h-4 w-4" />;
                                            })()}
                                            Level {expandedLevel}: {UNIVERSE_LEVELS[expandedLevel - 1].name}
                                            <Badge variant="outline" className="ml-auto text-[10px]">
                                                {getLevelFillCount(UNIVERSE_LEVELS[expandedLevel - 1])}
                                            </Badge>
                                        </h3>
                                        <div className="space-y-3">
                                            {UNIVERSE_LEVELS[expandedLevel - 1].fields.map((field) => (
                                                <div key={field.key}>
                                                    <Label className="text-xs text-gray-600 font-medium">{field.label}</Label>
                                                    <Textarea
                                                        value={(universe as any)[field.key] || ''}
                                                        onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                                                        placeholder={`Describe ${field.label.toLowerCase()}...`}
                                                        rows={2}
                                                        className="mt-1 text-sm resize-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Level Overview */}
                                {expandedLevel === null && (
                                    <div className="text-center text-gray-400 text-sm py-6 sm:py-8">
                                        Tap on a segment in the radial view to edit that level
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {viewMode === 'cards' && (
                        <div className="space-y-3 max-w-3xl mx-auto">
                            {/* Identity Card */}
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                <h3 className="text-sm font-bold text-orange-700 mb-3 flex items-center gap-2">
                                    <Globe className="h-4 w-4" />
                                    Universe Identity (Center)
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-orange-600 font-medium">Universe Name</Label>
                                        <Input
                                            value={universe.universeName || ''}
                                            onChange={(e) => onUpdate({ universeName: e.target.value })}
                                            placeholder="Enter universe name..."
                                            className="mt-1 h-8 text-sm border-orange-200"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-orange-600 font-medium">Period / Era</Label>
                                        <Input
                                            value={universe.period || ''}
                                            onChange={(e) => onUpdate({ period: e.target.value })}
                                            placeholder="e.g., 2045, Medieval..."
                                            className="mt-1 h-8 text-sm border-orange-200"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Level Cards */}
                            {UNIVERSE_LEVELS.map((level) => {
                                const isExpanded = expandedLevel === level.level;
                                const Icon = level.icon;

                                return (
                                    <div
                                        key={level.level}
                                        className={`rounded-xl border transition-all duration-200 ${level.bgColor} ${level.borderColor}`}
                                    >
                                        <button
                                            onClick={() => setExpandedLevel(isExpanded ? null : level.level)}
                                            className="w-full p-3 flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-gradient-to-r ${level.color} text-white`}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="text-sm font-bold text-gray-700">Level {level.level}: {level.name}</div>
                                                    <div className="text-xs text-gray-500">{level.fields.length} fields</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[10px]">
                                                    {getLevelFillCount(level)}
                                                </Badge>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="px-4 pb-4 space-y-3">
                                                {level.fields.map((field) => (
                                                    <div key={field.key}>
                                                        <Label className="text-xs text-gray-600 font-medium">{field.label}</Label>
                                                        <Textarea
                                                            value={(universe as any)[field.key] || ''}
                                                            onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                                                            placeholder={`Describe ${field.label.toLowerCase()}...`}
                                                            rows={2}
                                                            className="mt-1 text-sm resize-none bg-white"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {viewMode === 'grid' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
                            {/* Identity */}
                            <div className="lg:col-span-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                                <h3 className="text-sm font-bold text-orange-700 mb-3">Universe Identity</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs text-orange-600 font-medium">Universe Name</Label>
                                        <Input
                                            value={universe.universeName || ''}
                                            onChange={(e) => onUpdate({ universeName: e.target.value })}
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-orange-600 font-medium">Period</Label>
                                        <Input
                                            value={universe.period || ''}
                                            onChange={(e) => onUpdate({ period: e.target.value })}
                                            className="mt-1 h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* All fields in grid */}
                            {UNIVERSE_LEVELS.flatMap((level) =>
                                level.fields.map((field) => (
                                    <div key={field.key} className={`p-3 rounded-lg ${level.bgColor} border ${level.borderColor}`}>
                                        <Label className="text-xs text-gray-600 font-medium flex items-center gap-1">
                                            <span className="text-[10px] text-gray-400">L{level.level}</span>
                                            {field.label}
                                        </Label>
                                        <Textarea
                                            value={(universe as any)[field.key] || ''}
                                            onChange={(e) => onUpdate({ [field.key]: e.target.value })}
                                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                                            rows={2}
                                            className="mt-1 text-xs resize-none bg-white"
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Visual View - Image Generation per Field */}
                    {viewMode === 'visual' && (
                        <div className="space-y-6">
                            {/* Header with batch generate options */}
                            <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-orange-200">
                                <div className="flex items-center gap-2">
                                    <Image className="h-5 w-5 text-orange-600" />
                                    <h3 className="font-semibold text-gray-800">Visual Universe</h3>
                                    <Badge variant="outline" className="text-xs">
                                        {Object.keys(universeImages).length} fields with images
                                    </Badge>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {/* Generate All Prompts Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={fieldsNeedingPrompts.length === 0 || isGeneratingAllPrompts}
                                        onClick={async () => {
                                            const confirmed = await confirm({
                                                title: 'Generate All Prompts',
                                                text: `Generate prompts for ${fieldsNeedingPrompts.length} fields?\n\nEstimated cost: ${totalPromptCredits} credits`,
                                                icon: 'question',
                                                confirmButtonText: `Generate (${totalPromptCredits} credits)`,
                                            });
                                            if (confirmed) {
                                                onGenerateAllPrompts?.();
                                            }
                                        }}
                                        className="text-xs"
                                    >
                                        {isGeneratingAllPrompts ? (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                            <Wand2 className="h-3 w-3 mr-1" />
                                        )}
                                        All Prompts ({fieldsNeedingPrompts.length})
                                    </Button>

                                    {/* Generate All Images Button */}
                                    <Button
                                        size="sm"
                                        disabled={fieldsNeedingImages.length === 0 || isGeneratingAllImages}
                                        onClick={async () => {
                                            const confirmed = await confirm({
                                                title: 'Generate All Images',
                                                text: `Generate images for ${fieldsNeedingImages.length} fields?\n\nEstimated cost: ${totalImageCredits} credits`,
                                                icon: 'question',
                                                confirmButtonText: `Generate (${totalImageCredits} credits)`,
                                            });
                                            if (confirmed) {
                                                onGenerateAllImages?.();
                                            }
                                        }}
                                        className="text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                                    >
                                        {isGeneratingAllImages ? (
                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                        ) : (
                                            <Zap className="h-3 w-3 mr-1" />
                                        )}
                                        All Images ({fieldsNeedingImages.length})
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onLoadUniverseImages}
                                        className="text-xs"
                                    >
                                        <RefreshCw className="h-3 w-3 mr-1" />
                                        Refresh
                                    </Button>
                                </div>
                            </div>

                            {/* Levels */}
                            {UNIVERSE_LEVELS.map((level) => {
                                const levelFields = level.fields.filter(f => (universe as any)[f.key]?.trim());
                                const hasImages = level.fields.some(f => universeImages[f.key]?.length > 0);

                                return (
                                    <div key={level.level} className={`rounded-xl ${level.bgColor} border ${level.borderColor} overflow-hidden`}>
                                        {/* Level Header */}
                                        <div
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/30 transition-colors"
                                            onClick={() => setExpandedLevel(expandedLevel === level.level ? null : level.level)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full ${level.color} flex items-center justify-center text-white font-bold text-sm`}>
                                                    {level.level}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-800">{level.name}</h4>
                                                    <p className="text-xs text-gray-500">
                                                        {levelFields.length} of {level.fields.length} fields filled
                                                        {hasImages && <span className="text-orange-500 ml-2">• Has images</span>}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {expandedLevel === level.level ? (
                                                    <ChevronUp className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4 text-gray-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Fields */}
                                        {expandedLevel === level.level && (
                                            <div className="px-4 pb-4 space-y-4">
                                                {level.fields.map((field) => {
                                                    const description = (universe as any)[field.key] || '';
                                                    const fieldImages = universeImages[field.key] || [];
                                                    const deletedImages = deletedUniverseImages[field.key] || [];
                                                    const activeImage = fieldImages.find(img => img.isActive) || fieldImages[0];
                                                    const isGeneratingImg = isGeneratingImage[field.key] || false;
                                                    const isGeneratingPmt = isGeneratingPrompt[field.key] || false;
                                                    const enhancedPrompt = fieldPrompts[field.key] || '';
                                                    const promptReference = promptReferences[field.key] || '';

                                                    return (
                                                        <div key={field.key} className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                                                            <div className="flex gap-4">
                                                                {/* Image Preview - Clickable */}
                                                                <div
                                                                    className={`w-40 h-28 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden relative ${activeImage ? 'cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all' : ''}`}
                                                                    onClick={() => {
                                                                        if (activeImage || fieldImages.length > 0 || deletedImages.length > 0) {
                                                                            setSelectedFieldKey(field.key);
                                                                            setImageModalOpen(true);
                                                                            setShowDeletedInModal(false);
                                                                        }
                                                                    }}
                                                                >
                                                                    {activeImage ? (
                                                                        <>
                                                                            <img
                                                                                src={activeImage.imageUrl}
                                                                                alt={field.label}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            {/* Version badge */}
                                                                            <div className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                                                v{activeImage.versionNumber}
                                                                            </div>
                                                                            {/* Click hint overlay */}
                                                                            <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                                <Eye className="h-6 w-6 text-white" />
                                                                            </div>
                                                                            {/* Total versions indicator */}
                                                                            {fieldImages.length > 1 && (
                                                                                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                                                                                    {fieldImages.length} ver
                                                                                </div>
                                                                            )}
                                                                        </>
                                                                    ) : isGeneratingImg ? (
                                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                                                                            <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                                                                            <span className="text-[10px] text-gray-500">Generating...</span>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-gray-400">
                                                                            <Image className="h-6 w-6" />
                                                                            <span className="text-[10px]">No image</span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Field Info */}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between gap-2 mb-2">
                                                                        <div>
                                                                            <h5 className="font-medium text-gray-800 text-sm">{field.label}</h5>
                                                                            <p className="text-xs text-gray-500 line-clamp-2">{description || 'No description'}</p>
                                                                        </div>
                                                                        <div className="flex gap-1 flex-shrink-0">
                                                                            {/* Generate Prompt Button */}
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                className="h-7 text-xs"
                                                                                disabled={!description || isGeneratingPmt || isGeneratingImg}
                                                                                onClick={async () => {
                                                                                    const confirmed = await confirm({
                                                                                        title: 'Generate Prompt',
                                                                                        text: `Generate enhanced prompt for "${field.label}"?\n\nCost: ${promptCreditCost} credit(s)`,
                                                                                        icon: 'question',
                                                                                        confirmButtonText: `Generate (${promptCreditCost} credit)`,
                                                                                    });
                                                                                    if (confirmed) {
                                                                                        onGenerateFieldPrompt?.(field.key, level.level, field.label, description, promptReference);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {isGeneratingPmt ? (
                                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    <Wand2 className="h-3 w-3" />
                                                                                )}
                                                                                <span className="hidden sm:inline ml-1">Prompt</span>
                                                                            </Button>
                                                                            {/* Generate Image Button - disabled if no prompt */}
                                                                            <Button
                                                                                size="sm"
                                                                                className="h-7 text-xs bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                                                                                disabled={!enhancedPrompt || isGeneratingImg}
                                                                                title={!enhancedPrompt ? 'Generate prompt first' : ''}
                                                                                onClick={async () => {
                                                                                    const confirmed = await confirm({
                                                                                        title: 'Generate Image',
                                                                                        text: `Generate image for "${field.label}"?\n\nCost: ${imageCreditCost} credits`,
                                                                                        icon: 'question',
                                                                                        confirmButtonText: `Generate (${imageCreditCost} credits)`,
                                                                                    });
                                                                                    if (confirmed) {
                                                                                        onGenerateFieldImage?.(field.key, level.level, enhancedPrompt, description);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {isGeneratingImg ? (
                                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    <Sparkles className="h-3 w-3" />
                                                                                )}
                                                                                <span className="hidden sm:inline ml-1">Generate</span>
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Prompt Reference Input */}
                                                                    <div className="mt-2">
                                                                        <label className="text-[10px] text-gray-500 block mb-1">
                                                                            Prompt Reference (opsional, panduan untuk AI):
                                                                        </label>
                                                                        <input
                                                                            type="text"
                                                                            value={promptReference}
                                                                            onChange={(e) => onUpdatePromptReference?.(field.key, e.target.value)}
                                                                            placeholder="Contoh: gaya Ghibli, warna hangat, suasana pagi..."
                                                                            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                                                                        />
                                                                    </div>

                                                                    {/* Editable Prompt */}
                                                                    <div className="mt-2">
                                                                        <label className="text-[10px] text-gray-500 block mb-1">
                                                                            Image Prompt (edit setelah generate atau ketik manual):
                                                                        </label>
                                                                        <textarea
                                                                            value={enhancedPrompt}
                                                                            onChange={(e) => onUpdateFieldPrompt?.(field.key, e.target.value)}
                                                                            placeholder="Prompt akan muncul di sini setelah Generate Prompt, atau ketik manual..."
                                                                            rows={2}
                                                                            className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded focus:border-orange-300 focus:ring-1 focus:ring-orange-200 resize-none"
                                                                        />
                                                                    </div>

                                                                    {/* Deleted versions */}
                                                                    {deletedImages.length > 0 && (
                                                                        <div className="mt-2 text-[10px] text-gray-400">
                                                                            {deletedImages.length} deleted version(s) -
                                                                            <button
                                                                                className="text-orange-500 hover:underline ml-1"
                                                                                onClick={() => onRestoreImage?.(deletedImages[0].id)}
                                                                            >
                                                                                restore latest
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Detail Modal */}
            <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                    <DialogTitle className="sr-only">Image Details</DialogTitle>
                    {selectedFieldKey && (() => {
                        const fieldImages = universeImages[selectedFieldKey] || [];
                        const deletedImages = deletedUniverseImages[selectedFieldKey] || [];
                        const activeImage = fieldImages.find(img => img.isActive) || fieldImages[0];
                        const fieldLabel = UNIVERSE_LEVELS.flatMap(l => l.fields).find(f => f.key === selectedFieldKey)?.label || selectedFieldKey;
                        const allImages = showDeletedInModal ? deletedImages : fieldImages;
                        const currentIndex = allImages.findIndex(img => img.id === (activeImage?.id));

                        return (
                            <div className="flex flex-col h-full">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-orange-50 to-amber-50">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">{fieldLabel}</h3>
                                        <p className="text-xs text-gray-500">
                                            {showDeletedInModal
                                                ? `${deletedImages.length} deleted version(s)`
                                                : `${fieldImages.length} version(s)`
                                            }
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Toggle Deleted */}
                                        {deletedImages.length > 0 && (
                                            <Button
                                                variant={showDeletedInModal ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setShowDeletedInModal(!showDeletedInModal)}
                                                className="text-xs"
                                            >
                                                <Trash2 className="h-3 w-3 mr-1" />
                                                Deleted ({deletedImages.length})
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setImageModalOpen(false)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Image Display */}
                                <div className="flex-1 relative bg-gray-900 flex items-center justify-center min-h-[400px]">
                                    {activeImage && !showDeletedInModal ? (
                                        <>
                                            <img
                                                src={activeImage.imageUrl}
                                                alt={fieldLabel}
                                                className="max-w-full max-h-[60vh] object-contain"
                                            />
                                            {/* Navigation arrows */}
                                            {fieldImages.length > 1 && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                        onClick={() => {
                                                            const idx = fieldImages.findIndex(img => img.id === activeImage.id);
                                                            const prevImg = fieldImages[(idx - 1 + fieldImages.length) % fieldImages.length];
                                                            onSetActiveImage?.(prevImg.id);
                                                        }}
                                                    >
                                                        <ChevronLeft className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                                                        onClick={() => {
                                                            const idx = fieldImages.findIndex(img => img.id === activeImage.id);
                                                            const nextImg = fieldImages[(idx + 1) % fieldImages.length];
                                                            onSetActiveImage?.(nextImg.id);
                                                        }}
                                                    >
                                                        <ChevronRight className="h-5 w-5" />
                                                    </Button>
                                                </>
                                            )}
                                        </>
                                    ) : showDeletedInModal && deletedImages.length > 0 ? (
                                        <img
                                            src={deletedImages[0].imageUrl}
                                            alt={`Deleted - ${fieldLabel}`}
                                            className="max-w-full max-h-[60vh] object-contain opacity-70"
                                        />
                                    ) : (
                                        <div className="text-gray-500 text-center">
                                            <Image className="h-16 w-16 mx-auto mb-2 opacity-30" />
                                            <p>No images available</p>
                                        </div>
                                    )}
                                </div>

                                {/* Version Thumbnails */}
                                {allImages.length > 0 && (
                                    <div className="px-6 py-4 border-t bg-gray-50">
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {allImages.map((img, idx) => (
                                                <div
                                                    key={img.id}
                                                    className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${(!showDeletedInModal && img.id === activeImage?.id)
                                                        ? 'border-orange-500 ring-2 ring-orange-300'
                                                        : 'border-gray-200 hover:border-orange-300'
                                                        } ${showDeletedInModal ? 'opacity-70' : ''}`}
                                                    onClick={() => {
                                                        if (!showDeletedInModal) {
                                                            onSetActiveImage?.(img.id);
                                                        }
                                                    }}
                                                >
                                                    <img
                                                        src={img.imageUrl}
                                                        alt={`Version ${img.versionNumber}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 text-center">
                                                        v{img.versionNumber}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Actions Footer */}
                                <div className="px-6 py-4 border-t flex items-center justify-between gap-4 bg-white">
                                    <div className="text-xs text-gray-500">
                                        {activeImage && !showDeletedInModal && (
                                            <>
                                                Version {activeImage.versionNumber} • Created {new Date(activeImage.createdAt).toLocaleDateString()}
                                            </>
                                        )}
                                        {showDeletedInModal && deletedImages.length > 0 && (
                                            <>Viewing deleted images</>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {showDeletedInModal && deletedImages.length > 0 ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={async () => {
                                                        const confirmed = await confirm({
                                                            title: 'Restore Image',
                                                            text: `Restore version ${deletedImages[0].versionNumber}?`,
                                                            icon: 'question',
                                                            confirmButtonText: 'Restore',
                                                        });
                                                        if (confirmed) {
                                                            await onRestoreImage?.(deletedImages[0].id);
                                                            setShowDeletedInModal(false);
                                                        }
                                                    }}
                                                >
                                                    <RotateCcw className="h-3 w-3 mr-1" />
                                                    Restore
                                                </Button>
                                            </>
                                        ) : activeImage ? (
                                            <>
                                                {fieldImages.length > 1 && (
                                                    <Select
                                                        value={activeImage.id}
                                                        onValueChange={(value) => onSetActiveImage?.(value)}
                                                    >
                                                        <SelectTrigger className="w-32 h-8 text-xs">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {fieldImages.map(img => (
                                                                <SelectItem key={img.id} value={img.id}>
                                                                    Version {img.versionNumber}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={async () => {
                                                        const confirmed = await confirm({
                                                            title: 'Delete Image',
                                                            text: `Delete version ${activeImage.versionNumber}? You can restore it later.`,
                                                            icon: 'warning',
                                                            confirmButtonText: 'Delete',
                                                        });
                                                        if (confirmed) {
                                                            await onDeleteImage?.(activeImage.id);
                                                            if (fieldImages.length <= 1) {
                                                                setImageModalOpen(false);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-1" />
                                                    Delete
                                                </Button>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </DialogContent>
            </Dialog>
        </>
    );
}
