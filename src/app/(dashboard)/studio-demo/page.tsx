'use client';

import React, { useState } from 'react';
import {
    Briefcase, Share2, User, Film, Book, Video, Globe,
    Wand2, LayoutTemplate, ChevronRight, Download, Save, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    HybridStudioWrapper,
    StudioModeToggle,
    StudioMode
} from '@/components/studio';

// Demo data
const demoProject = {
    id: 'demo-001',
    title: 'Idris dan Buah Delima',
    description: 'Kisah inspiratif tentang perjalanan spiritual Idris',
};

export default function StudioDemoPage() {
    const [activeTab, setActiveTab] = useState('characters');
    const [globalMode, setGlobalMode] = useState<StudioMode>('form');

    // Navigation items with mode support
    const navItems = [
        { id: 'ip-project', label: 'IP Project', icon: Briefcase, color: 'from-orange-500 to-amber-500', modes: ['form'] as StudioMode[] },
        { id: 'strategic-plan', label: 'Strategic Plan', icon: Share2, color: 'from-blue-500 to-cyan-500', modes: ['form', 'canvas'] as StudioMode[] },
        { id: 'characters', label: 'Character Formula', icon: User, color: 'from-emerald-500 to-teal-500', modes: ['form', 'canvas'] as StudioMode[] },
        { id: 'story', label: 'Story Formula', icon: Wand2, color: 'from-purple-500 to-pink-500', modes: ['form', 'canvas'] as StudioMode[] },
        { id: 'universe-formula', label: 'Universe Formula', icon: Globe, color: 'from-violet-500 to-fuchsia-500', modes: ['form', 'canvas'] as StudioMode[] },
        { id: 'moodboard', label: 'Moodboard', icon: LayoutTemplate, color: 'from-pink-500 to-rose-500', modes: ['form', 'canvas'] as StudioMode[] },
        { id: 'animate', label: 'Animate', icon: Video, color: 'from-rose-500 to-orange-500', modes: ['form', 'canvas', 'storyboard'] as StudioMode[] },
        { id: 'edit-mix', label: 'Edit & Mix', icon: Film, color: 'from-indigo-500 to-purple-500', modes: ['form', 'storyboard'] as StudioMode[] },
        { id: 'ip-bible', label: 'IP Bible', icon: Book, color: 'from-slate-600 to-slate-800', modes: ['form'] as StudioMode[] },
    ];

    // Canvas type mapping
    const canvasTypeMap: Record<string, 'character' | 'universe' | 'story' | 'project' | 'moodboard'> = {
        'characters': 'character',
        'story': 'story',
        'universe-formula': 'universe',
        'moodboard': 'moodboard',
        'strategic-plan': 'project',
        'animate': 'moodboard',
        'edit-mix': 'moodboard',
    };

    const currentNav = navItems.find(n => n.id === activeTab) || navItems[0];

    // Demo form content for each tab
    const renderFormContent = (tabId: string) => {
        switch (tabId) {
            case 'characters':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-500" />
                                Character Formula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Character Name</Label>
                                    <Input placeholder="e.g., Idris bin Salman" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Input placeholder="e.g., Protagonist" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Background Story</Label>
                                <Textarea placeholder="Character's background and motivation..." rows={4} />
                            </div>
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                                <p className="text-sm text-emerald-700">
                                    💡 <strong>Tip:</strong> Switch to <strong>Canvas Mode</strong> untuk menambahkan visual references, mood boards, dan annotations untuk karaktermu!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'universe-formula':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Globe className="w-5 h-5 text-violet-500" />
                                Universe Formula
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>World Name</Label>
                                    <Input placeholder="e.g., Arabian Desert Kingdom" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Period</Label>
                                    <Input placeholder="e.g., 8th Century" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Environment Description</Label>
                                <Textarea placeholder="Describe the world's environment, society, and rules..." rows={4} />
                            </div>
                            <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                                <p className="text-sm text-violet-700">
                                    💡 <strong>Tip:</strong> Gunakan <strong>Canvas Mode</strong> untuk membuat world map, diagram relasi, dan visual worldbuilding!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'moodboard':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <LayoutTemplate className="w-5 h-5 text-pink-500" />
                                Moodboard
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div
                                        key={i}
                                        className="aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-400 transition-colors cursor-pointer"
                                    >
                                        <span className="text-gray-400 text-sm">Beat {i}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-pink-50 rounded-lg border border-pink-100">
                                <p className="text-sm text-pink-700">
                                    💡 <strong>Tip:</strong> <strong>Canvas Mode</strong> sangat cocok untuk moodboard! Bisa upload gambar, arrange freely, dan add annotations.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            case 'animate':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Video className="w-5 h-5 text-rose-500" />
                                Animate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div
                                        key={i}
                                        className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center relative group cursor-pointer"
                                    >
                                        <Video className="w-8 h-8 text-gray-600" />
                                        <div className="absolute bottom-2 left-2 text-xs text-gray-400">Scene {i}</div>
                                        <div className="absolute inset-0 bg-rose-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                                <p className="text-sm text-rose-700">
                                    💡 <strong>Tip:</strong> Coba <strong>Storyboard Mode</strong> untuk timeline-based animation dengan video preview, voiceover, dan AI generation!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>{currentNav.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-500">Form content for {currentNav.label}</p>
                        </CardContent>
                    </Card>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
            {/* Header */}
            <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/50">
                <div className="flex items-center justify-between px-4 lg:px-8 h-16">
                    {/* Left: Project Info */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${currentNav.color} flex items-center justify-center shadow-lg`}>
                            <currentNav.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-slate-900">{demoProject.title}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Auto-saved
                                </span>
                                <span>•</span>
                                <span>{currentNav.label}</span>
                                <span>•</span>
                                <span className="capitalize text-orange-600 font-medium">{globalMode} Mode</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="hidden sm:flex">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                            <Save className="h-4 w-4 mr-2" />
                            Save
                        </Button>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="px-4 lg:px-8 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-1 pb-3 min-w-max">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${activeTab === item.id
                                        ? 'text-white shadow-lg'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                {activeTab === item.id && (
                                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${item.color} shadow-lg`} />
                                )}
                                <item.icon className={`h-4 w-4 relative z-10 ${activeTab === item.id ? 'text-white' : ''}`} />
                                <span className="relative z-10">{item.label}</span>
                                {/* Mode indicator badges */}
                                {item.modes.includes('canvas') && (
                                    <span className={`relative z-10 w-1.5 h-1.5 rounded-full ${activeTab === item.id ? 'bg-white/50' : 'bg-orange-400'}`} />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="px-4 lg:px-8 py-6 lg:py-8 pb-24">
                <HybridStudioWrapper
                    projectId={demoProject.id}
                    userId="demo-user"
                    tabId={activeTab}
                    tabName={currentNav.label}
                    canvasType={canvasTypeMap[activeTab] || 'moodboard'}
                    availableModes={currentNav.modes}
                    defaultMode="form"
                    onCanvasSave={(data) => console.log('Canvas saved:', data)}
                >
                    {renderFormContent(activeTab)}
                </HybridStudioWrapper>
            </main>

            {/* Legend */}
            <div className="fixed bottom-6 left-6 z-50 p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                <p className="text-xs text-gray-500 mb-2 font-medium">Mode Legend:</p>
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-gray-600">Form Only</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-gray-600">+ Canvas</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-gray-600">+ Storyboard</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
