'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
    FileText, Wand2, Loader2, ChevronLeft, ChevronRight,
    Download, Printer, BookOpen, RefreshCw, Settings2, X, Pencil, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast, alert } from '@/lib/sweetalert';
import { generateScreenplayPDF } from '@/lib/generate-screenplay-pdf';
import { ScenePlot } from '@/types/storyboard';

interface ScreenplayViewProps {
    projectId: string;
    storyVersionId?: string; // Required for loading scene plots
    projectName: string;
    projectImage?: string;
    userId: string;
    scenes?: ScenePlot[]; // Optional - will load from API if not provided
    onRefresh?: () => void;
}

interface SceneScript {
    sceneId: string;
    sceneNumber: number;
    title: string;
    content: string;
    hasScript: boolean;
    synopsis?: string;
}

// Script generation preferences - SIMPLIFIED
interface ScriptPreferences {
    scriptStyle: string; // 'concise' | 'balanced' | 'detailed' | 'cinematic'
    sceneDuration: string; // '30' | '60' | '90' | '120' (in seconds)
    customInstructions: string; // Free text for additional instructions
}

const DEFAULT_PREFERENCES: ScriptPreferences = {
    scriptStyle: 'balanced',
    sceneDuration: '60',
    customInstructions: ''
};

export function ScreenplayView({
    projectId,
    storyVersionId,
    projectName,
    projectImage,
    userId,
    scenes: propsScenes,
    onRefresh
}: ScreenplayViewProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [sceneScripts, setSceneScripts] = useState<SceneScript[]>([]);
    const [scenes, setScenes] = useState<ScenePlot[]>(propsScenes || []);
    const [isLoading, setIsLoading] = useState(true);
    const printRef = useRef<HTMLDivElement>(null);

    // Script preferences state
    const [showPreferencesModal, setShowPreferencesModal] = useState(false);
    const [scriptPreferences, setScriptPreferences] = useState<ScriptPreferences>(DEFAULT_PREFERENCES);

    // Script edit modal state
    const [editingScript, setEditingScript] = useState<SceneScript | null>(null);
    const [editContent, setEditContent] = useState('');
    const [isSavingScript, setIsSavingScript] = useState(false);

    // Load scenes from API if not provided via props
    const loadScenesFromAPI = useCallback(async () => {
        if (propsScenes && propsScenes.length > 0) {
            setScenes(propsScenes);
            return propsScenes;
        }

        try {
            // Build API URL with storyVersionId if available
            let apiUrl = `/api/scene-plots?projectId=${projectId}`;
            if (storyVersionId) {
                apiUrl += `&storyVersionId=${storyVersionId}`;
            }

            console.log('[ScreenplayView] Loading scenes from:', apiUrl);

            const res = await fetch(apiUrl);
            if (res.ok) {
                const data = await res.json();
                const loadedScenes = data.scenes || [];
                console.log('[ScreenplayView] API returned scenes:', loadedScenes.length);
                setScenes(loadedScenes);
                return loadedScenes;
            }
        } catch (error) {
            console.error('Error loading scenes:', error);
        }
        return [];
    }, [projectId, storyVersionId, propsScenes]);

    // Load all scene scripts - OPTIMIZED: uses only list API data, no individual calls
    const loadScripts = useCallback(async () => {
        setIsLoading(true);

        // Load scenes from list API (single call)
        const scenesToUse = await loadScenesFromAPI();

        console.log('[ScreenplayView] Loaded scenes:', scenesToUse.length);

        if (scenesToUse.length === 0) {
            setSceneScripts([]);
            setIsLoading(false);
            return;
        }

        // Map directly from list API data - no individual scene calls needed!
        // The list API already returns: synopsis, title, active_script_version
        const scripts: SceneScript[] = scenesToUse.map((scene: any) => {
            const activeScript = scene.active_script_version;
            const sceneSynopsis = scene.synopsis || '';

            return {
                sceneId: scene.id,
                sceneNumber: scene.scene_number,
                title: scene.title || `Scene ${scene.scene_number}`,
                content: activeScript?.script_content || '',
                hasScript: !!activeScript,
                synopsis: sceneSynopsis
            };
        });

        console.log('[ScreenplayView] Script status:', scripts.map(s => ({
            sceneNumber: s.sceneNumber,
            hasScript: s.hasScript,
            hasSynopsis: !!s.synopsis
        })));

        setSceneScripts(scripts);
        setIsLoading(false);
    }, [loadScenesFromAPI]);

    useEffect(() => {
        loadScripts();
    }, [loadScripts]);

    // Generate script for a scene
    const handleGenerateScript = async (sceneId: string) => {
        const sceneScript = sceneScripts.find(s => s.sceneId === sceneId);
        const scene = scenes.find(s => s.id === sceneId);
        if (!sceneScript?.synopsis && !scene?.synopsis) {
            toast.warning('Scene needs a plot synopsis first');
            return;
        }

        setIsGenerating(sceneId);
        try {
            const res = await fetch(`/api/scene-plots/${sceneId}/generate-script`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to generate script');
            }

            toast.success('Script generated!');
            await loadScripts();
            onRefresh?.();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsGenerating(null);
        }
    };

    // Generate all scripts using batch API - generates for ALL scenes (creates new versions if exists)
    const [generateProgress, setGenerateProgress] = useState<{ current: number; total: number; batch: number; totalBatches: number } | null>(null);
    const [pendingSceneIds, setPendingSceneIds] = useState<string[]>([]);

    // Open preferences modal before generating
    const handleGenerateAll = () => {
        // Find ALL scenes that have synopsis (from scene 1 to last) - sort by scene number
        const scenesWithSynopsis = sceneScripts
            .filter(s => s.synopsis)
            .sort((a, b) => a.sceneNumber - b.sceneNumber);

        console.log('[ScreenplayView] Scenes with synopsis:', scenesWithSynopsis.length);

        if (scenesWithSynopsis.length === 0) {
            toast.info('Belum ada scene plot yang dibuat. Generate scene plot terlebih dahulu.');
            return;
        }

        // Store scene IDs and show preferences modal
        setPendingSceneIds(scenesWithSynopsis.map(s => s.sceneId));
        setShowPreferencesModal(true);
    };

    // Execute generation with preferences
    const executeGenerateAll = async () => {
        const scenesWithSynopsis = sceneScripts
            .filter(s => pendingSceneIds.includes(s.sceneId))
            .sort((a, b) => a.sceneNumber - b.sceneNumber);

        const BATCH_SIZE = 5;
        const totalBatches = Math.ceil(scenesWithSynopsis.length / BATCH_SIZE);

        setShowPreferencesModal(false);
        setIsGenerating('all');
        let totalGenerated = 0;
        let totalCreditsUsed = 0;

        try {
            // Process in batches of 5 from frontend
            for (let i = 0; i < scenesWithSynopsis.length; i += BATCH_SIZE) {
                const batch = scenesWithSynopsis.slice(i, i + BATCH_SIZE);
                const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
                const sceneIds = batch.map(s => s.sceneId);

                setGenerateProgress({
                    current: i,
                    total: scenesWithSynopsis.length,
                    batch: batchNumber,
                    totalBatches
                });

                console.log(`[ScreenplayView] Processing batch ${batchNumber}/${totalBatches} with preferences:`, scriptPreferences);

                const res = await fetch('/api/scene-scripts/generate-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        userId,
                        sceneIds,
                        // Pass simplified preferences to API
                        preferences: {
                            scriptStyle: scriptPreferences.scriptStyle,
                            sceneDuration: scriptPreferences.sceneDuration,
                            customInstructions: scriptPreferences.customInstructions
                        }
                    })
                });

                if (!res.ok) {
                    const error = await res.json();
                    console.error(`Batch ${batchNumber} failed:`, error);
                    toast.error(`Batch ${batchNumber} failed: ${error.error}`);
                    break; // Stop on error
                }

                const result = await res.json();
                totalGenerated += result.generated || 0;
                totalCreditsUsed += result.creditsUsed || 0;

                // Update progress after each batch
                setGenerateProgress({
                    current: Math.min(i + BATCH_SIZE, scenesWithSynopsis.length),
                    total: scenesWithSynopsis.length,
                    batch: batchNumber,
                    totalBatches
                });
            }

            // Reload scripts after all batches complete
            await loadScripts();
            onRefresh?.();

            // Success toast
            toast.success(`${totalGenerated}/${scenesWithSynopsis.length} scripts generated! (${totalCreditsUsed} credits used)`);
        } catch (error: any) {
            console.error('Batch script generation error:', error);
            toast.error(error.message || 'Failed to generate scripts');
        } finally {
            setIsGenerating(null);
            setGenerateProgress(null);
        }
    };

    // Calculate virtual pages - each scene may span multiple pages
    // Reduced to 30 to account for text wrapping and scene headers
    const LINES_PER_PAGE = 30;

    const calculateScenePages = useCallback((script: SceneScript) => {
        if (!script.hasScript || !script.content) return 1;
        const lineCount = script.content.split('\n').length;
        return Math.max(1, Math.ceil(lineCount / LINES_PER_PAGE));
    }, []);

    // Build page map: [{ type: 'cover' | 'title' | 'scene', sceneIndex?, subPage? }]
    const pageMap = useMemo(() => {
        const map: Array<{ type: 'cover' | 'title' | 'scene'; sceneIndex?: number; subPage?: number; totalSubPages?: number }> = [
            { type: 'cover' },
            { type: 'title' }
        ];

        sceneScripts.forEach((script, idx) => {
            const pageCount = calculateScenePages(script);
            console.log(`[PageMap] Scene ${script.sceneNumber}: ${script.content?.split('\n').length || 0} lines -> ${pageCount} pages`);
            for (let i = 0; i < pageCount; i++) {
                map.push({
                    type: 'scene',
                    sceneIndex: idx,
                    subPage: i + 1,
                    totalSubPages: pageCount
                });
            }
        });

        console.log(`[PageMap] Total pages: ${map.length}`);
        return map;
    }, [sceneScripts, calculateScenePages]);

    const totalPages = pageMap.length;
    const hasAnyScript = sceneScripts.some(s => s.hasScript);

    // Open edit modal for a scene script
    const handleOpenEditModal = (script: SceneScript) => {
        setEditingScript(script);
        setEditContent(script.content || '');
    };

    // Save edited script
    const handleSaveScript = async () => {
        if (!editingScript) return;

        setIsSavingScript(true);
        try {
            const res = await fetch(`/api/scene-scripts/${editingScript.sceneId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    content: editContent
                })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save script');
            }

            // Update local state
            setSceneScripts(prev => prev.map(s =>
                s.sceneId === editingScript.sceneId
                    ? { ...s, content: editContent, hasScript: !!editContent }
                    : s
            ));

            toast.success('Script saved!');
            setEditingScript(null);
        } catch (error: any) {
            console.error('Save script error:', error);
            toast.error(error.message || 'Failed to save script');
        } finally {
            setIsSavingScript(false);
        }
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Handle export to PDF
    const [isExporting, setIsExporting] = useState(false);

    const handleExportPDF = async () => {
        if (sceneScripts.length === 0) {
            toast.info('No scenes to export');
            return;
        }

        setIsExporting(true);
        toast.info('Generating PDF...');

        try {
            const pdfBlob = await generateScreenplayPDF({
                projectName,
                projectImage,
                scenes: sceneScripts.map(s => ({
                    sceneNumber: s.sceneNumber,
                    title: s.title,
                    content: s.content,
                    hasScript: s.hasScript,
                    synopsis: s.synopsis
                }))
            });

            // Download the PDF
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${projectName.replace(/\s+/g, '_')}_Screenplay.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Screenplay PDF exported successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            toast.error('Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    // Render A4 page wrapper - FIXED height to enforce page boundaries
    const A4Page = ({ children, pageNumber }: { children: React.ReactNode; pageNumber: number }) => (
        <div
            className="bg-white shadow-2xl mx-auto mb-8 relative overflow-hidden"
            style={{
                width: '210mm',
                height: '297mm', // FIXED height
                padding: '25.4mm 25.4mm 25.4mm 38.1mm', // 1 inch margins, 1.5 inch left
                fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
                fontSize: '10pt', // Smaller font to fit more content
                lineHeight: '1.2',
                overflow: 'hidden', // Clip content that exceeds
            }}
        >
            {/* Page number (except cover) */}
            {pageNumber > 1 && (
                <div
                    className="absolute text-gray-500"
                    style={{ top: '12.7mm', right: '25.4mm', fontSize: '10pt' }}
                >
                    {pageNumber}
                </div>
            )}
            <div style={{ height: '100%', overflow: 'hidden' }}>
                {children}
            </div>
        </div>
    );

    // Render cover page - Full bleed image
    const renderCoverPage = () => (
        <div
            className="bg-white shadow-2xl mx-auto mb-8 relative overflow-hidden"
            style={{
                width: '210mm',
                height: '297mm',
                fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
            }}
        >
            {/* Full Page Cover Image */}
            {projectImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <img
                        src={projectImage}
                        alt={projectName}
                        className="max-w-full max-h-full object-contain"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </div>
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex flex-col items-center justify-center">
                    <BookOpen className="w-32 h-32 text-orange-300 mb-8" />
                    <h1
                        className="uppercase tracking-widest font-bold text-gray-800"
                        style={{ fontSize: '28pt', marginBottom: '8mm' }}
                    >
                        {projectName}
                    </h1>
                    <div
                        className="text-gray-500 italic"
                        style={{ fontSize: '16pt' }}
                    >
                        Screenplay
                    </div>
                </div>
            )}

            {/* Title overlay at bottom for images */}
            {projectImage && (
                <div
                    className="absolute bottom-0 left-0 right-0 p-8 text-center"
                    style={{
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        paddingTop: '60px'
                    }}
                >
                    <h1
                        className="uppercase tracking-widest font-bold text-white drop-shadow-lg"
                        style={{ fontSize: '24pt', marginBottom: '4mm' }}
                    >
                        {projectName}
                    </h1>
                    <div
                        className="text-gray-300 italic"
                        style={{ fontSize: '14pt' }}
                    >
                        Screenplay
                    </div>
                </div>
            )}
        </div>
    );

    // Render title page
    const renderTitlePage = () => (
        <A4Page pageNumber={2}>
            <div className="flex flex-col items-center justify-center h-full text-center" style={{ minHeight: '247mm' }}>
                <div
                    className="uppercase tracking-widest text-gray-900 font-bold"
                    style={{ fontSize: '18pt', marginBottom: '20mm' }}
                >
                    SCREENPLAY
                </div>

                <h1
                    className="uppercase tracking-wide font-bold text-gray-900"
                    style={{ fontSize: '24pt', marginBottom: '10mm' }}
                >
                    {projectName}
                </h1>

                <div
                    className="text-gray-500 mt-16"
                    style={{ fontSize: '12pt' }}
                >
                    {scenes.length} Scenes
                </div>

                <div
                    className="text-gray-400 mt-auto"
                    style={{ fontSize: '10pt' }}
                >
                    Generated by IP Creator Studio
                </div>
            </div>
        </A4Page>
    );

    // Parse screenplay content into formatted elements
    const renderScreenplayContent = (content: string) => {
        if (!content) return null;

        const lines = content.split('\n');
        const elements: React.ReactElement[] = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            // Scene Heading (INT./EXT.)
            if (trimmedLine.match(/^(INT\.|EXT\.|INT\/EXT\.)/i)) {
                elements.push(
                    <div
                        key={index}
                        className="uppercase font-bold text-gray-900"
                        style={{ marginTop: '24pt', marginBottom: '12pt' }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Character Name (ALL CAPS at start of dialogue)
            else if (trimmedLine.match(/^[A-Z][A-Z\s]+$/) && trimmedLine.length < 40) {
                elements.push(
                    <div
                        key={index}
                        className="uppercase text-gray-900"
                        style={{
                            marginTop: '8pt',
                            marginLeft: '25.4mm', // 1 inch
                        }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Parenthetical
            else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
                elements.push(
                    <div
                        key={index}
                        className="text-gray-700 italic"
                        style={{
                            marginLeft: '20mm', // ~0.8 inch
                        }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Dialogue
            else if (elements.length > 0 && line.startsWith('    ') || line.startsWith('\t')) {
                elements.push(
                    <div
                        key={index}
                        className="text-gray-800"
                        style={{
                            marginLeft: '12.7mm', // 0.5 inch
                            marginRight: '10mm', // Small right margin
                            marginBottom: '8pt',
                        }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Action/Description
            else if (trimmedLine) {
                elements.push(
                    <div
                        key={index}
                        className="text-gray-800"
                        style={{ marginBottom: '6pt' }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Empty line
            else {
                elements.push(<div key={index} style={{ height: '8pt' }} />);
            }
        });

        return elements;
    };

    // Render scene page with subPage support
    const renderScenePage = (script: SceneScript, pageNumber: number, subPage: number = 1, totalSubPages: number = 1) => {
        // Calculate which lines to show on this subpage
        const lines = script.content ? script.content.split('\n') : [];
        const startLine = (subPage - 1) * LINES_PER_PAGE;
        const endLine = subPage * LINES_PER_PAGE;
        const pageLines = lines.slice(startLine, endLine);
        const pageContent = pageLines.join('\n');

        return (
            <A4Page key={`${script.sceneId}-${subPage}`} pageNumber={pageNumber}>
                {/* Scene Header - only on first subpage */}
                {subPage === 1 && (
                    <div
                        className="border-b-2 border-gray-300 pb-4 mb-6 flex items-start justify-between"
                        style={{ marginBottom: '20pt' }}
                    >
                        <div>
                            <div
                                className="uppercase tracking-widest text-gray-500"
                                style={{ fontSize: '10pt', marginBottom: '4pt' }}
                            >
                                SCENE {script.sceneNumber}
                            </div>
                            <h2
                                className="uppercase font-bold text-gray-900"
                                style={{ fontSize: '14pt' }}
                            >
                                {script.title}
                            </h2>
                        </div>
                        {/* Edit button in header */}
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditModal(script)}
                            className="text-gray-400 hover:text-orange-500 print:hidden -mt-1"
                        >
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                    </div>
                )}

                {/* Continuation indicator for subsequent pages */}
                {subPage > 1 && (
                    <div className="text-gray-500 italic mb-4" style={{ fontSize: '10pt' }}>
                        (Scene {script.sceneNumber} continued - Page {subPage}/{totalSubPages})
                    </div>
                )}

                {/* Script Content */}
                {script.hasScript && script.content ? (
                    <div className="screenplay-content">
                        {renderScreenplayContent(pageContent)}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <FileText className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg mb-4">Script belum tersedia</p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleOpenEditModal(script)}
                                variant="outline"
                                className="border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                            >
                                <Pencil className="w-4 h-4 mr-2" />
                                Tulis Manual
                            </Button>
                            <Button
                                onClick={() => handleGenerateScript(script.sceneId)}
                                disabled={isGenerating === script.sceneId}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                            >
                                {isGenerating === script.sceneId ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4 mr-2" />
                                        Generate AI
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </A4Page>
        );
    };

    // Get current page content using pageMap
    const getCurrentPageContent = () => {
        const page = pageMap[currentPage - 1];
        if (!page) return null;

        if (page.type === 'cover') return renderCoverPage();
        if (page.type === 'title') return renderTitlePage();

        if (page.type === 'scene' && page.sceneIndex !== undefined) {
            const script = sceneScripts[page.sceneIndex];
            if (script) {
                return renderScenePage(script, currentPage, page.subPage || 1, page.totalSubPages || 1);
            }
        }
        return null;
    };

    // Get current scene script for edit button
    const getCurrentSceneScript = (): SceneScript | null => {
        const page = pageMap[currentPage - 1];
        if (!page || page.type !== 'scene' || page.sceneIndex === undefined) return null;
        return sceneScripts[page.sceneIndex] || null;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                <span className="ml-3 text-gray-600">Loading screenplay...</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Script Preferences Modal */}
            <Dialog open={showPreferencesModal} onOpenChange={setShowPreferencesModal}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings2 className="w-5 h-5 text-orange-500" />
                            Script Generation Preferences
                        </DialogTitle>
                        <DialogDescription>
                            Sesuaikan preferensi sebelum generate {pendingSceneIds.length} scripts.
                            Estimasi credit: {pendingSceneIds.length * 4} credits.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Script Style */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Gaya Penulisan</Label>
                            <Select
                                value={scriptPreferences.scriptStyle}
                                onValueChange={(v) => setScriptPreferences(p => ({ ...p, scriptStyle: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="concise">Ringkas - Dialog singkat, action minimal</SelectItem>
                                    <SelectItem value="balanced">Seimbang - Dialog & action proporsional</SelectItem>
                                    <SelectItem value="detailed">Detail - Lebih banyak deskripsi & dialog</SelectItem>
                                    <SelectItem value="cinematic">Cinematic - Sangat visual & deskriptif</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Menentukan kepadatan dialog, panjang action lines, dan detail setting
                            </p>
                        </div>

                        {/* Scene Duration */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Target Durasi per Scene</Label>
                            <Select
                                value={scriptPreferences.sceneDuration}
                                onValueChange={(v) => setScriptPreferences(p => ({ ...p, sceneDuration: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="30">~30 detik (script pendek)</SelectItem>
                                    <SelectItem value="60">~1 menit (script standar)</SelectItem>
                                    <SelectItem value="90">~1.5 menit (script panjang)</SelectItem>
                                    <SelectItem value="120">~2 menit (script extended)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-gray-500">
                                Panjang script disesuaikan dengan durasi target
                            </p>
                        </div>

                        {/* Custom Instructions */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Instruksi Tambahan (opsional)</Label>
                            <Textarea
                                value={scriptPreferences.customInstructions}
                                onChange={(e) => setScriptPreferences(p => ({ ...p, customInstructions: e.target.value }))}
                                placeholder='Contoh: "Dialog lebih dramatis", "Lebih banyak humor", "Referensi style Tarantino", "Fokus konflik internal"...'
                                className="min-h-[80px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPreferencesModal(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={executeGenerateAll}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                        >
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate {pendingSceneIds.length} Scripts
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Script Edit Modal */}
            <Dialog open={!!editingScript} onOpenChange={(open) => !open && setEditingScript(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Pencil className="w-5 h-5 text-orange-500" />
                            Edit Script - Scene {editingScript?.sceneNumber}
                        </DialogTitle>
                        <DialogDescription>
                            {editingScript?.title || 'Untitled Scene'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden py-4">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder={`Tulis script untuk Scene ${editingScript?.sceneNumber}...

Format screenplay:
INT. LOKASI - WAKTU

Deskripsi action line.

NAMA KARAKTER
Dialog karakter...`}
                            className="w-full h-[60vh] font-mono text-sm resize-none"
                            style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
                        />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm text-gray-500">
                            {editContent.split('\n').length} baris • {editContent.length} karakter
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setEditingScript(null)}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleSaveScript}
                                disabled={isSavingScript}
                                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                            >
                                {isSavingScript ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Save className="w-4 h-4 mr-2" />
                                )}
                                Simpan Script
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Progress Modal */}
            {isGenerating === 'all' && generateProgress && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 relative">
                                <Loader2 className="w-16 h-16 animate-spin text-orange-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Generating Scripts...</h3>
                            <p className="text-gray-600 mb-2">
                                Batch {generateProgress.batch} / {generateProgress.totalBatches}
                            </p>
                            <p className="text-sm text-gray-500 mb-4">
                                {generateProgress.current} / {generateProgress.total} scenes
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-gradient-to-r from-orange-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.round((generateProgress.current / generateProgress.total) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">Mohon tunggu, jangan tutup halaman ini...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between bg-gray-100 rounded-xl p-4">
                <div className="flex items-center gap-4">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <span className="font-semibold text-gray-700">{projectName}</span>
                    <span className="text-sm text-gray-500">• {sceneScripts.length} scenes</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Button
                        onClick={loadScripts}
                        variant="ghost"
                        size="icon"
                        className="text-gray-600"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </Button>

                    <Button
                        onClick={handleGenerateAll}
                        disabled={!!isGenerating}
                        className="bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                    >
                        <Wand2 className="w-4 h-4 mr-2" />
                        {hasAnyScript ? 'Regenerate All' : 'Generate All Scripts'}
                    </Button>

                    <Button
                        onClick={handlePrint}
                        variant="outline"
                        className="border-gray-300"
                    >
                        <Printer className="w-4 h-4 mr-2" />
                        Print
                    </Button>

                    <Button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        variant="outline"
                        className="border-gray-300"
                    >
                        {isExporting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Export PDF
                    </Button>
                </div>
            </div>

            {/* Document Reader Layout - Left/Right Navigation */}
            <div className="flex items-center gap-4">
                {/* Left Navigation Arrow */}
                <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="lg"
                    className="h-40 px-3 rounded-xl border-gray-300 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-30"
                >
                    <ChevronLeft className="w-8 h-8 text-gray-600" />
                </Button>

                {/* A4 Page Display */}
                <div
                    className="flex-1"
                    ref={printRef}
                >
                    <div
                        className="flex flex-col items-center bg-gray-200 py-8 rounded-xl min-h-[500px]"
                        style={{ background: 'linear-gradient(to bottom, #e5e7eb, #d1d5db)' }}
                    >
                        {getCurrentPageContent()}
                    </div>
                </div>

                {/* Right Navigation Arrow */}
                <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="lg"
                    className="h-40 px-3 rounded-xl border-gray-300 hover:bg-orange-50 hover:border-orange-300 disabled:opacity-30"
                >
                    <ChevronRight className="w-8 h-8 text-gray-600" />
                </Button>
            </div>

            {/* Edit Current Scene Button - visible when on a scene page */}
            {getCurrentSceneScript() && (
                <div className="flex justify-center">
                    <Button
                        onClick={() => handleOpenEditModal(getCurrentSceneScript()!)}
                        variant="outline"
                        className="border-orange-400 text-orange-600 hover:bg-orange-50"
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit Script Scene {getCurrentSceneScript()?.sceneNumber}
                    </Button>
                </div>
            )}

            {/* Centered Pagination: << < 1 2 3 ... 10 11 12 ... 59 60 > >> */}
            <div className="flex items-center justify-center gap-1 py-4">
                {/* First Page */}
                <Button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                    className="px-2"
                >
                    &laquo;
                </Button>

                {/* Previous Page */}
                <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="ghost"
                    size="sm"
                    className="px-2"
                >
                    &lsaquo;
                </Button>

                {/* Page Numbers with smart ellipsis */}
                {(() => {
                    const pages: (number | string)[] = [];
                    const showPages = 3; // How many pages to show around current

                    // Always show first 3
                    for (let i = 1; i <= Math.min(3, totalPages); i++) {
                        pages.push(i);
                    }

                    // Ellipsis before current section if needed
                    if (currentPage > 5) {
                        pages.push('...');
                    }

                    // Pages around current (if not already in first 3)
                    for (let i = Math.max(4, currentPage - 1); i <= Math.min(totalPages - 3, currentPage + 1); i++) {
                        if (!pages.includes(i)) pages.push(i);
                    }

                    // Ellipsis after current section if needed
                    if (currentPage < totalPages - 4) {
                        pages.push('...');
                    }

                    // Always show last 3
                    for (let i = Math.max(totalPages - 2, 4); i <= totalPages; i++) {
                        if (!pages.includes(i) && i > 0) pages.push(i);
                    }

                    return pages.map((page, idx) => {
                        if (page === '...') {
                            return <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>;
                        }
                        return (
                            <Button
                                key={page}
                                onClick={() => setCurrentPage(page as number)}
                                variant={currentPage === page ? 'default' : 'ghost'}
                                size="sm"
                                className={`min-w-[32px] ${currentPage === page ? 'bg-orange-500 text-white' : ''}`}
                            >
                                {page}
                            </Button>
                        );
                    });
                })()}

                {/* Next Page */}
                <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                    className="px-2"
                >
                    &rsaquo;
                </Button>

                {/* Last Page */}
                <Button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    variant="ghost"
                    size="sm"
                    className="px-2"
                >
                    &raquo;
                </Button>
            </div>

            {/* Add Courier Prime font */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .screenplay-content, .screenplay-content * {
                        visibility: visible;
                    }
                }
            `}</style>
        </div>
    );
}
