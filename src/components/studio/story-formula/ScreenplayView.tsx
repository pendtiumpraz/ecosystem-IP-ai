'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    FileText, Wand2, Loader2, ChevronLeft, ChevronRight,
    Download, Printer, BookOpen, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast, alert } from '@/lib/sweetalert';
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

    const handleGenerateAll = async () => {
        // Find ALL scenes that have synopsis (from scene 1 to last) - sort by scene number
        const scenesWithSynopsis = sceneScripts
            .filter(s => s.synopsis)
            .sort((a, b) => a.sceneNumber - b.sceneNumber);

        console.log('[ScreenplayView] Scenes with synopsis:', scenesWithSynopsis.length);

        if (scenesWithSynopsis.length === 0) {
            toast.info('Belum ada scene plot yang dibuat. Generate scene plot terlebih dahulu.');
            return;
        }

        const BATCH_SIZE = 5;
        const totalBatches = Math.ceil(scenesWithSynopsis.length / BATCH_SIZE);

        // SweetAlert confirmation
        const { isConfirmed } = await alert.confirm(
            `Generate ${scenesWithSynopsis.length} Scripts?`,
            `Ini akan men-generate script untuk ${scenesWithSynopsis.length} scene dalam ${totalBatches} batch (5 scene per batch). Estimasi credit: ${scenesWithSynopsis.length * 4} credits.`,
            'Generate',
            'Batal'
        );

        if (!isConfirmed) return;

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

                console.log(`[ScreenplayView] Processing batch ${batchNumber}/${totalBatches} (scenes ${batch[0].sceneNumber}-${batch[batch.length - 1].sceneNumber})`);

                const res = await fetch('/api/scene-scripts/generate-batch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        projectId,
                        userId,
                        sceneIds
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

    // Total pages: Cover (1) + Title (2) + Scene pages (3+)
    const totalPages = 2 + sceneScripts.length;
    const hasAnyScript = sceneScripts.some(s => s.hasScript);

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    // Render A4 page wrapper
    const A4Page = ({ children, pageNumber }: { children: React.ReactNode; pageNumber: number }) => (
        <div
            className="bg-white shadow-2xl mx-auto mb-8 relative overflow-hidden"
            style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '25.4mm 25.4mm 25.4mm 38.1mm', // 1 inch margins, 1.5 inch left
                fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
                fontSize: '12pt',
                lineHeight: '1',
            }}
        >
            {/* Page number (except cover) */}
            {pageNumber > 1 && (
                <div
                    className="absolute text-gray-500"
                    style={{ top: '12.7mm', right: '25.4mm', fontSize: '12pt' }}
                >
                    {pageNumber}
                </div>
            )}
            {children}
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
                            marginTop: '12pt',
                            marginLeft: '88.9mm', // 3.5 inches
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
                            marginLeft: '78.74mm', // 3.1 inches
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
                            marginLeft: '63.5mm', // 2.5 inches
                            marginRight: '50.8mm', // 2 inches from right
                            marginBottom: '12pt',
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
                        style={{ marginBottom: '12pt' }}
                    >
                        {trimmedLine}
                    </div>
                );
            }
            // Empty line
            else {
                elements.push(<div key={index} style={{ height: '12pt' }} />);
            }
        });

        return elements;
    };

    // Render scene page
    const renderScenePage = (script: SceneScript, pageNumber: number) => (
        <A4Page key={script.sceneId} pageNumber={pageNumber}>
            {/* Scene Header */}
            <div
                className="border-b-2 border-gray-300 pb-4 mb-6"
                style={{ marginBottom: '20pt' }}
            >
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

            {/* Script Content */}
            {script.hasScript && script.content ? (
                <div className="screenplay-content">
                    {renderScreenplayContent(script.content)}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FileText className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg mb-4">Script belum di-generate</p>
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
                                Generate Script
                            </>
                        )}
                    </Button>
                </div>
            )}
        </A4Page>
    );

    // Get current page content
    const getCurrentPageContent = () => {
        if (currentPage === 1) return renderCoverPage();
        if (currentPage === 2) return renderTitlePage();

        const sceneIndex = currentPage - 3;
        if (sceneIndex >= 0 && sceneIndex < sceneScripts.length) {
            return renderScenePage(sceneScripts[sceneIndex], currentPage);
        }
        return null;
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

            {/* Page Info & Quick Jump */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setCurrentPage(1)}
                        variant={currentPage === 1 ? 'default' : 'ghost'}
                        size="sm"
                        className={currentPage === 1 ? 'bg-orange-500' : ''}
                    >
                        Cover
                    </Button>
                    <Button
                        onClick={() => setCurrentPage(2)}
                        variant={currentPage === 2 ? 'default' : 'ghost'}
                        size="sm"
                        className={currentPage === 2 ? 'bg-orange-500' : ''}
                    >
                        Title
                    </Button>
                </div>

                <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
                    <span className="text-gray-700 font-medium">
                        Page {currentPage} of {totalPages}
                    </span>
                </div>

                {/* Page Thumbnails */}
                <div className="flex gap-1 overflow-x-auto max-w-[300px]">
                    {sceneScripts.slice(0, 10).map((script, i) => (
                        <button
                            key={script.sceneId}
                            onClick={() => setCurrentPage(3 + i)}
                            className={`flex-shrink-0 w-8 h-10 rounded text-xs transition-all ${currentPage === 3 + i
                                ? 'bg-orange-500 text-white shadow-lg'
                                : script.hasScript
                                    ? 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                }`}
                        >
                            {script.sceneNumber}
                        </button>
                    ))}
                    {sceneScripts.length > 10 && (
                        <span className="text-gray-400 text-xs px-2 flex items-center">+{sceneScripts.length - 10}</span>
                    )}
                </div>
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
