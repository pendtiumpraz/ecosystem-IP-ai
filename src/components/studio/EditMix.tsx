'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trash2, Play, Download, Plus, Sparkles, Layers, Blend, Sliders, Wand2, Image, Video, Film, X, Check, AlertCircle } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ProgressBar } from './ProgressBar';
import { CompactInput } from './CompactInput';

interface EditMixProps {
  projectId: string;
  userId: string;
  initialSessions?: any[];
  onSave?: (sessions: any[]) => void;
}

export function EditMix({ projectId, userId, initialSessions = [], onSave }: EditMixProps) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'sessions' | 'editor'>('sessions');

  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    type: 'image_mix',
    sourceUrls: [] as string[],
    mixMode: 'blend',
    blendMode: 'normal',
    opacity: 100,
    duration: 5,
    filters: [] as any[],
    effects: [] as any[],
    outputFormat: 'png',
    outputQuality: 100,
    aiGenerated: false,
    aiPrompt: '',
    isPublic: false,
  });

  const [urlInput, setUrlInput] = useState('');

  const sessionTypes = [
    { value: 'image_mix', label: 'Image Mix', icon: Image },
    { value: 'video_mix', label: 'Video Mix', icon: Video },
    { value: 'image_video_mix', label: 'Image + Video Mix', icon: Film },
  ];

  const mixModes = [
    { value: 'blend', label: 'Blend', description: 'Blend multiple images/videos together' },
    { value: 'overlay', label: 'Overlay', description: 'Overlay one media on top of another' },
    { value: 'composite', label: 'Composite', description: 'Composite multiple layers' },
    { value: 'sequence', label: 'Sequence', description: 'Sequence media in order' },
  ];

  const blendModes = [
    { value: 'normal', label: 'Normal' },
    { value: 'multiply', label: 'Multiply' },
    { value: 'screen', label: 'Screen' },
    { value: 'overlay', label: 'Overlay' },
    { value: 'darken', label: 'Darken' },
    { value: 'lighten', label: 'Lighten' },
    { value: 'color-dodge', label: 'Color Dodge' },
    { value: 'color-burn', label: 'Color Burn' },
    { value: 'hard-light', label: 'Hard Light' },
    { value: 'soft-light', label: 'Soft Light' },
    { value: 'difference', label: 'Difference' },
    { value: 'exclusion', label: 'Exclusion' },
  ];

  const outputFormats = [
    { value: 'png', label: 'PNG', type: 'image' },
    { value: 'jpg', label: 'JPG', type: 'image' },
    { value: 'webp', label: 'WebP', type: 'image' },
    { value: 'mp4', label: 'MP4', type: 'video' },
    { value: 'webm', label: 'WebM', type: 'video' },
    { value: 'gif', label: 'GIF', type: 'image' },
  ];

  useEffect(() => {
    if (initialSessions.length > 0) {
      setSessions(initialSessions);
    } else {
      fetchSessions();
    }
  }, [projectId, userId]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/edit-mix?userId=${userId}`);
      const data = await response.json();
      if (data.sessions) {
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!newSession.name || !newSession.type) return;

    setCreatingSession(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/edit-mix?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchSessions();
        setNewSession({
          name: '',
          description: '',
          type: 'image_mix',
          sourceUrls: [],
          mixMode: 'blend',
          blendMode: 'normal',
          opacity: 100,
          duration: 5,
          filters: [],
          effects: [],
          outputFormat: 'png',
          outputQuality: 100,
          aiGenerated: false,
          aiPrompt: '',
          isPublic: false,
        });
        onSave?.(sessions);
        alert('Session created successfully!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setCreatingSession(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/edit-mix?userId=${userId}&sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchSessions();
        if (activeSession?.id === sessionId) {
          setActiveSession(null);
        }
        onSave?.(sessions);
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const handleProcessSession = async (session: any) => {
    setProcessing({ ...processing, [session.id]: true });
    try {
      const response = await fetch(`/api/projects/${projectId}/edit-mix?userId=${userId}&sessionId=${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      });
      
      if (response.ok) {
        await fetchSessions();
      }
    } catch (error) {
      console.error('Error processing session:', error);
    } finally {
      setProcessing({ ...processing, [session.id]: false });
    }
  };

  const handleAddUrl = () => {
    if (urlInput.trim() && !newSession.sourceUrls.includes(urlInput.trim())) {
      setNewSession({ ...newSession, sourceUrls: [...newSession.sourceUrls, urlInput.trim()] });
      setUrlInput('');
    }
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setNewSession({ ...newSession, sourceUrls: newSession.sourceUrls.filter(url => url !== urlToRemove) });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      draft: { color: 'bg-gray-500/20 border-gray-500/30 text-gray-400', label: 'Draft', icon: <AlertCircle className="h-2.5 w-2.5" /> },
      processing: { color: 'bg-blue-500/20 border-blue-500/30 text-blue-400', label: 'Processing', icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
      completed: { color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', label: 'Completed', icon: <Check className="h-2.5 w-2.5" /> },
      failed: { color: 'bg-red-500/20 border-red-500/30 text-red-400', label: 'Failed', icon: <X className="h-2.5 w-2.5" /> },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge className={`flex items-center gap-1 text-[10px] px-2 py-0.5 border ${config.color}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = sessionTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : Image;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-black/40 rounded-xl border border-white/10">
        <Loader2 className="h-8 w-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-black/40 rounded-xl p-4 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white/90">Edit & Mix</h2>
          <p className="text-[10px] text-white/50 mt-0.5">Mix and edit images and videos with AI-powered tools</p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreatingSession(!creatingSession)}
          className="bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20"
        >
          {creatingSession ? (
            <span className="text-[10px] font-medium">Cancel</span>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1.5" />
              <span className="text-[10px] font-medium">New Session</span>
            </>
          )}
        </Button>
      </div>

      {/* Create New Session Form */}
      {creatingSession && (
        <CollapsibleSection
          title="Create New Edit & Mix Session"
          icon={<Film className="h-3 w-3" />}
          color="pink"
          progress={newSession.name ? 100 : 0}
          totalFields={1}
          filledFields={newSession.name ? 1 : 0}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CompactInput
                label="Session Name *"
                value={newSession.name}
                onChange={(value) => setNewSession({ ...newSession, name: value })}
                placeholder="Enter session name"
                color="pink"
                icon={<Film className="h-3 w-3" />}
                size="sm"
              />
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Type *</Label>
                <Select value={newSession.type} onValueChange={(value) => setNewSession({ ...newSession, type: value })}>
                  <SelectTrigger className="h-7 text-xs bg-black/20 border-pink-400/30 focus:border-pink-400/50 focus:ring-pink-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-xs">
                        <div className="flex items-center gap-2">
                          <type.icon className="h-3 w-3" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Description</Label>
              <Textarea
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                placeholder="Describe this session"
                rows={2}
                className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-pink-400/50 focus:ring-pink-400/20"
              />
            </div>

            {/* Source URLs */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Source URLs</Label>
              <div className="flex gap-1">
                <CompactInput
                  value={urlInput}
                  onChange={(value) => setUrlInput(value)}
                  placeholder="Add image/video URL and press Enter"
                  color="pink"
                  size="sm"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddUrl}
                  className="bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 h-7 w-7 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              {newSession.sourceUrls.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {newSession.sourceUrls.map((url, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer text-[10px] bg-pink-500/10 border-pink-500/20 text-pink-400 hover:bg-pink-500/20"
                      onClick={() => handleRemoveUrl(url)}
                    >
                      {url.length > 30 ? url.substring(0, 30) + '...' : url} <X className="h-2.5 w-2.5 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Mix Mode & Blend Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Mix Mode</Label>
                <Select value={newSession.mixMode} onValueChange={(value) => setNewSession({ ...newSession, mixMode: value })}>
                  <SelectTrigger className="h-7 text-xs bg-black/20 border-pink-400/30 focus:border-pink-400/50 focus:ring-pink-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mixModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value} className="text-xs">
                        <div>
                          <div className="font-medium text-xs">{mode.label}</div>
                          <div className="text-[10px] text-white/40">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Blend Mode</Label>
                <Select value={newSession.blendMode} onValueChange={(value) => setNewSession({ ...newSession, blendMode: value })}>
                  <SelectTrigger className="h-7 text-xs bg-black/20 border-pink-400/30 focus:border-pink-400/50 focus:ring-pink-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blendModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value} className="text-xs">
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Opacity & Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Opacity: {newSession.opacity}%</Label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={newSession.opacity}
                  onChange={(e) => setNewSession({ ...newSession, opacity: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
              {newSession.type.includes('video') && (
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Duration: {newSession.duration}s</Label>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                  />
                </div>
              )}
            </div>

            {/* Output Format & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Output Format</Label>
                <Select value={newSession.outputFormat} onValueChange={(value: string) => setNewSession({ ...newSession, outputFormat: value })}>
                  <SelectTrigger className="h-7 text-xs bg-black/20 border-pink-400/30 focus:border-pink-400/50 focus:ring-pink-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value} className="text-xs">
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-pink-400">Quality: {newSession.outputQuality}%</Label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={newSession.outputQuality}
                  onChange={(e) => setNewSession({ ...newSession, outputQuality: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
              </div>
            </div>

            {/* AI Generation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ai-generated"
                  checked={newSession.aiGenerated}
                  onChange={(e) => setNewSession({ ...newSession, aiGenerated: e.target.checked })}
                  className="h-3 w-3 accent-pink-500"
                />
                <Label htmlFor="ai-generated" className="cursor-pointer flex items-center gap-2 text-xs text-pink-400">
                  <Wand2 className="h-3 w-3" />
                  Enable AI Generation
                </Label>
              </div>
              {newSession.aiGenerated && (
                <Textarea
                  value={newSession.aiPrompt}
                  onChange={(e) => setNewSession({ ...newSession, aiPrompt: e.target.value })}
                  placeholder="Describe how you want AI to generate mix..."
                  rows={2}
                  className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingSession(false)}
                className="text-white/60 hover:text-white/90 h-7 text-[10px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={creatingSession || !newSession.name || !newSession.type}
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 h-7 text-[10px]"
              >
                {creatingSession ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Create Session
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-black/20 rounded-lg border border-white/5">
          <Layers className="h-10 w-10 text-white/30 mb-3" />
          <h4 className="text-sm font-semibold text-white/70 mb-1">No Edit & Mix Sessions Yet</h4>
          <p className="text-[10px] text-white/40 mb-4 max-w-xs">
            Create your first session to start mixing and editing images and videos
          </p>
          <Button
            onClick={() => setCreatingSession(true)}
            className="bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 h-7 text-[10px]"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Create First Session
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {sessions.map((session) => {
            const TypeIcon = getTypeIcon(session.type);
            return (
              <div key={session.id} className="p-3 rounded-lg bg-black/20 border border-white/10 hover:border-pink-400/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <TypeIcon className="h-4 w-4 text-pink-400" />
                    <span className="text-xs font-medium text-white/90 truncate max-w-[120px]">{session.name}</span>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                
                {session.description && (
                  <p className="text-[10px] text-white/40 line-clamp-2 mb-2">{session.description}</p>
                )}
                
                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-[10px] bg-pink-500/10 border-pink-500/20 text-pink-400">
                    <Blend className="h-2.5 w-2.5 mr-0.5" />
                    {session.mixMode}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/60">
                    {session.outputFormat?.toUpperCase()}
                  </Badge>
                </div>

                {session.sourceUrls && session.sourceUrls.length > 0 && (
                  <div className="text-[10px] text-white/40 mb-2">
                    {session.sourceUrls.length} source(s)
                  </div>
                )}

                {session.outputUrl && (
                  <div className="flex gap-1 mb-2">
                    <Button variant="ghost" size="sm" className="flex-1 h-6 text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20" asChild>
                      <a href={session.outputUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-2.5 w-2.5 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex gap-1 pt-2 border-t border-white/5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-6 text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                    onClick={() => handleProcessSession(session)}
                    disabled={processing[session.id] || session.status === 'processing'}
                  >
                    {processing[session.id] ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <Play className="h-2.5 w-2.5 mr-1" />
                    )}
                    Process
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
