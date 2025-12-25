'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles, BarChart3, TrendingUp, Target, Users, Share2, DollarSign, Building, Zap, Handshake, Wallet, Film, User, Award, Star, Heart, TrendingDown, Crown, Globe, BookOpen, Lightbulb, Flag, Coins, MessageCircle, PlayCircle } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ProgressBar } from './ProgressBar';
import { CompactInput } from './CompactInput';

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
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleGenerate = async (section: string) => {
    setGenerating(prev => ({ ...prev, [section]: true }));
    try {
      const response = await fetch('/api/ai/generate-strategic-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
          section,
          projectContext: data.genre ? `Genre: ${data.genre}` : '',
        }),
      });

      if (!response.ok) throw new Error('Failed to generate');

      const result = await response.json();
      setData(prev => ({ ...prev, [section]: result.content }));
    } catch (error) {
      console.error('Error generating section:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setGenerating(prev => ({ ...prev, [section]: false }));
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
      alert('Failed to predict performance. Please try again.');
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
      alert('Strategic plan saved successfully!');
    } catch (error) {
      console.error('Error saving strategic plan:', error);
      alert('Failed to save strategic plan. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate progress for IP Business Model Canvas
  const canvasFields = [
    'customerSegments', 'valuePropositions', 'channels', 'customerRelationships',
    'revenueStreams', 'keyResources', 'keyActivities', 'keyPartnerships', 'costStructure'
  ];
  const filledCanvasFields = canvasFields.filter(f => (data as any)[f]?.trim()).length;
  const canvasProgress = Math.round((filledCanvasFields / canvasFields.length) * 100);

  // Calculate progress for Performance Analysis
  const performanceFields = [
    'cast', 'director', 'producer', 'executiveProducer', 'distributor', 'publisher',
    'titleBrandPositioning', 'themeStated', 'uniqueSelling', 'storyValues', 'fansLoyalty',
    'productionBudget', 'promotionBudget', 'socialMediaEngagements', 'teaserTrailerEngagements'
  ];
  const filledPerformanceFields = performanceFields.filter(f => (data as any)[f]?.trim()).length;
  const performanceProgress = Math.round((filledPerformanceFields / performanceFields.length) * 100);

  return (
    <div className="space-y-4 bg-black/40 rounded-xl p-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Strategic Plan</h2>
          <p className="text-[10px] text-white/50 mt-0.5">IP Business Model Canvas & Performance Analysis</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePredict}
            disabled={predicting}
            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          >
            {predicting ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <TrendingUp className="mr-1.5 h-3 w-3" />
            )}
            <span className="text-[10px] font-medium">Predict</span>
          </Button>
          <Button 
            size="sm" 
            onClick={handleSave} 
            disabled={saving}
            className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
          >
            {saving ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-3 w-3" />
            )}
            <span className="text-[10px] font-medium">Save</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
        <button
          className={`flex-1 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'canvas' 
              ? 'bg-yellow-400/90 text-black' 
              : 'text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('canvas')}
        >
          Business Model
        </button>
        <button
          className={`flex-1 px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
            activeTab === 'performance' 
              ? 'bg-cyan-500/90 text-black' 
              : 'text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Analysis
        </button>
      </div>

      {activeTab === 'canvas' ? (
        <BusinessModelCanvas 
          data={data} 
          onChange={handleChange} 
          onGenerate={handleGenerate} 
          generating={generating}
          progress={canvasProgress}
          filledFields={filledCanvasFields}
          totalFields={canvasFields.length}
        />
      ) : (
        <PerformanceAnalysis 
          data={data} 
          onChange={handleChange} 
          onPredict={handlePredict}
          predicting={predicting}
          progress={performanceProgress}
          filledFields={filledPerformanceFields}
          totalFields={performanceFields.length}
        />
      )}
    </div>
  );
}

function BusinessModelCanvas({ data, onChange, onGenerate, generating, progress, filledFields, totalFields }: any) {
  const sections = [
    { id: 'customerSegments', title: 'Customer Segments', color: 'blue' as const, description: 'Who are your target customers?', icon: <Users className="h-3 w-3" /> },
    { id: 'valuePropositions', title: 'Value Propositions', color: 'green' as const, description: 'What value do you deliver?', icon: <Target className="h-3 w-3" /> },
    { id: 'channels', title: 'Channels', color: 'purple' as const, description: 'How do you reach customers?', icon: <Share2 className="h-3 w-3" /> },
    { id: 'customerRelationships', title: 'Customer Relationships', color: 'orange' as const, description: 'How do you interact with customers?', icon: <Heart className="h-3 w-3" /> },
    { id: 'revenueStreams', title: 'Revenue Streams', color: 'pink' as const, description: 'How do you generate revenue?', icon: <DollarSign className="h-3 w-3" /> },
    { id: 'keyResources', title: 'Key Resources', color: 'cyan' as const, description: 'What resources do you need?', icon: <Building className="h-3 w-3" /> },
    { id: 'keyActivities', title: 'Key Activities', color: 'indigo' as const, description: 'What activities are essential?', icon: <Zap className="h-3 w-3" /> },
    { id: 'keyPartnerships', title: 'Key Partnerships', color: 'teal' as const, description: 'Who are your key partners?', icon: <Handshake className="h-3 w-3" /> },
    { id: 'costStructure', title: 'Cost Structure', color: 'rose' as const, description: 'What are your main costs?', icon: <Wallet className="h-3 w-3" /> },
  ];

  const colorMap: Record<string, 'yellow' | 'cyan' | 'pink' | 'orange' | 'purple' | 'green' | 'blue' | 'gray'> = {
    blue: 'blue',
    green: 'green',
    purple: 'purple',
    orange: 'orange',
    pink: 'pink',
    cyan: 'cyan',
    indigo: 'purple',
    teal: 'green',
    rose: 'pink',
  };

  return (
    <div className="space-y-3">
      {/* Overall Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Overall Progress</span>
        <span className="text-[10px] text-yellow-400 font-bold">{progress}%</span>
      </div>
      <ProgressBar progress={progress} color="yellow" size="sm" />

      {/* Canvas Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {sections.map((section) => {
          const isFilled = data[section.id]?.trim();
          const sectionProgress = isFilled ? 100 : 0;
          
          return (
            <CollapsibleSection
              key={section.id}
              title={section.title}
              icon={section.icon}
              color={colorMap[section.color]}
              progress={sectionProgress}
              totalFields={1}
              filledFields={isFilled ? 1 : 0}
              defaultOpen={false}
            >
              <div className="space-y-2">
                <p className="text-[10px] text-white/40">{section.description}</p>
                <Textarea
                  value={data[section.id] || ''}
                  onChange={(e) => onChange(section.id, e.target.value)}
                  placeholder={`Describe ${section.title.toLowerCase()}...`}
                  rows={3}
                  className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-yellow-400/50 focus:ring-yellow-400/20"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerate(section.id)}
                  disabled={generating[section.id]}
                  className="w-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 h-7 text-[10px]"
                >
                  {generating[section.id] ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="mr-1 h-3 w-3" />
                  )}
                  Generate with AI
                </Button>
              </div>
            </CollapsibleSection>
          );
        })}
      </div>
    </div>
  );
}

function PerformanceAnalysis({ data, onChange, onPredict, predicting, progress, filledFields, totalFields }: any) {
  const factors = [
    { id: 'cast', label: 'Cast', color: 'yellow' as const, icon: <Film className="h-3 w-3" /> },
    { id: 'director', label: 'Director', color: 'cyan' as const, icon: <User className="h-3 w-3" /> },
    { id: 'producer', label: 'Producer', color: 'pink' as const, icon: <Award className="h-3 w-3" /> },
    { id: 'executiveProducer', label: 'Executive Producer', color: 'orange' as const, icon: <Star className="h-3 w-3" /> },
    { id: 'distributor', label: 'Distributor', color: 'purple' as const, icon: <Share2 className="h-3 w-3" /> },
    { id: 'publisher', label: 'Publisher', color: 'green' as const, icon: <BookOpen className="h-3 w-3" /> },
    { id: 'titleBrandPositioning', label: 'Title Brand Positioning', color: 'blue' as const, icon: <Target className="h-3 w-3" /> },
    { id: 'themeStated', label: 'Theme Stated', color: 'yellow' as const, icon: <Lightbulb className="h-3 w-3" /> },
    { id: 'uniqueSelling', label: 'Unique Selling Point', color: 'cyan' as const, icon: <Flag className="h-3 w-3" /> },
    { id: 'storyValues', label: 'Story Values', color: 'pink' as const, icon: <Heart className="h-3 w-3" /> },
    { id: 'fansLoyalty', label: 'Fans Loyalty', color: 'orange' as const, icon: <Crown className="h-3 w-3" /> },
    { id: 'productionBudget', label: 'Production Budget', color: 'purple' as const, icon: <Coins className="h-3 w-3" /> },
    { id: 'promotionBudget', label: 'Promotion Budget', color: 'green' as const, icon: <TrendingDown className="h-3 w-3" /> },
    { id: 'socialMediaEngagements', label: 'Social Media Engagements', color: 'blue' as const, icon: <MessageCircle className="h-3 w-3" /> },
    { id: 'teaserTrailerEngagements', label: 'Teaser Trailer Engagements', color: 'yellow' as const, icon: <PlayCircle className="h-3 w-3" /> },
  ];

  const colorMap: Record<string, 'yellow' | 'cyan' | 'pink' | 'orange' | 'purple' | 'green' | 'blue' | 'gray'> = {
    yellow: 'yellow',
    cyan: 'cyan',
    pink: 'pink',
    orange: 'orange',
    purple: 'purple',
    green: 'green',
    blue: 'blue',
  };

  return (
    <div className="space-y-3">
      {/* Overall Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Overall Progress</span>
        <span className="text-[10px] text-cyan-400 font-bold">{progress}%</span>
      </div>
      <ProgressBar progress={progress} color="cyan" size="sm" />

      {/* 15 Key Factors */}
      <CollapsibleSection
        title="15 Key Performance Factors"
        icon={<BarChart3 className="h-3 w-3" />}
        color="cyan"
        progress={progress}
        filledFields={filledFields}
        totalFields={totalFields}
        defaultOpen={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {factors.map((factor) => (
            <CompactInput
              key={factor.id}
              label={factor.label}
              value={data[factor.id] || ''}
              onChange={(value) => onChange(factor.id, value)}
              placeholder={`Enter ${factor.label.toLowerCase()}...`}
              color={colorMap[factor.color]}
              icon={factor.icon}
              size="sm"
            />
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onPredict}
          disabled={predicting}
          className="w-full mt-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 h-7 text-[10px]"
        >
          {predicting ? (
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
          ) : (
            <BarChart3 className="mr-1 h-3 w-3" />
          )}
          Analyze with AI
        </Button>
      </CollapsibleSection>

      {/* Competitor */}
      <CollapsibleSection
        title="Competitor Analysis"
        icon={<Globe className="h-3 w-3" />}
        color="orange"
        progress={data.competitorName ? 100 : 0}
        totalFields={1}
        filledFields={data.competitorName ? 1 : 0}
        defaultOpen={false}
      >
        <CompactInput
          label="Competitor Name"
          value={data.competitorName || ''}
          onChange={(value) => onChange('competitorName', value)}
          placeholder="e.g., Marvel Cinematic Universe"
          color="orange"
          icon={<Globe className="h-3 w-3" />}
          size="sm"
        />
      </CollapsibleSection>

      {/* Analysis Results */}
      {(data.projectScores && Object.keys(data.projectScores).length > 0) && (
        <CollapsibleSection
          title="Performance Analysis Results"
          icon={<TrendingUp className="h-3 w-3" />}
          color="green"
          progress={100}
          defaultOpen={true}
        >
          {/* Bar Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Score Comparison</span>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-blue-500" />
                  Project
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded bg-red-500" />
                  Competitor
                </span>
              </div>
            </div>
            {factors.map((factor) => {
              const projectScore = (data.projectScores as any)[factor.id] || 0;
              const competitorScore = (data.competitorScores as any)[factor.id] || 0;
              const maxScore = Math.max(projectScore, competitorScore, 10);
              
              return (
                <div key={factor.id} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-white/60">{factor.label}</span>
                    <span className="text-white/40">
                      {projectScore}/10 | {competitorScore}/10
                    </span>
                  </div>
                  <div className="flex gap-0.5 h-2">
                    <div 
                      className="bg-blue-500 rounded-l-sm transition-all"
                      style={{ width: `${(projectScore / maxScore) * 100}%` }}
                    />
                    <div 
                      className="bg-red-500 rounded-r-sm transition-all"
                      style={{ width: `${(competitorScore / maxScore) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Predicted Audience */}
          {data.predictedAudience && (
            <div className="space-y-2 mt-3">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Predicted Audience</span>
              <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                <p className="text-[10px] text-white/80">
                  <span className="text-cyan-400 font-bold">Size:</span> {(data.predictedAudience as any).size || 'N/A'}
                </p>
                {(data.predictedAudience as any).demographics && (
                  <div className="mt-2">
                    <span className="text-cyan-400 font-bold text-[10px]">Demographics:</span>
                    <ul className="list-disc list-inside text-[10px] text-white/60 mt-1 space-y-0.5">
                      {(data.predictedAudience as any).demographics.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Suggestions */}
          {data.aiSuggestions && (
            <div className="space-y-2 mt-3">
              <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">AI Suggestions</span>
              <div className="p-3 bg-cyan-500/5 rounded-lg border border-cyan-500/20">
                <pre className="text-[10px] text-white/70 whitespace-pre-wrap">{data.aiSuggestions}</pre>
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}
    </div>
  );
}
