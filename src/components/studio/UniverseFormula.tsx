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
      // Call AI to generate universe formula based on project context
      console.log('Generating universe formula...');
    } catch (error) {
      console.error('Error generating universe formula:', error);
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
          <p className="text-xs text-gray-500 mt-0.5">Opposing Clockwise Layout - 13 Fields</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-orange-50 border border-orange-200 text-orange-600 hover:bg-orange-100"
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span className="text-xs font-medium">AI Generate</span>
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

      {/* Clock Layout */}
      <div className="relative aspect-square max-w-lg mx-auto">
        {/* Clock Circle Background */}
        <div className="absolute inset-2 border-2 border-orange-200 rounded-full bg-orange-50/50" />
        
        {/* Clock Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
          <div
            key={num}
            className="absolute text-sm font-bold text-gray-400"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${num * 30 - 90}deg) translateY(-50%) rotate(-${num * 30 - 90}deg)`,
            }}
          >
            {num}
          </div>
        ))}

        {/* Clock Lines */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
          <div
            key={num}
            className="absolute origin-center"
            style={{
              top: '50%',
              left: '50%',
              width: '42%',
              height: '1px',
              background: 'linear-gradient(to right, transparent, rgba(249, 115, 22, 0.2) 50%, transparent)',
              transform: `translate(-50%, -50%) rotate(${num * 30}deg)`,
            }}
          />
        ))}

        {/* Center Circle - Identity */}
        <div className="absolute top-[32%] left-[32%] w-[36%] h-[36%] bg-gradient-to-br from-orange-100 to-orange-50 border-2 border-orange-300 rounded-full flex items-center justify-center shadow-sm">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Globe className="h-4 w-4 text-orange-500" />
              <input
                type="text"
                value={data.universeName}
                onChange={(e) => handleChange('universeName', e.target.value)}
                placeholder="Universe Name"
                className="bg-transparent border-none text-center text-sm font-bold text-gray-900 placeholder:text-gray-400 w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <input
                type="text"
                value={data.period}
                onChange={(e) => handleChange('period', e.target.value)}
                placeholder="Period"
                className="bg-transparent border-none text-center text-sm font-bold text-gray-900 placeholder:text-gray-400 w-full focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Clock Position Nodes */}
        {clockPositions.map((item) => {
          const isFilled = (data as any)[item.id]?.trim();
          const isExpanded = expandedField === item.id;
          const style = getClockPosition(item.position);
          
          return (
            <div
              key={item.id}
              className="absolute group"
              style={{ top: style.top, left: style.left, transform: style.transform }}
            >
              {/* Node Button */}
              <button
                onClick={() => setExpandedField(isExpanded ? null : item.id)}
                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg ${
                  isFilled ? item.color : 'bg-gray-100'
                } ${isExpanded ? 'ring-4 ring-orange-300 scale-110' : 'hover:scale-105'}`}
              >
                {item.icon}
              </button>

              {/* Tooltip/Expanded Panel - Fixed positioning to avoid overlap */}
              {isExpanded && (
                <div className={`absolute ${style.panelPosition} w-72 bg-white border-2 border-orange-300 rounded-lg p-4 shadow-xl z-50`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{item.label}</span>
                    </div>
                    <button
                      onClick={() => setExpandedField(null)}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <Textarea
                    value={(data as any)[item.id] || ''}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    placeholder={`Enter ${item.label.toLowerCase()}...`}
                    rows={4}
                    className="bg-gray-50 border-gray-200 text-gray-900 text-sm resize-none focus:border-orange-400 focus:ring-orange-400/20"
                  />
                </div>
              )}

              {/* Quick Fill Indicator */}
              {isFilled && !isExpanded && (
                <div className="absolute -right-1 -top-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-orange-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-gray-500">Locations</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-400" />
          <span className="text-xs text-gray-500">Systems</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-300" />
          <span className="text-xs text-gray-500">Visual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-400" />
          <span className="text-xs text-gray-500">Sociopolitic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-xs text-gray-500">Private Spaces</span>
        </div>
      </div>
    </div>
  );
}
