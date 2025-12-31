'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trash2, Play, Download, Plus, Sparkles, Layers, Blend, Sliders, Wand2, Image, Video, Film, X, Check, AlertCircle } from 'lucide-react';
import { toast } from '@/lib/sweetalert';

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
  const [generatingAll, setGeneratingAll] = useState(false);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});

  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    type: 'image_mix',
    sourceUrls: [] as string[],
    mixMode: 'blend',
    blendMode: 'normal',
    opacity: 100,
    duration: 5,
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

  const handleGenerateAllSessions = async () => {
    setGeneratingAll(true);
    try {
      const response = await fetch('/api/ai/generate-edit-mix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate');
      }

      const result = await response.json();

      if (result.sessions) {
        for (const session of result.sessions) {
          await fetch(`/api/projects/${projectId}/edit-mix?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(session),
          });
        }
        await fetchSessions();
        toast.success(`${result.sessions.length} edit mix sessions generated!`);
      }
    } catch (error: any) {
      console.error('Error generating sessions:', error);
      toast.error(error.message || 'Failed to generate sessions');
    } finally {
      setGeneratingAll(false);
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
          outputFormat: 'png',
          outputQuality: 100,
          aiGenerated: false,
          aiPrompt: '',
          isPublic: false,
        });
        onSave?.(sessions);
        toast.success('Session created successfully!');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session. Please try again.');
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
      draft: { color: 'bg-gray-100 border-gray-200 text-gray-600', label: 'Draft', icon: <AlertCircle className="h-2.5 w-2.5" /> },
      processing: { color: 'bg-blue-50 border-blue-200 text-blue-600', label: 'Processing', icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
      completed: { color: 'bg-green-50 border-green-200 text-green-600', label: 'Completed', icon: <Check className="h-2.5 w-2.5" /> },
      failed: { color: 'bg-red-50 border-red-200 text-red-600', label: 'Failed', icon: <X className="h-2.5 w-2.5" /> },
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

  const calculateProgress = () => {
    if (sessions.length === 0) return 0;
    const completed = sessions.filter(s => s.status === 'completed').length;
    return Math.round((completed / sessions.length) * 100);
  };

  const progress = calculateProgress();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-orange-200">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white rounded-xl p-6 border border-orange-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Edit & Mix</h2>
          <p className="text-xs text-gray-500 mt-0.5">Mix and edit images and videos with AI-powered tools</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAllSessions}
            disabled={generatingAll}
            className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
          >
            {generatingAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span className="text-xs font-medium">Generate Mix Sessions with AI</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setCreatingSession(!creatingSession)}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {creatingSession ? (
              <span className="text-xs font-medium">Cancel</span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">New Session</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Completed</span>
        <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-orange-600 font-bold min-w-[35px] text-right">{progress}%</span>
      </div>

      {/* Create New Session Form */}
      {creatingSession && (
        <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900">Create New Edit & Mix Session</h3>
          </div>
          <div className="space-y-3">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Session Name *</Label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  placeholder="Enter session name"
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Type *</Label>
                <Select value={newSession.type} onValueChange={(value) => setNewSession({ ...newSession, type: value })}>
                  <SelectTrigger className="h-9 text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value} className="text-sm">
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
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
              <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Description</Label>
              <Textarea
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                placeholder="Describe this session"
                rows={2}
                className="bg-white border-orange-200 text-gray-900 text-sm resize-none focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>

            {/* Source URLs */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Source URLs</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Add image/video URL"
                  className="flex-1 px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAddUrl}
                  className="bg-orange-100 border border-orange-200 text-orange-600 hover:bg-orange-200"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newSession.sourceUrls.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {newSession.sourceUrls.map((url, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer text-xs bg-orange-100 border-orange-200 text-orange-600 hover:bg-orange-200"
                      onClick={() => handleRemoveUrl(url)}
                    >
                      {url.length > 30 ? url.substring(0, 30) + '...' : url} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Mix Mode & Blend Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Mix Mode</Label>
                <Select value={newSession.mixMode} onValueChange={(value) => setNewSession({ ...newSession, mixMode: value })}>
                  <SelectTrigger className="h-9 text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mixModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value} className="text-sm">
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-gray-500">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Blend Mode</Label>
                <Select value={newSession.blendMode} onValueChange={(value) => setNewSession({ ...newSession, blendMode: value })}>
                  <SelectTrigger className="h-9 text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blendModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value} className="text-sm">
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Output Format & Quality */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Output Format</Label>
                <Select value={newSession.outputFormat} onValueChange={(value: string) => setNewSession({ ...newSession, outputFormat: value })}>
                  <SelectTrigger className="h-9 text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value} className="text-sm">
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Quality: {newSession.outputQuality}%</Label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={newSession.outputQuality}
                  onChange={(e) => setNewSession({ ...newSession, outputQuality: parseInt(e.target.value) })}
                  className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
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
                  className="h-4 w-4 accent-orange-500"
                />
                <Label htmlFor="ai-generated" className="cursor-pointer flex items-center gap-2 text-sm text-orange-600">
                  <Wand2 className="h-4 w-4" />
                  Enable AI Generation
                </Label>
              </div>
              {newSession.aiGenerated && (
                <Textarea
                  value={newSession.aiPrompt}
                  onChange={(e) => setNewSession({ ...newSession, aiPrompt: e.target.value })}
                  placeholder="Describe how you want AI to generate mix..."
                  rows={2}
                  className="bg-white border-orange-200 text-gray-900 text-sm resize-none focus:border-orange-400 focus:ring-orange-400/20"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingSession(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateSession}
                disabled={creatingSession || !newSession.name || !newSession.type}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {creatingSession ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Create Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-orange-50/50 rounded-lg border border-orange-100">
          <Layers className="h-12 w-12 text-orange-300 mb-3" />
          <h4 className="text-sm font-semibold text-gray-700 mb-1">No Edit & Mix Sessions Yet</h4>
          <p className="text-xs text-gray-500 mb-4 max-w-xs">
            Create your first session to start mixing and editing images and videos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateAllSessions}
              disabled={generatingAll}
              className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
            >
              {generatingAll ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Generate with AI
            </Button>
            <Button
              onClick={() => setCreatingSession(true)}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sessions.map((session) => {
            const TypeIcon = getTypeIcon(session.type);
            return (
              <div key={session.id} className="p-4 rounded-lg bg-white border border-orange-100 hover:border-orange-300 transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TypeIcon className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{session.name}</span>
                  </div>
                  {getStatusBadge(session.status)}
                </div>

                {session.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{session.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-[10px] bg-orange-50 border-orange-200 text-orange-600">
                    <Blend className="h-2.5 w-2.5 mr-0.5" />
                    {session.mixMode}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-600">
                    {session.outputFormat?.toUpperCase()}
                  </Badge>
                </div>

                {session.sourceUrls && session.sourceUrls.length > 0 && (
                  <div className="text-xs text-gray-500 mb-2">
                    {session.sourceUrls.length} source(s)
                  </div>
                )}

                {session.outputUrl && (
                  <div className="flex gap-1 mb-2">
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" asChild>
                      <a href={session.outputUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                )}

                <div className="flex gap-1 pt-2 border-t border-gray-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-7 text-xs bg-green-50 border border-green-200 text-green-600 hover:bg-green-100"
                    onClick={() => handleProcessSession(session)}
                    disabled={processing[session.id] || session.status === 'processing'}
                  >
                    {processing[session.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Play className="h-3 w-3 mr-1" />
                    )}
                    Process
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteSession(session.id)}
                  >
                    <Trash2 className="h-3 w-3" />
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
