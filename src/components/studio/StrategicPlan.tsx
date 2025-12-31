'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Loader2, Save, Sparkles, BarChart3, TrendingUp, Target, Users, Share2,
  DollarSign, Building, Zap, Handshake, Wallet, Film, User, Award, Star,
  Heart, TrendingDown, Crown, Globe, BookOpen, Lightbulb, Flag, Coins,
  MessageCircle, PlayCircle, Grid, Layers
} from 'lucide-react';
import { ProgressBar } from './ProgressBar';
import { CompactInput } from './CompactInput';
import { toast } from '@/lib/sweetalert';
import { CollapsibleSection } from './CollapsibleSection';

interface StrategicPlanProps {
  projectId: string;
  userId: string;
  initialData?: any;
  onSave?: (data: any) => void;
}

export function StrategicPlan({ projectId, userId, initialData, onSave }: StrategicPlanProps) {
  const [activeTab, setActiveTab] = useState<'canvas' | 'performance'>('canvas');
  const [data, setData] = useState({
    // IP Business Model Canvas - 9 Sections
    customerSegments: '',
    valuePropositions: '',
    channels: '',
    customerRelationships: '',
    revenueStreams: '',
    keyResources: '',
    keyActivities: '',
    keyPartnerships: '',
    costStructure: '',

    // Performance Analysis - 15 Key Factors
    cast: '',
    director: '',
    producer: '',
    executiveProducer: '',
    distributor: '',
    publisher: '',
    titleBrandPositioning: '',
    themeStated: '',
    uniqueSelling: '',
    storyValues: '',
    fansLoyalty: '',
    productionBudget: '',
    promotionBudget: '',
    socialMediaEngagements: '',
    teaserTrailerEngagements: '',
    genre: '',

    // Performance Analysis - Additional Data
    competitorName: '',
    competitorScores: {},
    projectScores: {},
    predictedAudience: {},
    aiSuggestions: '',
  });

  const [saving, setSaving] = useState(false);
  const [generatingCanvas, setGeneratingCanvas] = useState(false);
  const [generatingPerformance, setGeneratingPerformance] = useState(false);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Generate ALL Business Model Canvas sections at once
  const handleGenerateAllCanvas = async () => {
    setGeneratingCanvas(true);
    try {
      const response = await fetch('/api/ai/generate-strategic-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          section: 'businessModelCanvas',
          projectContext: data.genre ? `Genre: ${data.genre}` : '',
          generateAll: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const result = await response.json();

      if (result.content) {
        const parsed = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        setData(prev => ({
          ...prev,
          customerSegments: parsed.customerSegments || prev.customerSegments,
          valuePropositions: parsed.valuePropositions || prev.valuePropositions,
          channels: parsed.channels || prev.channels,
          customerRelationships: parsed.customerRelationships || prev.customerRelationships,
          revenueStreams: parsed.revenueStreams || prev.revenueStreams,
          keyResources: parsed.keyResources || prev.keyResources,
          keyActivities: parsed.keyActivities || prev.keyActivities,
          keyPartnerships: parsed.keyPartnerships || prev.keyPartnerships,
          costStructure: parsed.costStructure || prev.costStructure,
        }));
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      toast.error('Failed to generate Business Model Canvas. Please try again.');
    } finally {
      setGeneratingCanvas(false);
    }
  };

  // Generate ALL Performance Analysis fields at once
  const handleGenerateAllPerformance = async () => {
    setGeneratingPerformance(true);
    try {
      const response = await fetch('/api/ai/generate-strategic-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          section: 'performanceAnalysis',
          projectContext: data.genre ? `Genre: ${data.genre}` : '',
          generateAll: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const result = await response.json();

      if (result.content) {
        const parsed = typeof result.content === 'string' ? JSON.parse(result.content) : result.content;
        setData(prev => ({
          ...prev,
          cast: parsed.cast || prev.cast,
          director: parsed.director || prev.director,
          producer: parsed.producer || prev.producer,
          executiveProducer: parsed.executiveProducer || prev.executiveProducer,
          distributor: parsed.distributor || prev.distributor,
          publisher: parsed.publisher || prev.publisher,
          titleBrandPositioning: parsed.titleBrandPositioning || prev.titleBrandPositioning,
          themeStated: parsed.themeStated || prev.themeStated,
          uniqueSelling: parsed.uniqueSelling || prev.uniqueSelling,
          storyValues: parsed.storyValues || prev.storyValues,
          fansLoyalty: parsed.fansLoyalty || prev.fansLoyalty,
          productionBudget: parsed.productionBudget || prev.productionBudget,
          promotionBudget: parsed.promotionBudget || prev.promotionBudget,
          socialMediaEngagements: parsed.socialMediaEngagements || prev.socialMediaEngagements,
          teaserTrailerEngagements: parsed.teaserTrailerEngagements || prev.teaserTrailerEngagements,
        }));
      }
    } catch (error) {
      console.error('Error generating performance:', error);
      toast.error('Failed to generate Performance Analysis. Please try again.');
    } finally {
      setGeneratingPerformance(false);
    }
  };

  const handlePredict = async () => {
    setPredicting(true);
    try {
      const performaData = {
        cast: data.cast,
        director: data.director,
        producer: data.producer,
        executiveProducer: data.executiveProducer,
        distributor: data.distributor,
        publisher: data.publisher,
        titleBrandPositioning: data.titleBrandPositioning,
        themeStated: data.themeStated,
        uniqueSelling: data.uniqueSelling,
        storyValues: data.storyValues,
        fansLoyalty: data.fansLoyalty,
        productionBudget: data.productionBudget,
        promotionBudget: data.promotionBudget,
        socialMediaEngagements: data.socialMediaEngagements,
        teaserTrailerEngagements: data.teaserTrailerEngagements,
        genre: data.genre,
      };

      const response = await fetch('/api/ai/predict-performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          competitorName: data.competitorName,
          performaData,
        }),
      });

      if (!response.ok) throw new Error('Failed to predict performance');

      const result = await response.json();
      setData(prev => ({
        ...prev,
        projectScores: result.analysis.projectScores,
        competitorScores: result.analysis.competitorScores || {},
        predictedAudience: result.analysis.predictedAudience,
        aiSuggestions: result.analysis.suggestions?.join('\n') || '',
      }));
    } catch (error) {
      console.error('Error predicting performance:', error);
      toast.error('Failed to predict performance. Please try again.');
    } finally {
      setPredicting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/strategic-plan?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');

      const result = await response.json();
      onSave?.(result);
      toast.success('Strategic plan saved successfully!');
    } catch (error) {
      console.error('Error saving strategic plan:', error);
      toast.error('Failed to save strategic plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate progress calculations...
  const canvasFields = [
    'customerSegments', 'valuePropositions', 'channels', 'customerRelationships',
    'revenueStreams', 'keyResources', 'keyActivities', 'keyPartnerships', 'costStructure'
  ];
  const filledCanvasFields = canvasFields.filter(f => (data as any)[f]?.trim()).length;
  const canvasProgress = Math.round((filledCanvasFields / canvasFields.length) * 100);

  const performanceFields = [
    'cast', 'director', 'producer', 'executiveProducer', 'distributor', 'publisher',
    'titleBrandPositioning', 'themeStated', 'uniqueSelling', 'storyValues', 'fansLoyalty',
    'productionBudget', 'promotionBudget', 'socialMediaEngagements', 'teaserTrailerEngagements'
  ];
  const filledPerformanceFields = performanceFields.filter(f => (data as any)[f]?.trim()).length;
  const performanceProgress = Math.round((filledPerformanceFields / performanceFields.length) * 100);

  return (
    <div className="space-y-6">
      {/* IMPROVED GLASS HEADER */}
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-400/20 to-pink-500/20 blur-3xl rounded-full -translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Strategic Plan
            <span className="text-xs font-normal px-2 py-0.5 bg-orange-100/50 text-orange-700 rounded-full border border-orange-200/50">PRO</span>
          </h2>
          <p className="text-sm font-medium text-gray-500 mt-1 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            IP Business Intelligence
          </p>
        </div>

        <div className="relative z-10 flex gap-3">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/30 hover:-translate-y-0.5 transition-all"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      {/* FLOATING TAB SWITCHER */}
      <div className="sticky top-4 z-20 flex justify-center mb-8">
        <div className="glass-panel p-1.5 rounded-full flex gap-2 shadow-xl shadow-black/5 transform hover:scale-[1.02] transition-transform">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'canvas'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            onClick={() => setActiveTab('canvas')}
          >
            <Grid className="w-3.5 h-3.5" />
            Business Model
          </button>
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === 'performance'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
              : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            onClick={() => setActiveTab('performance')}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Performance Analysis
          </button>
        </div>
      </div>

      <div className="animate-slideIn relative z-10">
        {activeTab === 'canvas' ? (
          <BusinessModelCanvas
            data={data}
            onChange={handleChange}
            onGenerateAll={handleGenerateAllCanvas}
            generating={generatingCanvas}
            progress={canvasProgress}
            filledFields={filledCanvasFields}
            totalFields={canvasFields.length}
          />
        ) : (
          <PerformanceAnalysis
            data={data}
            onChange={handleChange}
            onGenerateAll={handleGenerateAllPerformance}
            generating={generatingPerformance}
            onPredict={handlePredict}
            predicting={predicting}
            progress={performanceProgress}
            filledFields={filledPerformanceFields}
            totalFields={performanceFields.length}
          />
        )}
      </div>
    </div>
  );
}

function BusinessModelCanvas({ data, onChange, onGenerateAll, generating, progress, filledFields, totalFields }: any) {
  // Bento Grid Definition
  const sections = [
    { id: 'keyPartnerships', title: 'Key Partnerships', color: 'green', icon: Handshake, grid: 'md:col-span-2 md:row-span-2' },
    { id: 'keyActivities', title: 'Key Activities', color: 'cyan', icon: Zap, grid: 'md:col-span-2' },
    { id: 'keyResources', title: 'Key Resources', color: 'blue', icon: Building, grid: 'md:col-span-2' },
    { id: 'valuePropositions', title: 'Value Propositions', color: 'orange', icon: Target, grid: 'md:col-span-2 md:row-span-2' },
    { id: 'customerRelationships', title: 'Relationships', color: 'pink', icon: Heart, grid: 'md:col-span-2' },
    { id: 'channels', title: 'Channels', color: 'purple', icon: Share2, grid: 'md:col-span-2' },
    { id: 'customerSegments', title: 'Customer Segments', color: 'rose', icon: Users, grid: 'md:col-span-2 md:row-span-2' },
    { id: 'costStructure', title: 'Cost Structure', color: 'gray', icon: Wallet, grid: 'md:col-span-6' },
    { id: 'revenueStreams', title: 'Revenue Streams', color: 'emerald', icon: DollarSign, grid: 'md:col-span-6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
            <div className="h-4 w-[1px] bg-gray-300 mx-1" />
            <span className="text-lg font-black text-orange-600">{progress}%</span>
          </div>
        </div>
        <Button
          onClick={onGenerateAll}
          disabled={generating}
          className="rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 shadow-sm transition-all"
        >
          {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4 text-orange-500" />}
          Auto-Fill Canvas
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {sections.map((section) => (
          <div key={section.id} className={`${section.grid} glass-card rounded-2xl p-5 flex flex-col group hover:ring-2 hover:ring-orange-200 transition-all`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-lg bg-${section.color}-50 text-${section.color}-600 group-hover:scale-110 transition-transform`}>
                <section.icon className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-gray-800 text-sm group-hover:text-orange-600 transition-colors">{section.title}</h3>
            </div>
            <Textarea
              value={data[section.id] || ''}
              onChange={(e) => onChange(section.id, e.target.value)}
              placeholder={`Define ${section.title.toLowerCase()}...`}
              className="flex-1 bg-white/50 border border-transparent hover:border-orange-100 focus:border-orange-300 rounded-lg p-3 resize-none text-gray-700 text-sm focus:ring-2 focus:ring-orange-100 placeholder:text-gray-400 leading-relaxed transition-all"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PerformanceAnalysis({ data, onChange, onGenerateAll, generating, onPredict, predicting, progress, filledFields, totalFields }: any) {
  const factors = [
    { id: 'cast', label: 'Cast', icon: Film },
    { id: 'director', label: 'Director', icon: User },
    { id: 'producer', label: 'Producer', icon: Award },
    { id: 'executiveProducer', label: 'Exec. Producer', icon: Star },
    { id: 'distributor', label: 'Distributor', icon: Share2 },
    { id: 'publisher', label: 'Publisher', icon: BookOpen },
    { id: 'titleBrandPositioning', label: 'Brand Positioning', icon: Target },
    { id: 'themeStated', label: 'Theme', icon: Lightbulb },
    { id: 'uniqueSelling', label: 'USP', icon: Flag },
    { id: 'storyValues', label: 'Values', icon: Heart },
    { id: 'fansLoyalty', label: 'Loyalty', icon: Crown },
    { id: 'productionBudget', label: 'Prod. Budget', icon: Coins },
    { id: 'promotionBudget', label: 'Promo Budget', icon: TrendingDown },
    { id: 'socialMediaEngagements', label: 'Social Engagement', icon: MessageCircle },
    { id: 'teaserTrailerEngagements', label: 'Trailer Engagement', icon: PlayCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 rounded-2xl border-l-4 border-orange-500">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Predictive Analytics Engine</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              AI computes success probability by analyzing 15 key performance factors against market benchmarks.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              onClick={onGenerateAll}
              disabled={generating}
              variant="outline"
              className="rounded-xl border-orange-200 text-orange-600 hover:bg-orange-50"
            >
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Layers className="mr-2 h-4 w-4" />}
              Generate Data
            </Button>
            <Button
              onClick={onPredict}
              disabled={predicting || filledFields === 0}
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/40 hover:-translate-y-0.5 transition-all"
            >
              {predicting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
              Run Prediction
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {factors.map((factor) => (
          <div key={factor.id} className="glass-card p-4 rounded-xl flex flex-col gap-2 hover:border-orange-300/50 transition-colors">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <factor.icon className="h-3.5 w-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider">{factor.label}</span>
            </div>
            <CompactInput
              value={data[factor.id] || ''}
              onChange={(value) => onChange(factor.id, value)}
              placeholder="..."
              className="bg-white/50 border border-gray-200 hover:border-orange-300 focus:border-orange-500 rounded-md px-3 py-2 text-sm font-medium shadow-sm focus:ring-2 focus:ring-orange-100 transition-all"
            />
          </div>
        ))}
      </div>

      {/* Analytics Results Visualization */}
      {(data.projectScores && Object.keys(data.projectScores).length > 0) && (
        <div className="mt-8 animate-slideIn">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            Performance Report
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Score Matrix</h4>
              <div className="space-y-3">
                {factors.slice(0, 8).map(f => {
                  const pScore = (data.projectScores as any)[f.id] || 0;
                  const cScore = (data.competitorScores as any)[f.id] || 0;
                  return (
                    <div key={f.id} className="group">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">{f.label}</span>
                        <span className="font-mono text-gray-400">{pScore} vs {cScore}</span>
                      </div>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex relative">
                        <div style={{ width: `${pScore * 10}%` }} className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full relative z-10 transition-all duration-500" />
                        <div style={{ width: `${cScore * 10}%` }} className="bg-gray-300 h-full rounded-full absolute top-0 left-0 opacity-50" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="space-y-6">
              {/* Audience Prediction Card */}
              <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-blue-50/50 border-indigo-100">
                <h4 className="flex items-center gap-2 text-indigo-700 font-bold mb-4">
                  <Users className="w-4 h-4" /> Audience Projection
                </h4>
                <div className="text-4xl font-black text-indigo-900 mb-2">
                  {(data.predictedAudience as any).size || 'Calculating...'}
                </div>
                <p className="text-xs text-indigo-600/70 leading-relaxed">
                  {(data.predictedAudience as any).demographics?.join(', ')}
                </p>
              </div>

              {/* AI Insight Card */}
              <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-100">
                <h4 className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
                  <Lightbulb className="w-4 h-4" /> Strategic Insight
                </h4>
                <p className="text-sm text-emerald-800 leading-relaxed italic">
                  "{data.aiSuggestions || 'No suggestions yet.'}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
