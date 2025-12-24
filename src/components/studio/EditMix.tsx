'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, Upload, Trash2, Play, Download, Plus, Sparkles, Layers, Blend, Sliders, Wand2, Image, Video, Film } from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Error creating session:', error);
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
    const statusConfig = {
      draft: { color: 'bg-gray-500', label: 'Draft' },
      processing: { color: 'bg-blue-500', label: 'Processing' },
      completed: { color: 'bg-green-500', label: 'Completed' },
      failed: { color: 'bg-red-500', label: 'Failed' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = sessionTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : Image;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Edit & Mix</h3>
          <p className="text-sm text-muted-foreground">
            Mix and edit images and videos with AI-powered tools
          </p>
        </div>
        <Button onClick={() => setCreatingSession(!creatingSession)}>
          {creatingSession ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> New Session</>}
        </Button>
      </div>

      {/* Create New Session Form */}
      {creatingSession && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Edit & Mix Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="session-name">Session Name *</Label>
                <Input
                  id="session-name"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  placeholder="Enter session name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-type">Type *</Label>
                <Select value={newSession.type} onValueChange={(value) => setNewSession({ ...newSession, type: value })}>
                  <SelectTrigger id="session-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sessionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
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

            <div className="space-y-2">
              <Label htmlFor="session-description">Description</Label>
              <Textarea
                id="session-description"
                value={newSession.description}
                onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                placeholder="Describe this session"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Source URLs</Label>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddUrl())}
                  placeholder="Add image/video URL and press Enter"
                />
                <Button type="button" variant="outline" onClick={handleAddUrl}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {newSession.sourceUrls.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newSession.sourceUrls.map((url, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveUrl(url)}>
                      {url.length > 30 ? url.substring(0, 30) + '...' : url} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mix-mode">Mix Mode</Label>
                <Select value={newSession.mixMode} onValueChange={(value) => setNewSession({ ...newSession, mixMode: value })}>
                  <SelectTrigger id="mix-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mixModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        <div>
                          <div className="font-medium">{mode.label}</div>
                          <div className="text-xs text-muted-foreground">{mode.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blend-mode">Blend Mode</Label>
                <Select value={newSession.blendMode} onValueChange={(value) => setNewSession({ ...newSession, blendMode: value })}>
                  <SelectTrigger id="blend-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blendModes.map((mode) => (
                      <SelectItem key={mode.value} value={mode.value}>
                        {mode.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="opacity">Opacity: {newSession.opacity}%</Label>
                <Input
                  id="opacity"
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={newSession.opacity}
                  onChange={(e) => setNewSession({ ...newSession, opacity: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
              {newSession.type.includes('video') && (
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration: {newSession.duration}s</Label>
                  <Input
                    id="duration"
                    type="range"
                    min="1"
                    max="60"
                    step="1"
                    value={newSession.duration}
                    onChange={(e) => setNewSession({ ...newSession, duration: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="output-format">Output Format</Label>
                <Select value={newSession.outputFormat} onValueChange={(value: string) => setNewSession({ ...newSession, outputFormat: value })}>
                  <SelectTrigger id="output-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="output-quality">Quality: {newSession.outputQuality}%</Label>
                <Input
                  id="output-quality"
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={newSession.outputQuality}
                  onChange={(e) => setNewSession({ ...newSession, outputQuality: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ai-generated"
                  checked={newSession.aiGenerated}
                  onChange={(e) => setNewSession({ ...newSession, aiGenerated: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="ai-generated" className="cursor-pointer flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Enable AI Generation
                </Label>
              </div>
              {newSession.aiGenerated && (
                <Textarea
                  value={newSession.aiPrompt}
                  onChange={(e) => setNewSession({ ...newSession, aiPrompt: e.target.value })}
                  placeholder="Describe how you want AI to generate the mix..."
                  rows={3}
                />
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreatingSession(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession} disabled={creatingSession || !newSession.name || !newSession.type}>
                {creatingSession ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Create Session
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Edit & Mix Sessions Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first session to start mixing and editing images and videos
            </p>
            <Button onClick={() => setCreatingSession(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session) => {
            const TypeIcon = getTypeIcon(session.type);
            return (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base truncate">{session.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {getStatusBadge(session.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {session.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">
                      <Blend className="h-3 w-3 mr-1" />
                      {session.mixMode}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {session.outputFormat?.toUpperCase()}
                    </Badge>
                  </div>

                  {session.sourceUrls && session.sourceUrls.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {session.sourceUrls.length} source(s)
                    </div>
                  )}

                  {session.outputUrl && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={session.outputUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </a>
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
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
                      className="text-destructive"
                      onClick={() => handleDeleteSession(session.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
