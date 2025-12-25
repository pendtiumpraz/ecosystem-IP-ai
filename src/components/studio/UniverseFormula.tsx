'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Sparkles, Globe, MapPin, Building, Home, Clock, Mountain, Users, Lock, Crown, Briefcase, Scale, Flag } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ProgressBar } from './ProgressBar';
import { CompactInput } from './CompactInput';

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

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Call AI to generate universe formula based on project context
      // This would integrate with the AI generation system
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

  // Calculate progress
  const allFields = [
    'workingOfficeSchool', 'townDistrictCity', 'neighborhoodEnvironment',
    'rulesOfWork', 'laborLaw', 'country', 'governmentSystem',
    'universeName', 'period',
    'environmentLandscape', 'societyAndSystem', 'privateInterior',
    'sociopoliticEconomy', 'socioculturalSystem',
    'houseCastle', 'roomCave', 'familyInnerCircle', 'kingdomTribeCommunal'
  ];
  const filledFields = allFields.filter(f => (data as any)[f]?.trim()).length;
  const progress = Math.round((filledFields / allFields.length) * 100);

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

      {/* Overall Progress */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Overall Progress</span>
        <span className="text-[10px] text-purple-400 font-bold">{progress}%</span>
      </div>
      <ProgressBar progress={progress} color="purple" size="sm" />

      {/* Universe Formula Layout */}
      <div className="space-y-3">
        {/* Top Row - Locations */}
        <CollapsibleSection
          title="Locations (Clock 12, 1, 2)"
          icon={<MapPin className="h-3 w-3" />}
          color="blue"
          totalFields={3}
          filledFields={[
            data.workingOfficeSchool,
            data.townDistrictCity,
            data.neighborhoodEnvironment
          ].filter(f => f?.trim()).length}
          defaultOpen={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <CompactInput
              label="Working Office / School"
              value={data.workingOfficeSchool}
              onChange={(value) => handleChange('workingOfficeSchool', value)}
              placeholder="e.g., Modern tech startup office"
              color="blue"
              icon={<Briefcase className="h-3 w-3" />}
              size="sm"
            />
            <CompactInput
              label="Town / District / City"
              value={data.townDistrictCity}
              onChange={(value) => handleChange('townDistrictCity', value)}
              placeholder="e.g., Neo Tokyo, District 9"
              color="blue"
              icon={<Building className="h-3 w-3" />}
              size="sm"
            />
            <CompactInput
              label="Neighborhood / Environment"
              value={data.neighborhoodEnvironment}
              onChange={(value) => handleChange('neighborhoodEnvironment', value)}
              placeholder="e.g., Cyberpunk slums"
              color="blue"
              icon={<MapPin className="h-3 w-3" />}
              size="sm"
            />
          </div>
        </CollapsibleSection>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {/* Left Column - Systems */}
          <div className="space-y-2">
            <CollapsibleSection
              title="Systems (Clock 9, 10, 11)"
              icon={<Flag className="h-3 w-3" />}
              color="orange"
              totalFields={4}
              filledFields={[
                data.rulesOfWork,
                data.laborLaw,
                data.country,
                data.governmentSystem
              ].filter(f => f?.trim()).length}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Rules of Work</span>
                  <Textarea
                    value={data.rulesOfWork}
                    onChange={(e) => handleChange('rulesOfWork', e.target.value)}
                    placeholder="Describe work rules and regulations"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-orange-400/50 focus:ring-orange-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Labor Law</span>
                  <Textarea
                    value={data.laborLaw}
                    onChange={(e) => handleChange('laborLaw', e.target.value)}
                    placeholder="Describe labor laws and worker rights"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-orange-400/50 focus:ring-orange-400/20"
                  />
                </div>
                <CompactInput
                  label="Country"
                  value={data.country}
                  onChange={(value) => handleChange('country', value)}
                  placeholder="e.g., United States, Japan"
                  color="orange"
                  icon={<Globe className="h-3 w-3" />}
                  size="sm"
                />
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Government System</span>
                  <Textarea
                    value={data.governmentSystem}
                    onChange={(e) => handleChange('governmentSystem', e.target.value)}
                    placeholder="Describe government structure"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-orange-400/50 focus:ring-orange-400/20"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Center Column */}
          <div className="space-y-2">
            {/* Identity */}
            <CollapsibleSection
              title="Identity (Center)"
              icon={<Globe className="h-3 w-3" />}
              color="purple"
              totalFields={2}
              filledFields={[
                data.universeName,
                data.period
              ].filter(f => f?.trim()).length}
              defaultOpen={true}
            >
              <div className="space-y-2">
                <CompactInput
                  label="Universe Name"
                  value={data.universeName}
                  onChange={(value) => handleChange('universeName', value)}
                  placeholder="e.g., The Matrix Universe"
                  color="purple"
                  icon={<Globe className="h-3 w-3" />}
                  size="sm"
                />
                <CompactInput
                  label="Period"
                  value={data.period}
                  onChange={(value) => handleChange('period', value)}
                  placeholder="e.g., 2077, Medieval, Future"
                  color="purple"
                  icon={<Clock className="h-3 w-3" />}
                  size="sm"
                />
              </div>
            </CollapsibleSection>

            {/* Visual */}
            <CollapsibleSection
              title="Visual (Clock 6, 7, 8)"
              icon={<Mountain className="h-3 w-3" />}
              color="cyan"
              totalFields={3}
              filledFields={[
                data.environmentLandscape,
                data.societyAndSystem,
                data.privateInterior
              ].filter(f => f?.trim()).length}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Environment / Landscape</span>
                  <Textarea
                    value={data.environmentLandscape}
                    onChange={(e) => handleChange('environmentLandscape', e.target.value)}
                    placeholder="Describe the environment and landscape"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Society & System</span>
                  <Textarea
                    value={data.societyAndSystem}
                    onChange={(e) => handleChange('societyAndSystem', e.target.value)}
                    placeholder="Describe society structure"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Private / Interior</span>
                  <Textarea
                    value={data.privateInterior}
                    onChange={(e) => handleChange('privateInterior', e.target.value)}
                    placeholder="Describe private spaces"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20"
                  />
                </div>
              </div>
            </CollapsibleSection>

            {/* Systems */}
            <CollapsibleSection
              title="Systems (Clock 5, 4)"
              icon={<Scale className="h-3 w-3" />}
              color="green"
              totalFields={2}
              filledFields={[
                data.sociopoliticEconomy,
                data.socioculturalSystem
              ].filter(f => f?.trim()).length}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sociopolitic & Economy</span>
                  <Textarea
                    value={data.sociopoliticEconomy}
                    onChange={(e) => handleChange('sociopoliticEconomy', e.target.value)}
                    placeholder="Describe sociopolitical and economic systems"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-green-400/50 focus:ring-green-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Sociocultural System</span>
                  <Textarea
                    value={data.socioculturalSystem}
                    onChange={(e) => handleChange('socioculturalSystem', e.target.value)}
                    placeholder="Describe cultural systems"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-green-400/50 focus:ring-green-400/20"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>

          {/* Right Column - Private Spaces */}
          <div className="space-y-2">
            <CollapsibleSection
              title="Private Spaces (Clock 3, 4)"
              icon={<Home className="h-3 w-3" />}
              color="pink"
              totalFields={4}
              filledFields={[
                data.houseCastle,
                data.roomCave,
                data.familyInnerCircle,
                data.kingdomTribeCommunal
              ].filter(f => f?.trim()).length}
              defaultOpen={false}
            >
              <div className="space-y-3">
                <CompactInput
                  label="House / Castle"
                  value={data.houseCastle}
                  onChange={(value) => handleChange('houseCastle', value)}
                  placeholder="e.g., Modern apartment, Castle"
                  color="pink"
                  icon={<Home className="h-3 w-3" />}
                  size="sm"
                />
                <CompactInput
                  label="Room / Cave"
                  value={data.roomCave}
                  onChange={(value) => handleChange('roomCave', value)}
                  placeholder="e.g., Hero's room, Secret cave"
                  color="pink"
                  icon={<Lock className="h-3 w-3" />}
                  size="sm"
                />
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Family / Inner Circle</span>
                  <Textarea
                    value={data.familyInnerCircle}
                    onChange={(e) => handleChange('familyInnerCircle', e.target.value)}
                    placeholder="Describe family and close relationships"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-pink-400/50 focus:ring-pink-400/20"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Kingdom / Tribe / Communal</span>
                  <Textarea
                    value={data.kingdomTribeCommunal}
                    onChange={(e) => handleChange('kingdomTribeCommunal', e.target.value)}
                    placeholder="Describe communal spaces"
                    rows={2}
                    className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-pink-400/50 focus:ring-pink-400/20"
                  />
                </div>
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
}
