'use client';

import { Target, Heart, Sparkles, Check, X, ArrowRight } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ============ TYPES ============

interface WantStages {
    menginginkan?: string;  // Wanting (initial desire)
    memastikan?: string;    // Ensuring (committing to it)
    mengejar?: string;      // Chasing (pursuing actively)
    tercapai?: boolean;     // Achieved (yes/no)
}

interface NeedStages {
    membutuhkan?: string;   // Needing (internal need)
    menemukan?: string;     // Discovering (finding the truth)
    menerima?: string;      // Accepting (embracing change)
    terpenuhi?: boolean;    // Fulfilled (yes/no)
}

interface WantNeedMatrixV2Props {
    wantStages?: WantStages;
    needStages?: NeedStages;
    onUpdate: (updates: { wantStages?: WantStages; needStages?: NeedStages }) => void;
    onGenerate?: () => void;
    isGenerating?: boolean;
}

// ============ COMPONENT ============

export function WantNeedMatrixV2({
    wantStages = {},
    needStages = {},
    onUpdate,
    onGenerate,
    isGenerating = false
}: WantNeedMatrixV2Props) {

    const updateWant = (key: keyof WantStages, value: string | boolean) => {
        onUpdate({
            wantStages: {
                ...wantStages,
                [key]: value
            }
        });
    };

    const updateNeed = (key: keyof NeedStages, value: string | boolean) => {
        onUpdate({
            needStages: {
                ...needStages,
                [key]: value
            }
        });
    };

    return (
        <div className="space-y-4 p-4 rounded-xl glass-panel border border-gray-100/50">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                        <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-gray-800">Want/Need Matrix V2</h3>
                        <p className="text-[10px] text-gray-400">Journey-based character motivation stages</p>
                    </div>
                </div>
                {onGenerate && (
                    <Button
                        size="sm"
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs h-8 px-3"
                    >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* WANT (External Desire) Journey */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/30">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-lg">
                            <Target className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-blue-700 uppercase tracking-wider">WANT</Label>
                            <p className="text-[9px] text-gray-500">External desire - what character consciously wants</p>
                        </div>
                    </div>

                    {/* Stage 1: Menginginkan */}
                    <div className="relative pl-6 border-l-2 border-blue-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">1</span>
                        </div>
                        <Label className="text-[10px] text-blue-600 font-bold uppercase">Menginginkan</Label>
                        <p className="text-[9px] text-gray-400 mb-1">What does the character initially desire?</p>
                        <Textarea
                            value={wantStages.menginginkan || ''}
                            onChange={(e) => updateWant('menginginkan', e.target.value)}
                            className="min-h-[60px] bg-white border-blue-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. The hero wants to find their missing father..."
                        />
                    </div>

                    {/* Stage 2: Memastikan */}
                    <div className="relative pl-6 border-l-2 border-blue-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">2</span>
                        </div>
                        <Label className="text-[10px] text-blue-600 font-bold uppercase">Memastikan</Label>
                        <p className="text-[9px] text-gray-400 mb-1">How does the character commit to pursuing this?</p>
                        <Textarea
                            value={wantStages.memastikan || ''}
                            onChange={(e) => updateWant('memastikan', e.target.value)}
                            className="min-h-[60px] bg-white border-blue-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. They leave their safe home to begin the journey..."
                        />
                    </div>

                    {/* Stage 3: Mengejar */}
                    <div className="relative pl-6 border-l-2 border-blue-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">3</span>
                        </div>
                        <Label className="text-[10px] text-blue-600 font-bold uppercase">Mengejar</Label>
                        <p className="text-[9px] text-gray-400 mb-1">What actions do they take to achieve this want?</p>
                        <Textarea
                            value={wantStages.mengejar || ''}
                            onChange={(e) => updateWant('mengejar', e.target.value)}
                            className="min-h-[60px] bg-white border-blue-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. They overcome obstacles, make allies, face enemies..."
                        />
                    </div>

                    {/* Stage 4: Tercapai */}
                    <div className="relative pl-6">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">4</span>
                        </div>
                        <Label className="text-[10px] text-blue-600 font-bold uppercase mb-2 block">Tercapai?</Label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateWant('tercapai', true)}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${wantStages.tercapai === true
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                                    }`}
                            >
                                <Check className="h-4 w-4" />
                                <span className="text-xs font-bold">Yes</span>
                            </button>
                            <button
                                onClick={() => updateWant('tercapai', false)}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${wantStages.tercapai === false
                                        ? 'border-red-400 bg-red-50 text-red-600'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                                    }`}
                            >
                                <X className="h-4 w-4" />
                                <span className="text-xs font-bold">No</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* NEED (Internal Growth) Journey */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className="space-y-3 p-4 rounded-xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/50 to-amber-50/30">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-orange-100 rounded-lg">
                            <Heart className="h-4 w-4 text-orange-600" />
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-orange-700 uppercase tracking-wider">NEED</Label>
                            <p className="text-[9px] text-gray-500">Internal growth - what character truly needs</p>
                        </div>
                    </div>

                    {/* Stage 1: Membutuhkan */}
                    <div className="relative pl-6 border-l-2 border-orange-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">1</span>
                        </div>
                        <Label className="text-[10px] text-orange-600 font-bold uppercase">Membutuhkan</Label>
                        <p className="text-[9px] text-gray-400 mb-1">What internal change does the character actually need?</p>
                        <Textarea
                            value={needStages.membutuhkan || ''}
                            onChange={(e) => updateNeed('membutuhkan', e.target.value)}
                            className="min-h-[60px] bg-white border-orange-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. They need to learn to trust others..."
                        />
                    </div>

                    {/* Stage 2: Menemukan */}
                    <div className="relative pl-6 border-l-2 border-orange-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">2</span>
                        </div>
                        <Label className="text-[10px] text-orange-600 font-bold uppercase">Menemukan</Label>
                        <p className="text-[9px] text-gray-400 mb-1">How do they discover this truth about themselves?</p>
                        <Textarea
                            value={needStages.menemukan || ''}
                            onChange={(e) => updateNeed('menemukan', e.target.value)}
                            className="min-h-[60px] bg-white border-orange-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. Through a mentor's sacrifice, they realize..."
                        />
                    </div>

                    {/* Stage 3: Menerima */}
                    <div className="relative pl-6 border-l-2 border-orange-300">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">3</span>
                        </div>
                        <Label className="text-[10px] text-orange-600 font-bold uppercase">Menerima</Label>
                        <p className="text-[9px] text-gray-400 mb-1">How do they accept/embrace this change?</p>
                        <Textarea
                            value={needStages.menerima || ''}
                            onChange={(e) => updateNeed('menerima', e.target.value)}
                            className="min-h-[60px] bg-white border-orange-200 text-gray-700 text-xs resize-none"
                            placeholder="e.g. They open up to their companions and ask for help..."
                        />
                    </div>

                    {/* Stage 4: Terpenuhi */}
                    <div className="relative pl-6">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white">4</span>
                        </div>
                        <Label className="text-[10px] text-orange-600 font-bold uppercase mb-2 block">Terpenuhi?</Label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => updateNeed('terpenuhi', true)}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${needStages.terpenuhi === true
                                        ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                                    }`}
                            >
                                <Check className="h-4 w-4" />
                                <span className="text-xs font-bold">Yes</span>
                            </button>
                            <button
                                onClick={() => updateNeed('terpenuhi', false)}
                                className={`flex-1 p-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${needStages.terpenuhi === false
                                        ? 'border-red-400 bg-red-50 text-red-600'
                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-500'
                                    }`}
                            >
                                <X className="h-4 w-4" />
                                <span className="text-xs font-bold">No</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ending Matrix Summary */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-gray-500 font-bold uppercase">Story Ending Matrix</Label>
                    <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={`${wantStages.tercapai ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : wantStages.tercapai === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            Want: {wantStages.tercapai === true ? '✓' : wantStages.tercapai === false ? '✗' : '?'}
                        </Badge>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <Badge variant="outline" className={`${needStages.terpenuhi ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : needStages.terpenuhi === false ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                            Need: {needStages.terpenuhi === true ? '✓' : needStages.terpenuhi === false ? '✗' : '?'}
                        </Badge>
                    </div>
                </div>
                <div className="mt-2 text-[10px] text-gray-500">
                    {wantStages.tercapai === true && needStages.terpenuhi === true && (
                        <span className="text-emerald-600 font-bold">✨ Happy Ending: Character gets what they want AND what they need</span>
                    )}
                    {wantStages.tercapai === false && needStages.terpenuhi === true && (
                        <span className="text-amber-600 font-bold">💔 Bittersweet: Character doesn't get want, but grows internally</span>
                    )}
                    {wantStages.tercapai === true && needStages.terpenuhi === false && (
                        <span className="text-red-600 font-bold">⚠️ Hollow Victory: Character gets want but fails to grow</span>
                    )}
                    {wantStages.tercapai === false && needStages.terpenuhi === false && (
                        <span className="text-gray-600 font-bold">💀 Tragic: Character fails on both fronts</span>
                    )}
                    {(wantStages.tercapai === undefined || needStages.terpenuhi === undefined) && (
                        <span className="text-gray-400">Select outcomes above to see ending type</span>
                    )}
                </div>
            </div>
        </div>
    );
}
