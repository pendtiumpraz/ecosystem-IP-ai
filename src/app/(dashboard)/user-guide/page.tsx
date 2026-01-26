'use client';

import React, { useState } from 'react';
import {
    Book,
    Users,
    FileText,
    Palette,
    Film,
    Library,
    Coins,
    Sparkles,
    ChevronRight,
    ChevronDown,
    Layers,
    Zap,
    HelpCircle,
    ArrowRight,
    Check,
    Star,
    Settings,
    Camera,
    Video,
    Music,
    Mic,
    PenTool,
    Globe,
    Heart,
    Target,
    LayoutGrid,
    Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Credit Costs Data
const CREDIT_COSTS = {
    character: [
        { name: 'Generate Premise', credits: 2, icon: Sparkles, desc: 'Generate logline dari project' },
        { name: 'Generate Profile', credits: 8, icon: Users, desc: 'Generate detail karakter lengkap' },
        { name: 'Generate Character Image', credits: 12, icon: Camera, desc: 'Generate visual karakter' },
        { name: 'Generate All Characters', credits: 15, icon: Zap, desc: 'Generate multiple characters' },
    ],
    story: [
        { name: 'Generate Synopsis', credits: 3, icon: FileText, desc: 'Generate synopsis lengkap' },
        { name: 'Generate Story Structure', credits: 10, icon: Layers, desc: 'Generate semua beats' },
        { name: 'Generate Universe', credits: 10, icon: Globe, desc: 'Generate world/setting' },
        { name: 'Generate Universe from Story', credits: 12, icon: Globe, desc: 'Generate universe dari cerita' },
        { name: 'Generate Key Actions', credits: 5, icon: Target, desc: 'Generate 3 key actions per beat' },
        { name: 'Generate Sceneplot', credits: 5, icon: Film, desc: 'Generate scene/shot breakdown' },
    ],
    moodboard: [
        { name: 'Generate Prompt', credits: 3, icon: PenTool, desc: 'Generate image prompt' },
        { name: 'Generate All Prompts', credits: 10, icon: Zap, desc: 'Generate semua prompts' },
        { name: 'Generate Image', credits: 12, icon: Palette, desc: 'Generate 1 moodboard image' },
    ],
    animation: [
        { name: 'Generate Animation Prompts', credits: 10, icon: Film, desc: 'Generate animation prompts' },
        { name: 'Generate Animation Preview', credits: 50, icon: Video, desc: 'Generate 1 clip (5-10s)' },
        { name: 'Generate Voiceover', credits: 20, icon: Mic, desc: 'Generate voice untuk scene' },
        { name: 'Generate Music', credits: 30, icon: Music, desc: 'Generate background music' },
        { name: 'Generate Full Video', credits: 100, icon: Monitor, desc: 'Generate full video render' },
    ],
    script: [
        { name: 'Generate Script', credits: 25, icon: FileText, desc: 'Generate screenplay format' },
    ],
};

// Story Structures Data
const STORY_STRUCTURES = [
    {
        name: 'Save the Cat',
        beats: 15,
        icon: '🐱',
        color: 'from-orange-500 to-amber-500',
        desc: 'Framework Hollywood populer by Blake Snyder'
    },
    {
        name: "Hero's Journey",
        beats: 12,
        icon: '🦸',
        color: 'from-blue-500 to-indigo-500',
        desc: 'Monomyth by Joseph Campbell'
    },
    {
        name: 'Dan Harmon',
        beats: 8,
        icon: '⭕',
        color: 'from-purple-500 to-pink-500',
        desc: 'Story Circle - simplified structure'
    },
    {
        name: 'Three Act',
        beats: 8,
        icon: '🎭',
        color: 'from-emerald-500 to-teal-500',
        desc: 'Setup - Confrontation - Resolution'
    },
    {
        name: "Freytag's Pyramid",
        beats: 5,
        icon: '📐',
        color: 'from-red-500 to-rose-500',
        desc: 'Dramatis klasik untuk tragedy'
    },
    {
        name: 'Custom',
        beats: 0,
        icon: '✨',
        color: 'from-gray-500 to-gray-700',
        desc: 'Buat struktur sendiri'
    },
];

// Application Flow Steps
const APP_FLOW = [
    {
        step: 1,
        title: 'Create Project',
        icon: LayoutGrid,
        desc: 'Mulai dengan membuat project baru',
        color: 'bg-blue-500'
    },
    {
        step: 2,
        title: 'Character Formula',
        icon: Users,
        desc: 'Buat dan kembangkan karakter',
        color: 'bg-purple-500'
    },
    {
        step: 3,
        title: 'Story Formula',
        icon: FileText,
        desc: 'Struktur cerita dengan beats',
        color: 'bg-orange-500'
    },
    {
        step: 4,
        title: 'Moodboard',
        icon: Palette,
        desc: 'Visual development per beat',
        color: 'bg-pink-500'
    },
    {
        step: 5,
        title: 'Animation Studio',
        icon: Film,
        desc: 'Buat clip animasi',
        color: 'bg-red-500'
    },
    {
        step: 6,
        title: 'IP Bible',
        icon: Library,
        desc: 'Dokumentasi lengkap IP',
        color: 'bg-emerald-500'
    },
];

export default function UserGuidePage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent" />

                <div className="relative max-w-6xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur rounded-2xl">
                            <Book className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">User Guide</h1>
                            <p className="text-orange-100 mt-1">MODO Creator Verse - Complete Documentation</p>
                        </div>
                    </div>

                    <p className="text-lg text-white/90 max-w-2xl">
                        Panduan lengkap untuk mengembangkan IP (Intellectual Property) Anda dengan bantuan AI.
                        Dari pembuatan karakter hingga animasi final.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <Tabs defaultValue="overview" className="space-y-6">
                    <TabsList className="bg-white border border-gray-200 p-1 flex-wrap h-auto gap-1 shadow-sm">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="flow" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            Application Flow
                        </TabsTrigger>
                        <TabsTrigger value="structures" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            Story Structures
                        </TabsTrigger>
                        <TabsTrigger value="pricing" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            Credit Pricing
                        </TabsTrigger>
                        <TabsTrigger value="manual" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            📝 Manual Mode
                        </TabsTrigger>
                        <TabsTrigger value="versioning" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            Versioning
                        </TabsTrigger>
                        <TabsTrigger value="faq" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                            FAQ
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { icon: Users, title: 'Character Formula', desc: 'Buat karakter dengan profil lengkap, generate image, dan kelola versi visual.', color: 'from-purple-500 to-pink-500' },
                                { icon: FileText, title: 'Story Formula', desc: '6 struktur cerita: Save the Cat, Hero\'s Journey, Dan Harmon, Three Act, Freytag, Custom.', color: 'from-orange-500 to-amber-500' },
                                { icon: Palette, title: 'Moodboard', desc: 'Visual development untuk setiap beat dengan AI image generation.', color: 'from-pink-500 to-rose-500' },
                                { icon: Film, title: 'Animation Studio', desc: 'Buat animation clips dari key actions dengan sceneplot detail.', color: 'from-red-500 to-orange-500' },
                                { icon: Library, title: 'IP Bible', desc: 'Kompilasi lengkap semua aset IP untuk tim dan stakeholder.', color: 'from-emerald-500 to-teal-500' },
                                { icon: Sparkles, title: 'AI Generation', desc: 'Generate content dengan berbagai AI provider (OpenAI, Google, Anthropic).', color: 'from-blue-500 to-indigo-500' },
                            ].map((feature, i) => (
                                <Card key={i} className="bg-white border-gray-200 hover:border-orange-300 transition-all hover:shadow-md group">
                                    <CardHeader>
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                                        <CardDescription className="text-gray-600">{feature.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Story Structures', value: '6', icon: Layers },
                                { label: 'Max Beats', value: '15', icon: Target },
                                { label: 'AI Providers', value: '5+', icon: Zap },
                                { label: 'Generation Types', value: '15+', icon: Sparkles },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                                    <stat.icon className="h-6 w-6 text-orange-500 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <div className="text-sm text-gray-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Application Flow Tab */}
                    <TabsContent value="flow" className="space-y-6">
                        <div className="relative">
                            {/* Flow Line */}
                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-orange-500 to-emerald-500 hidden md:block" />

                            <div className="space-y-4">
                                {APP_FLOW.map((step, i) => (
                                    <div key={i} className="relative flex gap-6 md:gap-8">
                                        {/* Step Number */}
                                        <div className={`relative z-10 flex-shrink-0 w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                            <step.icon className="h-7 w-7 text-white" />
                                        </div>

                                        {/* Content */}
                                        <Card className="flex-1 bg-white border-gray-200">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center gap-3">
                                                    <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                                        Step {step.step}
                                                    </Badge>
                                                    <CardTitle className="text-gray-900">{step.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-600">{step.desc}</p>

                                                {/* Additional Info per Step */}
                                                {step.step === 2 && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-700">
                                                            <strong>Features:</strong> Character profiles, physical attributes, psychological profile,
                                                            MBTI, archetype, character versions, AI image generation
                                                        </p>
                                                    </div>
                                                )}
                                                {step.step === 3 && (
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                        <p className="text-sm text-gray-700">
                                                            <strong>Views:</strong> Arc View (tension graph), Beats View, Key Actions View, Sceneplot View
                                                        </p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Arrow */}
                                        {i < APP_FLOW.length - 1 && (
                                            <div className="absolute left-[1.875rem] bottom-0 translate-y-full">
                                                <ChevronDown className="h-6 w-6 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* Story Structures Tab */}
                    <TabsContent value="structures" className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {STORY_STRUCTURES.map((structure, i) => (
                                <Card key={i} className="bg-white border-gray-200 hover:border-orange-300 transition-all overflow-hidden group">
                                    <div className={`h-2 bg-gradient-to-r ${structure.color}`} />
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <span className="text-4xl">{structure.icon}</span>
                                            <Badge className={`bg-gradient-to-r ${structure.color} text-white border-0`}>
                                                {structure.beats === 0 ? 'Custom' : `${structure.beats} beats`}
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-gray-900 mt-3">{structure.name}</CardTitle>
                                        <CardDescription className="text-gray-600">{structure.desc}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>

                        {/* Custom Structure Info */}
                        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900 flex items-center gap-2">
                                    <Settings className="h-5 w-5 text-orange-500" />
                                    Custom Story Structure
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-gray-700">
                                    Buat struktur cerita sendiri dengan Custom Structure Editor:
                                </p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        'Define beats dengan label & description',
                                        'Assign beats ke Act 1, 2, atau 3',
                                        'Reorder beats dengan drag & drop',
                                        'Gunakan preset templates (Kishotenketsu, Seven Point, etc.)',
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-gray-600">
                                            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Credit Pricing Tab */}
                    <TabsContent value="pricing" className="space-y-6">
                        {/* Pricing Header */}
                        <div className="bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 border border-orange-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Coins className="h-8 w-8 text-orange-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Credit Pricing</h2>
                            </div>
                            <p className="text-gray-700">
                                Setiap generasi AI membutuhkan credits. Berikut adalah daftar lengkap biaya untuk setiap fitur.
                            </p>
                        </div>

                        {/* Pricing Tables */}
                        <div className="grid lg:grid-cols-2 gap-4">
                            {Object.entries(CREDIT_COSTS).map(([category, items]) => (
                                <Card key={category} className="bg-white border-gray-200">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-gray-900 capitalize flex items-center gap-2">
                                            {category === 'character' && <Users className="h-5 w-5 text-purple-500" />}
                                            {category === 'story' && <FileText className="h-5 w-5 text-orange-500" />}
                                            {category === 'moodboard' && <Palette className="h-5 w-5 text-pink-500" />}
                                            {category === 'animation' && <Film className="h-5 w-5 text-red-500" />}
                                            {category === 'script' && <PenTool className="h-5 w-5 text-blue-500" />}
                                            {category.replace('_', ' ')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {items.map((item, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <div className="text-sm text-gray-900 font-medium">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.desc}</div>
                                                    </div>
                                                </div>
                                                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                                                    {item.credits} cr
                                                </Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Cost Saving Tips */}
                        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-emerald-500" />
                                    💡 Tips Hemat Credit
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-4">
                                {[
                                    { tip: 'Bulk Generation', desc: '"Generate All Prompts" (10 cr) vs "Generate Prompt" ×15 (45 cr)' },
                                    { tip: 'Review First', desc: 'Edit prompt manual sebelum generate image' },
                                    { tip: 'Start with Synopsis', desc: 'Generate synopsis dulu untuk inform character generation' },
                                ].map((item, i) => (
                                    <div key={i} className="p-4 bg-white/60 rounded-lg border border-emerald-100">
                                        <div className="font-medium text-emerald-700 mb-1">{item.tip}</div>
                                        <div className="text-sm text-gray-600">{item.desc}</div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Manual Mode Tab */}
                    <TabsContent value="manual" className="space-y-6">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 border border-blue-200 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <PenTool className="h-8 w-8 text-blue-600" />
                                <h2 className="text-2xl font-bold text-gray-900">Mode Manual (Tanpa AI)</h2>
                            </div>
                            <p className="text-gray-700">
                                Jika credit AI habis, Anda tetap bisa mengisi semua konten secara manual.
                                Semua field dalam aplikasi bisa diedit langsung tanpa menggunakan AI.
                            </p>
                        </div>

                        {/* Manual Guide Cards */}
                        <div className="grid gap-4">
                            {/* Character Manual */}
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-purple-500" />
                                        Character Formula - Pengisian Manual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-600 text-sm">
                                        Semua field karakter bisa diisi manual. Berikut panduan pengisiannya:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">📝 Core Info</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• <strong>Name:</strong> Nama lengkap karakter</li>
                                                <li>• <strong>Role:</strong> Pilih dari dropdown (Protagonist, Antagonist, dll)</li>
                                                <li>• <strong>Age:</strong> Child, Teen, Young Adult, Adult, Middle-aged, Elderly</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🎭 Physical</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Semua dropdown sudah tersedia opsi</li>
                                                <li>• Pilih sesuai visi karakter Anda</li>
                                                <li>• <strong>Uniqueness:</strong> Ciri khas unik karakter</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🧠 Psychological</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• <strong>MBTI:</strong> Kepribadian 16 tipe</li>
                                                <li>• <strong>Wants:</strong> Keinginan eksternal</li>
                                                <li>• <strong>Needs:</strong> Kebutuhan internal tersembunyi</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🖼️ Image</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Upload gambar sendiri (tidak harus generate)</li>
                                                <li>• Gunakan reference image dari internet</li>
                                                <li>• Drag & drop ke area upload</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Story Manual */}
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-orange-500" />
                                        Story Formula - Pengisian Manual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-gray-600 text-sm">
                                        Setiap beat bisa ditulis manual. Klik pada beat dan ketik langsung:
                                    </p>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">📖 Synopsis</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Tulis premise/logline 1-2 kalimat</li>
                                                <li>• Tulis synopsis 100-300 kata</li>
                                                <li>• Pilih genre, tone, theme dari dropdown</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🎬 Beats</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Klik pada beat card untuk edit</li>
                                                <li>• Tulis 50-100 kata per beat</li>
                                                <li>• Jelaskan apa yang terjadi di beat ini</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">💫 Want/Need Matrix</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• <strong>Want:</strong> Keinginan eksternal karakter utama</li>
                                                <li>• <strong>Need:</strong> Kebutuhan internal yang tidak disadari</li>
                                                <li>• Tulis masing-masing 2-3 kalimat</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🎯 Key Actions</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• 3 key actions per beat</li>
                                                <li>• Tulis deskripsi singkat (1-2 kalimat)</li>
                                                <li>• Pilih karakter yang terlibat</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Moodboard Manual */}
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-pink-500" />
                                        Moodboard - Pengisian Manual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">✏️ Tulis Prompt Manual</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Klik pada field "Prompt"</li>
                                                <li>• Tulis deskripsi visual dalam bahasa Inggris</li>
                                                <li>• Include: setting, lighting, mood, style</li>
                                                <li>• Contoh: "A young warrior standing on cliff, sunset, dramatic lighting, cinematic"</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🖼️ Upload Image</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Buat moodboard image di luar app</li>
                                                <li>• Gunakan Canva, Photoshop, atau AI tools lain</li>
                                                <li>• Upload langsung ke key action</li>
                                                <li>• Drag & drop supported</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Animation Manual */}
                            <Card className="bg-white border-gray-200">
                                <CardHeader>
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <Film className="h-5 w-5 text-red-500" />
                                        Animation Studio - Pengisian Manual
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">🎬 Sceneplot Manual</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Tulis scene breakdown per key action</li>
                                                <li>• Tentukan shot type (wide, medium, close-up)</li>
                                                <li>• Tentukan camera movement (static, pan, dolly)</li>
                                                <li>• Estimasi durasi per shot</li>
                                            </ul>
                                        </div>
                                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <h4 className="text-gray-900 font-medium mb-2">📹 Upload Video</h4>
                                            <ul className="text-sm text-gray-600 space-y-1">
                                                <li>• Buat animasi di tools eksternal</li>
                                                <li>• Gunakan Runway, Pika, atau lainnya</li>
                                                <li>• Upload video clip langsung</li>
                                                <li>• Format: MP4, WebM (max 100MB)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Tips for Manual Mode */}
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900 flex items-center gap-2">
                                    <Star className="h-5 w-5 text-amber-500" />
                                    💡 Tips Mode Manual
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {[
                                        { tip: 'Mulai dari Synopsis', desc: 'Tulis cerita dulu, baru breakdown ke beats' },
                                        { tip: 'Reference External', desc: 'Gunakan AI tools gratis lainnya untuk generate content' },
                                        { tip: 'Copy-Paste Friendly', desc: 'Semua field support copy-paste dari dokumen lain' },
                                        { tip: 'Save Berkala', desc: 'Auto-save aktif, tapi klik Save untuk memastikan' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg border border-amber-100">
                                            <Check className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <div className="font-medium text-gray-900 text-sm">{item.tip}</div>
                                                <div className="text-xs text-gray-600">{item.desc}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* External Tools Recommendation */}
                        <Card className="bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900">🔧 Tools Eksternal yang Bisa Digunakan</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h4 className="text-gray-900 font-medium mb-2">Image Generation</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Bing Image Creator (free)</li>
                                            <li>• Leonardo.ai (free tier)</li>
                                            <li>• Canva AI (free tier)</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h4 className="text-gray-900 font-medium mb-2">Text/Story</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• ChatGPT Free</li>
                                            <li>• Google Gemini (free)</li>
                                            <li>• Claude Free</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                        <h4 className="text-gray-900 font-medium mb-2">Video/Animation</h4>
                                        <ul className="text-sm text-gray-600 space-y-1">
                                            <li>• Pika.art (free tier)</li>
                                            <li>• CapCut (free)</li>
                                            <li>• Canva Video (free tier)</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Versioning Tab */}
                    <TabsContent value="versioning" className="space-y-6">
                        <Card className="bg-white border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-gray-900">Version Hierarchy</CardTitle>
                                <CardDescription>
                                    Setiap project memiliki struktur versioning yang terorganisir
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="font-mono text-sm bg-gray-900 rounded-xl p-6 overflow-x-auto">
                                    <pre className="text-gray-300">
                                        {`PROJECT
├── 📁 Characters
│   ├── Character 1
│   │   ├── Base Profile
│   │   └── Character Versions (visual variants)
│   └── Character 2
│       └── ...
│
├── 📖 Story Versions (Episodes)
│   ├── Story 1 (Episode 1)
│   │   ├── Structure: Save the Cat
│   │   ├── Beats: 15 beats with content
│   │   └── Want/Need Matrix
│   └── Story 2 (Episode 2)
│       └── ...
│
├── 🎨 Moodboard Versions
│   ├── Moodboard V1 → linked to Story 1
│   │   ├── Art Style: Cinematic
│   │   └── Key Actions: 45 actions with images
│   └── Moodboard V2
│       └── ...
│
└── 🎬 Animation Versions
    ├── Animation V1 → linked to Moodboard V1
    │   ├── Scene Plots
    │   └── Animation Clips
    └── Animation V2
        └── ...`}
                                    </pre>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Version Flow */}
                        <div className="flex flex-wrap items-center justify-center gap-4 p-6 bg-white rounded-xl border border-gray-200">
                            {['Story Version', 'Moodboard Version', 'Animation Version'].map((item, i) => (
                                <React.Fragment key={i}>
                                    <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg text-white font-medium">
                                        {item}
                                    </div>
                                    {i < 2 && <ArrowRight className="h-5 w-5 text-gray-400" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </TabsContent>

                    {/* FAQ Tab */}
                    <TabsContent value="faq" className="space-y-3">
                        {[
                            { q: 'Apakah story structure bisa diubah setelah dibuat?', a: 'Tidak. Structure dikunci saat pembuatan. Buat story baru jika ingin structure berbeda.' },
                            { q: 'Kenapa moodboard tidak menampilkan key actions?', a: 'Pastikan beat content di Story Formula sudah diisi terlebih dahulu.' },
                            { q: 'Kenapa animation version tidak tersedia?', a: 'Anda perlu membuat moodboard version dengan key actions terlebih dahulu.' },
                            { q: 'AI generation gagal, apa yang harus dilakukan?', a: 'Cek saldo credit Anda. Beberapa generasi membutuhkan lebih banyak credits.' },
                            { q: 'Bagaimana cara menggunakan Custom Structure?', a: 'Pilih "Custom Structure" saat create story, lalu klik tombol ⚙️ untuk membuka editor.' },
                            { q: 'Apakah generated content bisa diedit?', a: 'Ya, semua content yang digenerate AI bisa diedit manual setelahnya.' },
                        ].map((faq, i) => (
                            <Card key={i} className="bg-white border-gray-200">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-gray-900 text-base flex items-center gap-2">
                                        <HelpCircle className="h-4 w-4 text-orange-500" />
                                        {faq.q}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm">{faq.a}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 py-6 mt-8 bg-white">
                <div className="max-w-6xl mx-auto px-6 text-center">
                    <p className="text-gray-500 text-sm">
                        MODO Creator Verse © 2026 • Last Updated: January 27, 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
