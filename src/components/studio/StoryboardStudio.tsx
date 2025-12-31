'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Plus,
    Sparkles,
    Mic,
    Music,
    Video,
    Image as ImageIcon,
    Wand2,
    Shirt,
    Eraser,
    Smile,
    User,
    Mountain,
    Palette,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    Edit3,
    Trash2,
    Copy,
    Move,
    Upload,
    RefreshCcw,
    Check,
    AlertCircle,
    Loader2,
    X,
    Settings,
    Download,
    Maximize2,
    GripVertical,
    Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/lib/sweetalert';

// Types
interface Character {
    id: string;
    name: string;
    avatar: string;
    role: string;
    isActive: boolean;
}

interface StoryboardScene {
    id: string;
    order: number;
    name: string;
    description: string;
    prompt: string;
    thumbnailUrl: string;
    videoUrl?: string;
    status: 'draft' | 'generating' | 'completed' | 'failed';
    duration: number;
    voiceoverText?: string;
    hasVoiceover: boolean;
    hasSfx: boolean;
    characters: string[];
}

interface StoryboardStudioProps {
    projectId: string;
    userId: string;
    projectName?: string;
    onSave?: (scenes: StoryboardScene[]) => void;
}

// Tool Button Component
const ToolButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
}> = ({ icon, label, active = false, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 min-w-[60px]
      ${active
                ? 'bg-gradient-to-b from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent'
            }`}
    >
        {icon}
        <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </button>
);

// Scene Thumbnail Component
const SceneThumbnail: React.FC<{
    scene: StoryboardScene;
    isActive: boolean;
    onClick: () => void;
    onDelete: () => void;
}> = ({ scene, isActive, onClick, onDelete }) => (
    <div
        onClick={onClick}
        className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all duration-300
      ${isActive
                ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-gray-900 scale-[1.02]'
                : 'hover:scale-[1.01] hover:ring-1 hover:ring-white/20'
            }`}
    >
        {/* Scene Number Badge */}
        <div className={`absolute top-2 left-2 z-10 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold
      ${scene.status === 'completed'
                ? 'bg-emerald-500 text-white'
                : scene.status === 'generating'
                    ? 'bg-amber-500 text-black'
                    : 'bg-gray-700 text-gray-300'
            }`}
        >
            {scene.order.toString().padStart(2, '0')}
        </div>

        {/* Status Indicator */}
        {scene.status === 'completed' && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
            </div>
        )}
        {scene.status === 'generating' && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                <Loader2 className="w-3 h-3 text-black animate-spin" />
            </div>
        )}
        {scene.status === 'failed' && (
            <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                <AlertCircle className="w-3 h-3 text-white" />
            </div>
        )}

        {/* Thumbnail Image */}
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 relative">
            {scene.thumbnailUrl ? (
                <img
                    src={scene.thumbnailUrl}
                    alt={scene.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-600" />
                </div>
            )}

            {/* Play Overlay on Hover */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white" />
                </div>
            </div>

            {/* Duration Badge */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-white font-medium">
                {Math.floor(scene.duration / 60)}:{(scene.duration % 60).toString().padStart(2, '0')}
            </div>
        </div>

        {/* Delete Button on Hover */}
        <button
            onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }}
            className="absolute bottom-2 left-2 p-1.5 rounded-lg bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
        >
            <Trash2 className="w-3 h-3" />
        </button>
    </div>
);

// Main Component
export function StoryboardStudio({
    projectId,
    userId,
    projectName = 'Untitled Project',
    onSave,
}: StoryboardStudioProps) {
    // States
    const [scenes, setScenes] = useState<StoryboardScene[]>([
        {
            id: '1',
            order: 1,
            name: 'Scene 1',
            description: 'Sinar matahari yang terik itu, menemani Idris bin Salman dalam perjalanannya mengais rezeki yang halal.',
            prompt: '@Idris bin Salim is walking slowly along the riverbank with slumped shoulders and a slightly bowed head, moving with a weary posture.',
            thumbnailUrl: '/api/placeholder/300/169',
            status: 'completed',
            duration: 15,
            hasVoiceover: true,
            hasSfx: true,
            characters: ['idris'],
        },
        {
            id: '2',
            order: 2,
            name: 'Scene 2',
            description: 'Sambil menghafal Al Quran, dia menyusuri sungai di tengah hamparan padang pasir.',
            prompt: '@Idris continues his journey, reciting verses as he walks along the dusty path.',
            thumbnailUrl: '/api/placeholder/300/169',
            status: 'completed',
            duration: 20,
            hasVoiceover: true,
            hasSfx: false,
            characters: ['idris'],
        },
        {
            id: '3',
            order: 3,
            name: 'Scene 3',
            description: 'Di kejauhan, terlihat oasis yang menjanjikan kesegaran.',
            prompt: '@Idris spots an oasis in the distance, his eyes lighting up with hope.',
            thumbnailUrl: '',
            status: 'draft',
            duration: 10,
            hasVoiceover: false,
            hasSfx: false,
            characters: ['idris'],
        },
    ]);

    const [characters, setCharacters] = useState<Character[]>([
        {
            id: 'idris',
            name: 'Idris b...',
            avatar: '/api/placeholder/48/48',
            role: 'Main Character',
            isActive: true,
        },
    ]);

    const [activeSceneId, setActiveSceneId] = useState('1');
    const [activeTool, setActiveTool] = useState('prompt');
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isDynamic, setIsDynamic] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [voiceoverSpeed, setVoiceoverSpeed] = useState(1.0);
    const [voiceoverVoice, setVoiceoverVoice] = useState('Ryan');
    const [currentStep, setCurrentStep] = useState<'content' | 'cast' | 'storyboard' | 'edit'>('storyboard');

    const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];
    const videoRef = useRef<HTMLVideoElement>(null);

    // Tools Configuration
    const tools = [
        { id: 'clothes', icon: <Shirt className="w-5 h-5" />, label: 'Clothes' },
        { id: 'remove', icon: <Eraser className="w-5 h-5" />, label: 'Remove' },
        { id: 'expression', icon: <Smile className="w-5 h-5" />, label: 'Expression' },
        { id: 'figure', icon: <User className="w-5 h-5" />, label: 'Figure' },
        { id: 'scene', icon: <Mountain className="w-5 h-5" />, label: 'Scene' },
        { id: 'effects', icon: <Palette className="w-5 h-5" />, label: 'Effects' },
        { id: 'prompt', icon: <MessageSquare className="w-5 h-5" />, label: 'Prompt' },
    ];

    // Handlers
    const handleAddScene = () => {
        const newScene: StoryboardScene = {
            id: `scene-${Date.now()}`,
            order: scenes.length + 1,
            name: `Scene ${scenes.length + 1}`,
            description: '',
            prompt: '',
            thumbnailUrl: '',
            status: 'draft',
            duration: 10,
            hasVoiceover: false,
            hasSfx: false,
            characters: [],
        };
        setScenes([...scenes, newScene]);
        setActiveSceneId(newScene.id);
    };

    const handleDeleteScene = (sceneId: string) => {
        if (scenes.length <= 1) {
            toast.warning('You need at least one scene');
            return;
        }
        const updatedScenes = scenes.filter(s => s.id !== sceneId);
        setScenes(updatedScenes.map((s, i) => ({ ...s, order: i + 1 })));
        if (activeSceneId === sceneId) {
            setActiveSceneId(updatedScenes[0].id);
        }
    };

    const handleUpdateScene = (field: keyof StoryboardScene, value: any) => {
        setScenes(scenes.map(s =>
            s.id === activeSceneId ? { ...s, [field]: value } : s
        ));
    };

    const handleRegenerate = async () => {
        setIsGenerating(true);
        handleUpdateScene('status', 'generating');

        // Simulate AI generation
        setTimeout(() => {
            handleUpdateScene('status', 'completed');
            setIsGenerating(false);
            toast.success('Scene regenerated successfully!');
        }, 3000);
    };

    const handleAnimate = async () => {
        setIsGenerating(true);
        handleUpdateScene('status', 'generating');

        // Simulate animation generation
        setTimeout(() => {
            handleUpdateScene('status', 'completed');
            handleUpdateScene('videoUrl', '/api/placeholder/video');
            setIsGenerating(false);
            toast.success('Animation generated successfully!');
        }, 5000);
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        if (videoRef.current) {
            isPlaying ? videoRef.current.pause() : videoRef.current.play();
        }
    };

    return (
        <div className="h-screen flex flex-col bg-[#121212] text-white overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#1a1a1a]">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ChevronDown className="w-4 h-4" />
                        <span className="font-medium">{projectName}</span>
                    </button>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-400">
                        Auto Saved
                    </Badge>
                </div>

                {/* Workflow Steps */}
                <div className="flex items-center gap-1">
                    {[
                        { id: 'content', label: 'Content', icon: <MessageSquare className="w-4 h-4" /> },
                        { id: 'cast', label: 'Cast', icon: <User className="w-4 h-4" /> },
                        { id: 'storyboard', label: 'Storyboard', icon: <Video className="w-4 h-4" /> },
                        { id: 'edit', label: 'Edit', icon: <Edit3 className="w-4 h-4" /> },
                    ].map((step, index) => (
                        <button
                            key={step.id}
                            onClick={() => setCurrentStep(step.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${currentStep === step.id
                                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {currentStep === step.id && <Check className="w-4 h-4" />}
                            {step.label}
                        </button>
                    ))}
                </div>

                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:opacity-90">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Scene Timeline */}
                <aside className="w-[160px] border-r border-white/10 bg-[#1a1a1a] flex flex-col">
                    {/* Voiceover Settings */}
                    <div className="p-3 border-b border-white/10">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Voiceover speed</span>
                            <div className="flex items-center gap-1 bg-white/5 rounded px-2 py-0.5">
                                <span className="text-xs font-medium">{voiceoverSpeed}x</span>
                                <Badge className="text-[8px] bg-amber-500 text-black px-1">Live</Badge>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Voiceover</span>
                            <select
                                value={voiceoverVoice}
                                onChange={(e) => setVoiceoverVoice(e.target.value)}
                                className="text-xs bg-white/5 border-0 rounded px-2 py-1 text-white"
                            >
                                <option value="Ryan">Ryan</option>
                                <option value="Sarah">Sarah</option>
                                <option value="Alex">Alex</option>
                            </select>
                        </div>
                    </div>

                    {/* Storyboard Count */}
                    <div className="px-3 py-2 border-b border-white/10">
                        <span className="text-[10px] text-gray-500">Auto generated {scenes.length} storyboards</span>
                    </div>

                    {/* Scene Thumbnails */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {scenes.map((scene) => (
                            <SceneThumbnail
                                key={scene.id}
                                scene={scene}
                                isActive={scene.id === activeSceneId}
                                onClick={() => setActiveSceneId(scene.id)}
                                onDelete={() => handleDeleteScene(scene.id)}
                            />
                        ))}

                        {/* Add Scene Button */}
                        <button
                            onClick={handleAddScene}
                            className="w-full aspect-video rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                            <Plus className="w-6 h-6 text-gray-500 group-hover:text-amber-500" />
                        </button>
                    </div>
                </aside>

                {/* Center - Main Preview */}
                <main className="flex-1 flex flex-col">
                    {/* Video Preview */}
                    <div className="flex-1 p-6 flex items-center justify-center bg-[#0d0d0d]">
                        <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 shadow-2xl">
                            {activeScene.thumbnailUrl ? (
                                <img
                                    src={activeScene.thumbnailUrl}
                                    alt={activeScene.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <div className="text-center">
                                        <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500">No preview available</p>
                                    </div>
                                </div>
                            )}

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button
                                    onClick={handlePlayPause}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
                    ${isPlaying
                                            ? 'bg-white/10 backdrop-blur-md'
                                            : 'bg-white/20 backdrop-blur-md hover:bg-white/30 hover:scale-110'
                                        }`}
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-white" />
                                    ) : (
                                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                                    )}
                                </button>
                            </div>

                            {/* Generating Overlay */}
                            {activeScene.status === 'generating' && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                                    <div className="text-center">
                                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
                                        <p className="text-white font-medium">Generating...</p>
                                        <p className="text-gray-400 text-sm mt-1">This may take a few moments</p>
                                    </div>
                                </div>
                            )}

                            {/* Scene Indicator */}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-black/60 backdrop-blur-sm text-white border-0 px-3 py-1">
                                    Scene {activeScene.order}
                                </Badge>
                            </div>

                            {/* Video Controls */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-5 h-5" />
                                        ) : (
                                            <Play className="w-5 h-5 fill-white" />
                                        )}
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <SkipBack className="w-5 h-5" />
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <SkipForward className="w-5 h-5" />
                                    </button>

                                    {/* Progress Bar */}
                                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                                        <div className="h-full w-1/3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
                                    </div>

                                    <span className="text-xs text-gray-400">0:05 / 0:15</span>

                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        {isMuted ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </button>

                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                        <Maximize2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tools Bar */}
                    <div className="px-6 py-3 border-t border-white/10 bg-[#1a1a1a]">
                        <div className="flex items-center justify-center gap-2">
                            {tools.map((tool) => (
                                <ToolButton
                                    key={tool.id}
                                    icon={tool.icon}
                                    label={tool.label}
                                    active={activeTool === tool.id}
                                    onClick={() => setActiveTool(tool.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="px-6 py-4 border-t border-white/10 bg-[#1a1a1a]">
                        <div className="relative">
                            <div className="flex items-start gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                    <Wand2 className="w-4 h-4 text-black" />
                                </div>
                                <Textarea
                                    value={activeScene.description}
                                    onChange={(e) => handleUpdateScene('description', e.target.value)}
                                    placeholder="Describe your scene..."
                                    className="flex-1 bg-transparent border-0 resize-none text-white placeholder:text-gray-500 focus:ring-0 min-h-[60px]"
                                    rows={2}
                                />
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`border-white/20 text-gray-300 hover:bg-white/10 ${activeScene.hasVoiceover ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}`}
                                        onClick={() => handleUpdateScene('hasVoiceover', !activeScene.hasVoiceover)}
                                    >
                                        <Mic className="w-4 h-4 mr-1" />
                                        Voiceover
                                        {!activeScene.hasVoiceover && (
                                            <Badge className="ml-1 text-[8px] bg-amber-500 text-black">New</Badge>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`border-white/20 text-gray-300 hover:bg-white/10 ${activeScene.hasSfx ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}`}
                                        onClick={() => handleUpdateScene('hasSfx', !activeScene.hasSfx)}
                                    >
                                        <Music className="w-4 h-4 mr-1" />
                                        No SFX
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Generation History */}
                    <div className="px-6 py-3 border-t border-white/10 bg-[#1a1a1a]">
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                <RefreshCcw className="w-4 h-4" />
                                <span className="text-sm">Generation History</span>
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-dashed border-white/20">
                                <Plus className="w-4 h-4" />
                                <span className="text-sm">Upload Custom Image</span>
                            </button>

                            {/* Recent Generations */}
                            <div className="flex-1 flex items-center gap-2 overflow-x-auto px-2">
                                {scenes.filter(s => s.thumbnailUrl).slice(0, 3).map((scene) => (
                                    <div
                                        key={scene.id}
                                        className="relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-amber-500 transition-all"
                                    >
                                        <img
                                            src={scene.thumbnailUrl}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-1 left-1 w-4 h-4 rounded bg-black/60 text-[8px] flex items-center justify-center">
                                            {scene.order}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <ChevronRight className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                </main>

                {/* Right Sidebar - Characters & Actions */}
                <aside className="w-[280px] border-l border-white/10 bg-[#1a1a1a] flex flex-col">
                    {/* On-Screen Characters */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white">On-Screen Characters</h3>
                            <button className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                Edit Characters
                            </button>
                        </div>

                        {/* Character List */}
                        <div className="space-y-2">
                            {characters.map((character) => (
                                <div
                                    key={character.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer
                    ${character.isActive ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-white/5'}`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 overflow-hidden">
                                        {character.avatar ? (
                                            <img
                                                src={character.avatar}
                                                alt={character.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-500" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{character.name}</p>
                                        <p className="text-xs text-gray-500">{character.role}</p>
                                    </div>
                                </div>
                            ))}

                            {/* Add Character Button */}
                            <button className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed border-white/20 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all">
                                <Plus className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Add Character</span>
                            </button>
                        </div>
                    </div>

                    {/* Current Storyboard */}
                    <div className="p-4 border-b border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white">Current storyboard</h3>
                            <button className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                                <Edit3 className="w-3 h-3" />
                                Edit Storyboard
                            </button>
                        </div>

                        {/* Storyboard Preview */}
                        <div className="rounded-lg bg-white/5 border border-white/10 p-4">
                            <div className="flex items-center justify-center h-20 text-center">
                                <div>
                                    <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center mx-auto mb-2">
                                        <ImageIcon className="w-5 h-5 text-gray-500" />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Choose a storyboard to control character actions.
                                        <br />
                                        <span className="text-gray-600">This slot is generated from a prompt.</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Prompt Section */}
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-white">Prompt</h3>
                            <button className="text-xs text-amber-500 hover:text-amber-400">
                                Click here for tips
                            </button>
                        </div>

                        <Textarea
                            value={activeScene.prompt}
                            onChange={(e) => handleUpdateScene('prompt', e.target.value)}
                            placeholder="Describe the character actions..."
                            className="w-full bg-white/5 border-white/10 text-white placeholder:text-gray-600 resize-none min-h-[120px] text-sm"
                            rows={5}
                        />

                        <div className="flex items-center justify-between mt-2">
                            <button className="text-xs text-amber-500 hover:text-amber-400 flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                AI Expand
                            </button>
                            <span className="text-xs text-gray-600">{activeScene.prompt.length} / 1000</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 space-y-2 border-t border-white/10">
                        <Button
                            variant="outline"
                            className="w-full bg-white/5 border-white/10 text-white hover:bg-white/10"
                            onClick={handleRegenerate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCcw className="w-4 h-4 mr-2" />
                            )}
                            Re-gen
                        </Button>

                        {/* Dynamic Toggle */}
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-gray-400">Dynamic</span>
                            <Switch
                                checked={isDynamic}
                                onCheckedChange={setIsDynamic}
                                className="data-[state=checked]:bg-amber-500"
                            />
                        </div>

                        <Button
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold hover:opacity-90"
                            onClick={handleAnimate}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4 mr-2" />
                            )}
                            Animate
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default StoryboardStudio;
