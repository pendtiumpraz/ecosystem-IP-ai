import { useState } from 'react';
import { ChevronDown, ChevronRight, Sparkles, Palette, Layers, Download, Upload, Play, Pause, Film } from 'lucide-react';
import { Card, Button, CompactInput, ProgressBar, CollapsibleSection } from './StudioUIComponents';

interface Asset {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  duration?: string;
  size?: string;
}

interface EditMixSession {
  id: string;
  name: string;
  description: string;
  assets: Asset[];
  status: 'draft' | 'editing' | 'review' | 'completed';
}

export const EditMixTab: React.FC = () => {
  const [sessions, setSessions] = useState<EditMixSession[]>([
    {
      id: '1',
      name: 'Edit Mix Session 1',
      description: '',
      assets: [
        { id: '1', name: 'Background Image', type: 'image', url: '', duration: '30s' },
        { id: '2', name: 'Character Animation', type: 'video', url: '', duration: '45s' },
        { id: '3', name: 'Soundtrack', type: 'audio', url: '', duration: '2:30' },
      ],
      status: 'draft',
    },
  ]);

  const [selectedIntegration, setSelectedIntegration] = useState('canva');

  const integrations = [
    { id: 'canva', name: 'Canva' },
    { id: 'adobe', name: 'Adobe Creative Cloud' },
    { id: 'final-cut', name: 'Final Cut Pro' },
    { id: 'premiere', name: 'Premiere Pro' },
  ];

  const handleSessionChange = (sessionId: string, field: keyof EditMixSession, value: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId ? { ...session, [field]: value } : session
    ));
  };

  const handleAssetChange = (sessionId: string, assetId: string, field: keyof Asset, value: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { 
            ...session, 
            assets: session.assets.map(asset => 
              asset.id === assetId ? { ...asset, [field]: value } : asset
            ) 
          } 
        : session
    ));
  };

  const handleAddAsset = (sessionId: string) => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      name: 'New Asset',
      type: 'image',
      url: '',
      duration: '0s',
    };
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, assets: [...session.assets, newAsset] } 
        : session
    ));
  };

  const handleRemoveAsset = (sessionId: string, assetId: string) => {
    setSessions(sessions.map(session => 
      session.id === sessionId 
        ? { ...session, assets: session.assets.filter(asset => asset.id !== assetId) } 
        : session
    ));
  };

  const handleGenerateMix = (sessionId: string) => {
    console.log('Generating mix for session:', sessionId);
  };

  const handleExportMix = (sessionId: string) => {
    console.log('Exporting mix for session:', sessionId);
  };

  const handlePlayMix = (sessionId: string) => {
    console.log('Playing mix for session:', sessionId);
  };

  const handlePauseMix = (sessionId: string) => {
    console.log('Pausing mix for session:', sessionId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Edit & Mix</h2>
        <div className="flex items-center gap-3">
          <Button variant="secondary" label="AI Generate" icon={<Sparkles className="w-4 h-4" />} />
          <Button variant="primary" label="Save" />
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar progress={85} />

      {/* Integration Selection */}
      <Card header="Integration Selection">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Select Integration Platform</label>
          <div className="flex gap-2">
            {integrations.map((integration) => (
              <button
                key={integration.id}
                onClick={() => setSelectedIntegration(integration.id)}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedIntegration === integration.id
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-orange-400'
                }`}
              >
                {integration.name}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Edit Mix Sessions */}
      <Card header="Edit Mix Sessions">
        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="border border-gray-200 rounded-lg p-4">
              <div className="space-y-4">
                {/* Session Header */}
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-gray-700">{session.name}</h5>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      session.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      session.status === 'editing' ? 'bg-blue-100 text-blue-600' :
                      session.status === 'review' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>

                {/* Session Description */}
                <CompactInput
                  label="Session Description"
                  labelColor="text-orange-500"
                  type="textarea"
                  value={session.description}
                  onChange={(e) => handleSessionChange(session.id, 'description', e.target.value)}
                  placeholder="Enter session description"
                  helperColor="text-orange-500"
                />

                {/* Assets List */}
                <div>
                  <h6 className="text-xs font-medium text-gray-600 mb-2">Assets</h6>
                  <div className="space-y-2">
                    {session.assets.map((asset) => (
                      <div key={asset.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          {asset.type === 'image' && <img src="/public/file.svg" alt="Image" className="w-6 h-6" />}
                          {asset.type === 'video' && <Film className="w-6 h-6 text-orange-500" />}
                          {asset.type === 'audio' && <Layers className="w-6 h-6 text-orange-500" />}
                          {asset.type === 'text' && <Palette className="w-6 h-6 text-orange-500" />}
                        </div>
                        <input
                          type="text"
                          value={asset.name}
                          onChange={(e) => handleAssetChange(session.id, asset.id, 'name', e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Asset name"
                        />
                        <input
                          type="text"
                          value={asset.duration}
                          onChange={(e) => handleAssetChange(session.id, asset.id, 'duration', e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                          placeholder="Duration"
                        />
                        <button
                          onClick={() => handleRemoveAsset(session.id, asset.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAddAsset(session.id)}
                    className="mt-2 px-3 py-1 text-sm text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    + Add Asset
                  </button>
                </div>

                {/* Generate and Export Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="secondary" 
                    label="Generate Mix" 
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => handleGenerateMix(session.id)}
                  />
                  <Button 
                    variant="secondary" 
                    label="Export Mix" 
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => handleExportMix(session.id)}
                  />
                </div>

                {/* Mix Preview */}
                <div className="mt-3">
                  <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <Film className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Mix Preview</p>
                    </div>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <Button 
                    variant="secondary" 
                    label="Play" 
                    icon={<Play className="w-4 h-4" />}
                    onClick={() => handlePlayMix(session.id)}
                  />
                  <Button 
                    variant="secondary" 
                    label="Pause" 
                    icon={<Pause className="w-4 h-4" />}
                    onClick={() => handlePauseMix(session.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};