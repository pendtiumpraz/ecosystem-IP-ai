'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Sparkles } from 'lucide-react';

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
    } catch (error) {
      console.error('Error saving universe formula:', error);
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
        <h2 className="text-2xl font-bold">Universe Formula</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            AI Generate
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

      {/* Top Row - Locations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle className="text-sm">Working Office / School</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={data.workingOfficeSchool}
              onChange={(e) => handleChange('workingOfficeSchool', e.target.value)}
              placeholder="e.g., Modern tech startup office"
            />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle className="text-sm">Town / District / City</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={data.townDistrictCity}
              onChange={(e) => handleChange('townDistrictCity', e.target.value)}
              placeholder="e.g., Neo Tokyo, District 9"
            />
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-500">
          <CardHeader>
            <CardTitle className="text-sm">Neighborhood / Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={data.neighborhoodEnvironment}
              onChange={(e) => handleChange('neighborhoodEnvironment', e.target.value)}
              placeholder="e.g., Cyberpunk slums"
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column - Systems */}
        <div className="space-y-4">
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-sm">Rules of Work</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.rulesOfWork}
                onChange={(e) => handleChange('rulesOfWork', e.target.value)}
                placeholder="Describe work rules and regulations"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-sm">Labor Law</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.laborLaw}
                onChange={(e) => handleChange('laborLaw', e.target.value)}
                placeholder="Describe labor laws and worker rights"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-sm">Country</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={data.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="e.g., United States, Japan"
              />
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="text-sm">Government System</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.governmentSystem}
                onChange={(e) => handleChange('governmentSystem', e.target.value)}
                placeholder="Describe government structure"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Center Column */}
        <div className="space-y-4">
          {/* Identity */}
          <Card className="border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-sm">Universe Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={data.universeName}
                onChange={(e) => handleChange('universeName', e.target.value)}
                placeholder="e.g., The Matrix Universe"
              />
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-indigo-500">
            <CardHeader>
              <CardTitle className="text-sm">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={data.period}
                onChange={(e) => handleChange('period', e.target.value)}
                placeholder="e.g., 2077, Medieval, Future"
              />
            </CardContent>
          </Card>

          {/* Visual */}
          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <CardTitle className="text-sm">Environment / Landscape</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.environmentLandscape}
                onChange={(e) => handleChange('environmentLandscape', e.target.value)}
                placeholder="Describe the environment and landscape"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <CardTitle className="text-sm">Society & System</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.societyAndSystem}
                onChange={(e) => handleChange('societyAndSystem', e.target.value)}
                placeholder="Describe society structure"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-cyan-500">
            <CardHeader>
              <CardTitle className="text-sm">Private / Interior</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.privateInterior}
                onChange={(e) => handleChange('privateInterior', e.target.value)}
                placeholder="Describe private spaces"
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Systems */}
          <Card className="border-t-4 border-teal-500">
            <CardHeader>
              <CardTitle className="text-sm">Sociopolitic & Economy</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.sociopoliticEconomy}
                onChange={(e) => handleChange('sociopoliticEconomy', e.target.value)}
                placeholder="Describe sociopolitical and economic systems"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-t-4 border-teal-500">
            <CardHeader>
              <CardTitle className="text-sm">Sociocultural System</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.socioculturalSystem}
                onChange={(e) => handleChange('socioculturalSystem', e.target.value)}
                placeholder="Describe cultural systems"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Private Spaces */}
        <div className="space-y-4">
          <Card className="border-r-4 border-r-pink-500">
            <CardHeader>
              <CardTitle className="text-sm">House / Castle</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={data.houseCastle}
                onChange={(e) => handleChange('houseCastle', e.target.value)}
                placeholder="e.g., Modern apartment, Castle"
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-pink-500">
            <CardHeader>
              <CardTitle className="text-sm">Room / Cave</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={data.roomCave}
                onChange={(e) => handleChange('roomCave', e.target.value)}
                placeholder="e.g., Hero's room, Secret cave"
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-pink-500">
            <CardHeader>
              <CardTitle className="text-sm">Family / Inner Circle</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.familyInnerCircle}
                onChange={(e) => handleChange('familyInnerCircle', e.target.value)}
                placeholder="Describe family and close relationships"
                rows={3}
              />
            </CardContent>
          </Card>

          <Card className="border-r-4 border-r-pink-500">
            <CardHeader>
              <CardTitle className="text-sm">Kingdom / Tribe / Communal</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={data.kingdomTribeCommunal}
                onChange={(e) => handleChange('kingdomTribeCommunal', e.target.value)}
                placeholder="Describe communal spaces"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
