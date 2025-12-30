'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles, Globe, MapPin, Building, Home, Clock, Mountain, Users, Lock, Crown, Briefcase, Scale, Flag, Check, X } from 'lucide-react';

interface UniverseFormulaProps {
  projectId: string;
  userId: string;
  initialData?: any;
  onSave?: (data: any) => void;
}

export function UniverseFormula({ projectId, userId, initialData, onSave }: UniverseFormulaProps) {
  const [data, setData] = useState({
    // Top Row - Locations
    workingOfficeSchool: '',
    townDistrictCity: '',
    neighborhoodEnvironment: '',

    // Left Column - Systems
    rulesOfWork: '',
    laborLaw: '',
    country: '',
    governmentSystem: '',

    // Center Column - Identity
    universeName: '',
    period: '',

    // Center Column - Visual
    environmentLandscape: '',
    societyAndSystem: '',
    privateInterior: '',

    // Center Column - Systems
    sociopoliticEconomy: '',
    socioculturalSystem: '',

    // Right Column - Private Spaces
    houseCastle: '',
    roomCave: '',
    familyInnerCircle: '',
    kingdomTribeCommunal: '',
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedField, setExpandedField] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-universe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          projectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const result = await response.json();

      if (result.content) {
        // Try to parse JSON response
        let parsed;
        try {
          let jsonText = result.content;
          // Remove markdown code blocks if present
          if (jsonText.includes('```')) {
            jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
          }
          parsed = JSON.parse(jsonText);
        } catch (e) {
          console.error('Failed to parse AI response:', e);
          alert('Gagal parse hasil AI. Coba generate ulang.');
          return;
        }

        // Update all fields from AI response
        setData(prev => ({
          ...prev,
          universeName: parsed.universeName || prev.universeName,
          period: parsed.period || prev.period,
          workingOfficeSchool: parsed.workingOfficeSchool || prev.workingOfficeSchool,
          townDistrictCity: parsed.townDistrictCity || prev.townDistrictCity,
          neighborhoodEnvironment: parsed.neighborhoodEnvironment || prev.neighborhoodEnvironment,
          rulesOfWork: parsed.rulesOfWork || prev.rulesOfWork,
          laborLaw: parsed.laborLaw || prev.laborLaw,
          country: parsed.country || prev.country,
          governmentSystem: parsed.governmentSystem || prev.governmentSystem,
          environmentLandscape: parsed.environmentLandscape || prev.environmentLandscape,
          societyAndSystem: parsed.societyAndSystem || prev.societyAndSystem,
          privateInterior: parsed.privateInterior || prev.privateInterior,
          sociopoliticEconomy: parsed.sociopoliticEconomy || prev.sociopoliticEconomy,
          socioculturalSystem: parsed.socioculturalSystem || prev.socioculturalSystem,
          houseCastle: parsed.houseCastle || prev.houseCastle,
          roomCave: parsed.roomCave || prev.roomCave,
          familyInnerCircle: parsed.familyInnerCircle || prev.familyInnerCircle,
          kingdomTribeCommunal: parsed.kingdomTribeCommunal || prev.kingdomTribeCommunal,
        }));
      }
    } catch (error: any) {
      console.error('Error generating universe formula:', error);
      alert(error.message || 'Gagal generate universe formula');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/universe?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');

      const result = await response.json();
      onSave?.(result);
      alert('Universe formula saved successfully!');
    } catch (error) {
      console.error('Error saving universe formula:', error);
      alert('Failed to save universe formula. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  // Clock positions for 13 fields in opposing clockwise layout
  const clockPositions = [
    // Top Row (12, 1, 2)
    { id: 'workingOfficeSchool', label: 'Working Office / School', position: 12, color: 'bg-orange-500', icon: <Briefcase className="h-5 w-5 text-white" /> },
    { id: 'townDistrictCity', label: 'Town / District / City', position: 1, color: 'bg-orange-500', icon: <Building className="h-5 w-5 text-white" /> },
    { id: 'neighborhoodEnvironment', label: 'Neighborhood / Environment', position: 2, color: 'bg-orange-500', icon: <MapPin className="h-5 w-5 text-white" /> },

    // Left Column (11, 10, 9)
    { id: 'rulesOfWork', label: 'Rules of Work', position: 11, color: 'bg-orange-400', icon: <Scale className="h-5 w-5 text-white" /> },
    { id: 'laborLaw', label: 'Labor Law', position: 10, color: 'bg-orange-400', icon: <Scale className="h-5 w-5 text-white" /> },
    { id: 'country', label: 'Country', position: 9, color: 'bg-orange-400', icon: <Globe className="h-5 w-5 text-white" /> },

    // Center - Identity
    { id: 'universeName', label: 'Universe Name', position: 'center', color: 'bg-orange-500', icon: <Globe className="h-5 w-5 text-white" /> },

    // Center - Visual (8, 7, 6)
    { id: 'environmentLandscape', label: 'Environment / Landscape', position: 8, color: 'bg-orange-300', icon: <Mountain className="h-5 w-5 text-white" /> },
    { id: 'societyAndSystem', label: 'Society & System', position: 7, color: 'bg-orange-300', icon: <Users className="h-5 w-5 text-white" /> },
    { id: 'privateInterior', label: 'Private / Interior', position: 6, color: 'bg-orange-300', icon: <Lock className="h-5 w-5 text-white" /> },

    // Center - Systems (5, 4)
    { id: 'sociopoliticEconomy', label: 'Sociopolitic & Economy', position: 5, color: 'bg-orange-400', icon: <Flag className="h-5 w-5 text-white" /> },
    { id: 'socioculturalSystem', label: 'Sociocultural System', position: 4, color: 'bg-orange-400', icon: <Users className="h-5 w-5 text-white" /> },

    // Right Column (3, 4)
    { id: 'houseCastle', label: 'House / Castle', position: 3, color: 'bg-orange-500', icon: <Home className="h-5 w-5 text-white" /> },
    { id: 'roomCave', label: 'Room / Cave', position: 4, color: 'bg-orange-500', icon: <Lock className="h-5 w-5 text-white" /> },
    { id: 'familyInnerCircle', label: 'Family / Inner Circle', position: 'center-right', color: 'bg-orange-500', icon: <Crown className="h-5 w-5 text-white" /> },
    { id: 'kingdomTribeCommunal', label: 'Kingdom / Tribe / Communal', position: 'bottom', color: 'bg-orange-500', icon: <Users className="h-5 w-5 text-white" /> },
  ];

  const getClockPosition = (position: number | string) => {
    const positions: Record<string, { top: string; left: string; transform: string; panelPosition: string }> = {
      '12': { top: '5%', left: '50%', transform: 'translate(-50%, -50%)', panelPosition: 'left-0 top-0' },
      '1': { top: '5%', left: '85%', transform: 'translate(-50%, -50%)', panelPosition: 'left-12 top-0' },
      '2': { top: '5%', left: '15%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      '11': { top: '25%', left: '8%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      '10': { top: '42%', left: '8%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      '9': { top: '58%', left: '8%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      '0': { top: '38%', left: '50%', transform: 'translate(-50%, -50%)', panelPosition: 'left-0 top-0' },
      '8': { top: '58%', left: '85%', transform: 'translate(-50%, -50%)', panelPosition: 'left-12 top-0' },
      '7': { top: '42%', left: '85%', transform: 'translate(-50%, -50%)', panelPosition: 'left-12 top-0' },
      '6': { top: '25%', left: '85%', transform: 'translate(-50%, -50%)', panelPosition: 'left-12 top-0' },
      '5': { top: '25%', left: '58%', transform: 'translate(-50%, -50%)', panelPosition: 'left-12 top-0' },
      '4': { top: '25%', left: '42%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      '3': { top: '58%', left: '15%', transform: 'translate(-50%, -50%)', panelPosition: 'right-12 top-0' },
      'center-right': { top: '58%', left: '50%', transform: 'translate(-50%, -50%)', panelPosition: 'left-0 top-0' },
      'bottom': { top: '85%', left: '50%', transform: 'translate(-50%, -50%)', panelPosition: 'left-0 top-12' },
    };
    return positions[String(position)] || positions['0'];
  };

  const calculateProgress = () => {
    const allFields = Object.keys(data);
    const filledFields = allFields.filter(f => (data as any)[f]?.trim()).length;
    return Math.round((filledFields / allFields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 border border-orange-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Universe Formula</h2>
          <p className="text-xs text-gray-500 mt-0.5">Clockwise Layout - 16 Fields</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span className="text-xs font-medium">Generate All with AI</span>
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            <span className="text-xs font-medium">Save</span>
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Overall Progress</span>
        <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-orange-600 font-bold min-w-[35px] text-right">{progress}%</span>
      </div>

      {/* Simple Grid Layout instead of complex clock */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-orange-50/50 rounded-lg border border-orange-100">
        {/* Center Identity */}
        <div className="lg:col-span-3 flex gap-4 justify-center">
          <div className="flex-1 max-w-xs">
            <label className="text-[10px] uppercase tracking-wider font-bold text-orange-600 flex items-center gap-2">
              <Globe className="h-3 w-3" /> Universe Name
            </label>
            <input
              type="text"
              value={data.universeName}
              onChange={(e) => handleChange('universeName', e.target.value)}
              placeholder="Enter universe name..."
              className="w-full mt-1 px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
          </div>
          <div className="flex-1 max-w-xs">
            <label className="text-[10px] uppercase tracking-wider font-bold text-orange-600 flex items-center gap-2">
              <Clock className="h-3 w-3" /> Period
            </label>
            <input
              type="text"
              value={data.period}
              onChange={(e) => handleChange('period', e.target.value)}
              placeholder="e.g., 2045, Medieval..."
              className="w-full mt-1 px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            />
          </div>
        </div>

        {/* All fields in grid */}
        {[
          { id: 'workingOfficeSchool', label: 'Working Office / School', icon: <Briefcase className="h-3 w-3" /> },
          { id: 'townDistrictCity', label: 'Town / District / City', icon: <Building className="h-3 w-3" /> },
          { id: 'neighborhoodEnvironment', label: 'Neighborhood / Environment', icon: <MapPin className="h-3 w-3" /> },
          { id: 'rulesOfWork', label: 'Rules of Work', icon: <Scale className="h-3 w-3" /> },
          { id: 'laborLaw', label: 'Labor Law', icon: <Scale className="h-3 w-3" /> },
          { id: 'country', label: 'Country', icon: <Globe className="h-3 w-3" /> },
          { id: 'governmentSystem', label: 'Government System', icon: <Flag className="h-3 w-3" /> },
          { id: 'environmentLandscape', label: 'Environment / Landscape', icon: <Mountain className="h-3 w-3" /> },
          { id: 'societyAndSystem', label: 'Society & System', icon: <Users className="h-3 w-3" /> },
          { id: 'privateInterior', label: 'Private / Interior', icon: <Lock className="h-3 w-3" /> },
          { id: 'sociopoliticEconomy', label: 'Sociopolitic & Economy', icon: <Flag className="h-3 w-3" /> },
          { id: 'socioculturalSystem', label: 'Sociocultural System', icon: <Users className="h-3 w-3" /> },
          { id: 'houseCastle', label: 'House / Castle', icon: <Home className="h-3 w-3" /> },
          { id: 'roomCave', label: 'Room / Cave', icon: <Lock className="h-3 w-3" /> },
          { id: 'familyInnerCircle', label: 'Family / Inner Circle', icon: <Crown className="h-3 w-3" /> },
          { id: 'kingdomTribeCommunal', label: 'Kingdom / Tribe / Communal', icon: <Users className="h-3 w-3" /> },
        ].map((field) => {
          const isFilled = (data as any)[field.id]?.trim();
          return (
            <div key={field.id} className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-bold text-orange-600 flex items-center gap-2">
                {field.icon} {field.label}
                {isFilled && <Check className="h-3 w-3 text-green-500" />}
              </label>
              <Textarea
                value={(data as any)[field.id] || ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                placeholder={`Enter ${field.label.toLowerCase()}...`}
                rows={2}
                className="bg-white border-orange-200 text-gray-900 text-xs resize-none focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-orange-100">
        <div className="flex items-center gap-2">
          <Check className="w-3 h-3 text-green-500" />
          <span className="text-xs text-gray-500">Filled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border-2 border-orange-200 bg-white" />
          <span className="text-xs text-gray-500">Empty</span>
        </div>
      </div>
    </div>
  );
}
