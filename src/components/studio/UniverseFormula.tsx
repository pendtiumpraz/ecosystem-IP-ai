'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles, Globe, MapPin, Building, Home, Clock, Mountain, Users, Lock, Crown, Briefcase, Scale, Flag, ChevronDown, ChevronUp, Check } from 'lucide-react';

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
    { id: 'workingOfficeSchool', label: 'Working Office / School', position: 12, color: 'bg-amber-400', icon: <Briefcase className="h-3 w-3" /> },
    { id: 'townDistrictCity', label: 'Town / District / City', position: 1, color: 'bg-amber-400', icon: <Building className="h-3 w-3" /> },
    { id: 'neighborhoodEnvironment', label: 'Neighborhood / Environment', position: 2, color: 'bg-amber-400', icon: <MapPin className="h-3 w-3" /> },
    
    // Left Column (11, 10, 9)
    { id: 'rulesOfWork', label: 'Rules of Work', position: 11, color: 'bg-orange-400', icon: <Scale className="h-3 w-3" /> },
    { id: 'laborLaw', label: 'Labor Law', position: 10, color: 'bg-orange-400', icon: <Scale className="h-3 w-3" /> },
    { id: 'country', label: 'Country', position: 9, color: 'bg-orange-400', icon: <Globe className="h-3 w-3" /> },
    
    // Center - Identity
    { id: 'universeName', label: 'Universe Name', position: 'center', color: 'bg-amber-400', icon: <Globe className="h-3 w-3" /> },
    
    // Center - Visual (8, 7, 6)
    { id: 'environmentLandscape', label: 'Environment / Landscape', position: 8, color: 'bg-cyan-400', icon: <Mountain className="h-3 w-3" /> },
    { id: 'societyAndSystem', label: 'Society & System', position: 7, color: 'bg-cyan-400', icon: <Users className="h-3 w-3" /> },
    { id: 'privateInterior', label: 'Private / Interior', position: 6, color: 'bg-cyan-400', icon: <Lock className="h-3 w-3" /> },
    
    // Center - Systems (5, 4)
    { id: 'sociopoliticEconomy', label: 'Sociopolitic & Economy', position: 5, color: 'bg-purple-400', icon: <Flag className="h-3 w-3" /> },
    { id: 'socioculturalSystem', label: 'Sociocultural System', position: 4, color: 'bg-purple-400', icon: <Users className="h-3 w-3" /> },
    
    // Right Column (3, 4)
    { id: 'houseCastle', label: 'House / Castle', position: 3, color: 'bg-pink-400', icon: <Home className="h-3 w-3" /> },
    { id: 'roomCave', label: 'Room / Cave', position: 4, color: 'bg-pink-400', icon: <Lock className="h-3 w-3" /> },
    { id: 'familyInnerCircle', label: 'Family / Inner Circle', position: 'center-right', color: 'bg-pink-400', icon: <Crown className="h-3 w-3" /> },
    { id: 'kingdomTribeCommunal', label: 'Kingdom / Tribe / Communal', position: 'bottom', color: 'bg-pink-400', icon: <Users className="h-3 w-3" /> },
  ];

  const getClockPosition = (position: number | string) => {
    const positions: Record<string, { top: string; left: string; transform: string }> = {
      '12': { top: '8%', left: '50%', transform: 'translate(-50%, -50%)' },
      '1': { top: '8%', left: '85%', transform: 'translate(-50%, -50%)' },
      '2': { top: '8%', left: '15%', transform: 'translate(-50%, -50%)' },
      '11': { top: '25%', left: '8%', transform: 'translate(-50%, -50%)' },
      '10': { top: '42%', left: '8%', transform: 'translate(-50%, -50%)' },
      '9': { top: '58%', left: '8%', transform: 'translate(-50%, -50%)' },
      '0': { top: '38%', left: '50%', transform: 'translate(-50%, -50%)' },
      '8': { top: '58%', left: '85%', transform: 'translate(-50%, -50%)' },
      '7': { top: '42%', left: '85%', transform: 'translate(-50%, -50%)' },
      '6': { top: '25%', left: '85%', transform: 'translate(-50%, -50%)' },
      '5': { top: '25%', left: '58%', transform: 'translate(-50%, -50%)' },
      '4': { top: '25%', left: '42%', transform: 'translate(-50%, -50%)' },
      '3': { top: '58%', left: '15%', transform: 'translate(-50%, -50%)' },
      'center-right': { top: '58%', left: '50%', transform: 'translate(-50%, -50%)' },
      'bottom': { top: '85%', left: '50%', transform: 'translate(-50%, -50%)' },
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
    <div className="space-y-4 bg-black/40 rounded-xl p-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Universe Formula</h2>
          <p className="text-[10px] text-white/50 mt-0.5">Opposing Clockwise Layout - 13 Fields</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGenerate}
            disabled={generating}
            className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
          >
            {generating ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1.5 h-3 w-3" />
            )}
            <span className="text-[10px] font-medium">AI Generate</span>
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

      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Overall Progress</span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[10px] text-amber-400 font-bold min-w-[35px] text-right">{progress}%</span>
      </div>

      {/* Clock Layout */}
      <div className="relative aspect-square max-w-lg mx-auto">
        {/* Clock Circle Background */}
        <div className="absolute inset-2 border-2 border-white/10 rounded-full bg-black/20" />
        
        {/* Clock Numbers */}
        {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
          <div
            key={num}
            className="absolute text-xs font-bold text-white/40"
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
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.1) 50%, transparent)',
              transform: `translate(-50%, -50%) rotate(${num * 30}deg)`,
            }}
          />
        ))}

        {/* Center Circle - Identity */}
        <div className="absolute top-[32%] left-[32%] w-[36%] h-[36%] bg-gradient-to-br from-amber-400/20 to-amber-500/10 border-2 border-amber-400/40 rounded-full flex items-center justify-center">
          <div className="text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5">
              <Globe className="h-3 w-3 text-amber-400" />
              <input
                type="text"
                value={data.universeName}
                onChange={(e) => handleChange('universeName', e.target.value)}
                placeholder="Universe Name"
                className="bg-transparent border-none text-center text-xs font-bold text-white/90 placeholder:text-white/30 w-full focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="h-3 w-3 text-amber-400" />
              <input
                type="text"
                value={data.period}
                onChange={(e) => handleChange('period', e.target.value)}
                placeholder="Period"
                className="bg-transparent border-none text-center text-xs font-bold text-white/90 placeholder:text-white/30 w-full focus:outline-none"
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
              style={style}
            >
              {/* Node Button */}
              <button
                onClick={() => setExpandedField(isExpanded ? null : item.id)}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isFilled ? item.color : 'bg-white/5'
                } ${isExpanded ? 'ring-2 ring-white/30 scale-110' : 'hover:scale-110'}`}
              >
                {item.icon}
              </button>

              {/* Tooltip/Expanded Panel */}
              {isExpanded && (
                <div className="absolute left-10 top-0 w-56 bg-black/95 border border-white/20 rounded-lg p-3 shadow-xl z-50">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1.5 rounded ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-xs font-bold text-white/90">{item.label}</span>
                  </div>
                  <Textarea
                    value={(data as any)[item.id] || ''}
                    onChange={(e) => handleChange(item.id, e.target.value)}
                    placeholder={`Enter ${item.label.toLowerCase()}...`}
                    rows={3}
                    className="bg-white/5 border-white/10 text-white/90 text-xs resize-none focus:border-amber-400/50 focus:ring-amber-400/20"
                  />
                </div>
              )}

              {/* Quick Fill Indicator */}
              {isFilled && !isExpanded && (
                <div className="absolute -right-1 -top-1 w-2.5 h-2.5 bg-emerald-500 rounded-full flex items-center justify-center">
                  <Check className="h-1.5 w-1.5 text-white" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-amber-400" />
          <span className="text-[10px] text-white/50">Locations</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-orange-400" />
          <span className="text-[10px] text-white/50">Systems</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-cyan-400" />
          <span className="text-[10px] text-white/50">Visual</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-purple-400" />
          <span className="text-[10px] text-white/50">Sociopolitic</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded bg-pink-400" />
          <span className="text-[10px] text-white/50">Private Spaces</span>
        </div>
      </div>
    </div>
  );
}
