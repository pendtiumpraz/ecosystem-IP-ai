'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Sparkles, BarChart3, TrendingUp } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Strategic Plan</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePredict}
            disabled={predicting}
          >
            {predicting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="mr-2 h-4 w-4" />
            )}
            Predict Performance
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'canvas' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('canvas')}
        >
          IP Business Model Canvas
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'performance' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('performance')}
        >
          Performance Analysis
        </button>
      </div>

      {activeTab === 'canvas' ? (
        <BusinessModelCanvas data={data} onChange={handleChange} onGenerate={handleGenerate} generating={generating} />
      ) : (
        <PerformanceAnalysis 
          data={data} 
          onChange={handleChange} 
          onPredict={handlePredict}
          predicting={predicting}
        />
      )}
    </div>
  );
}

function BusinessModelCanvas({ data, onChange, onGenerate, generating }: any) {
  const sections = [
    { id: 'customerSegments', title: 'Customer Segments', color: 'border-blue-500', description: 'Who are your target customers?' },
    { id: 'valuePropositions', title: 'Value Propositions', color: 'border-green-500', description: 'What value do you deliver?' },
    { id: 'channels', title: 'Channels', color: 'border-purple-500', description: 'How do you reach customers?' },
    { id: 'customerRelationships', title: 'Customer Relationships', color: 'border-orange-500', description: 'How do you interact with customers?' },
    { id: 'revenueStreams', title: 'Revenue Streams', color: 'border-pink-500', description: 'How do you generate revenue?' },
    { id: 'keyResources', title: 'Key Resources', color: 'border-cyan-500', description: 'What resources do you need?' },
    { id: 'keyActivities', title: 'Key Activities', color: 'border-indigo-500', description: 'What activities are essential?' },
    { id: 'keyPartnerships', title: 'Key Partnerships', color: 'border-teal-500', description: 'Who are your key partners?' },
    { id: 'costStructure', title: 'Cost Structure', color: 'border-rose-500', description: 'What are your main costs?' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card key={section.id} className={`border-t-4 ${section.color}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{section.title}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onGenerate(section.id)}
                  disabled={generating[section.id]}
                >
                  {generating[section.id] ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">{section.description}</p>
              <Textarea
                value={data[section.id] || ''}
                onChange={(e) => onChange(section.id, e.target.value)}
                placeholder={`Describe ${section.title.toLowerCase()}...`}
                rows={4}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PerformanceAnalysis({ data, onChange, onPredict, predicting }: any) {
  const factors = [
    { id: 'cast', label: 'Cast' },
    { id: 'director', label: 'Director' },
    { id: 'producer', label: 'Producer' },
    { id: 'executiveProducer', label: 'Executive Producer' },
    { id: 'distributor', label: 'Distributor' },
    { id: 'publisher', label: 'Publisher' },
    { id: 'titleBrandPositioning', label: 'Title Brand Positioning' },
    { id: 'themeStated', label: 'Theme Stated' },
    { id: 'uniqueSelling', label: 'Unique Selling Point' },
    { id: 'storyValues', label: 'Story Values' },
    { id: 'fansLoyalty', label: 'Fans Loyalty' },
    { id: 'productionBudget', label: 'Production Budget' },
    { id: 'promotionBudget', label: 'Promotion Budget' },
    { id: 'socialMediaEngagements', label: 'Social Media Engagements' },
    { id: 'teaserTrailerEngagements', label: 'Teaser Trailer Engagements' },
  ];

  return (
    <div className="space-y-6">
      {/* 15 Key Factors Input */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">15 Key Performance Factors</CardTitle>
            <Button
              variant="outline"
              onClick={onPredict}
              disabled={predicting}
            >
              {predicting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <BarChart3 className="mr-2 h-4 w-4" />
              )}
              Analyze
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {factors.map((factor) => (
              <div key={factor.id}>
                <label className="text-sm font-medium mb-1 block">{factor.label}</label>
                <Input
                  value={data[factor.id] || ''}
                  onChange={(e) => onChange(factor.id, e.target.value)}
                  placeholder={`Enter ${factor.label.toLowerCase()}...`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Competitor Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Competitor Name</label>
            <Input
              value={data.competitorName || ''}
              onChange={(e) => onChange('competitorName', e.target.value)}
              placeholder="e.g., Marvel Cinematic Universe"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {(data.projectScores && Object.keys(data.projectScores).length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bar Chart */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Score Comparison</h3>
              {factors.map((factor) => {
                const projectScore = (data.projectScores as any)[factor.id] || 0;
                const competitorScore = (data.competitorScores as any)[factor.id] || 0;
                const maxScore = Math.max(projectScore, competitorScore, 10);
                
                return (
                  <div key={factor.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{factor.label}</span>
                      <span>
                        Project: {projectScore}/10 | Competitor: {competitorScore}/10
                      </span>
                    </div>
                    <div className="flex gap-1 h-4">
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
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Predicted Audience</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Size:</strong> {(data.predictedAudience as any).size || 'N/A'}
                  </p>
                  {(data.predictedAudience as any).demographics && (
                    <div className="mt-2">
                      <strong>Demographics:</strong>
                      <ul className="list-disc list-inside text-sm mt-1">
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
              <div className="space-y-2">
                <h3 className="text-sm font-medium">AI Suggestions</h3>
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">{data.aiSuggestions}</pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
