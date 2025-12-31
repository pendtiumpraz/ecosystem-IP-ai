'use client';

import { useState } from 'react';
import {
    Briefcase, Calendar, Globe, Building2, UserCircle,
    Palette, Image as ImageIcon, Plus, Trash2, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProjectData {
    title: string;
    studioName: string;
    description: string;
    ipOwner: string;
    productionDate: string;
    brandColors: string[];
    brandLogos: string[];
    [key: string]: any;
}

interface IPPassportProps {
    project: ProjectData;
    onUpdate: (updates: Partial<ProjectData>) => void;
    isSaving?: boolean;
}

export function IPPassport({ project, onUpdate, isSaving }: IPPassportProps) {

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

    // Logos handling would typically involve upload, here we simulate placeholder or url input
    // For V2 revamp, we'll keep it simple: URL inputs for now or just visual placeholders for the plan.

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

                                <p className="text-sm text-slate-300 line-clamp-4 font-light leading-relaxed">
                                    {project.description || 'Add a description to see it appear here...'}
                                </p>

                                {/* Footer Metadata */}
                                <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
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

                    {/* Quick Stats or Status */}
                    <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-slate-700">{project.brandColors?.length || 0}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Brand Colors</span>
                        </div>
                        <div className="glass-panel p-4 rounded-xl flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-bold text-slate-700">{project.brandLogos?.length || 0}</span>
                            <span className="text-[10px] uppercase text-slate-400 font-bold">Assets</span>
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

                {/* Section 3: Visual Identity System */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                            <Palette className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Visual Identity</h2>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl space-y-8">

                        {/* Brand Colors */}
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

                        {/* Brand Assets (Placeholders for now) */}
                        <div className="space-y-3 pt-4 border-t border-slate-100">
                            <Label className="text-xs uppercase font-bold text-slate-500">Logo Assets</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[0, 1].map((i) => (
                                    <div key={i} className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center p-4 text-slate-400 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors cursor-pointer group">
                                        <ImageIcon className="h-6 w-6 mb-2 group-hover:text-indigo-500" />
                                        <span className="text-[10px] font-bold">Upload Logo</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </section>

            </div>
        </div>
    );
}
