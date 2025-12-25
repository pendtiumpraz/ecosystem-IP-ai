'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trash2, Play, Download, Plus, Sparkles, Film, Video, Image as ImageIcon, Clock, AlertCircle, CheckCircle, MoveUp, MoveDown, Wand2 } from 'lucide-react';
import { CollapsibleSection } from './CollapsibleSection';
import { ProgressBar } from './ProgressBar';
import { CompactInput } from './CompactInput';

interface AnimationProps {
  projectId: string;
  userId: string;
  initialAnimations?: any[];
  onSave?: (animations: any[]) => void;
}

export function Animation({ projectId, userId, initialAnimations = [], onSave }: AnimationProps) {
  const [animations, setAnimations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingAnimation, setCreatingAnimation] = useState(false);
  const [processing, setProcessing] = useState<Record<string, boolean>>({});
  
  const [newAnimation, setNewAnimation] = useState({
    sceneName: '',
    sceneOrder: 0,
    description: '',
    prompt: '',
    style: '3d',
    aiModel: '',
  });

  const animationStyles = [
    { value: 'cartoon', label: 'Cartoon', description: '2D cartoon style' },
    { value: 'sketch', label: 'Sketch', description: 'Hand-drawn sketch style' },
    { value: '3d', label: '3D', description: '3D rendered style' },
    { value: 'vector', label: 'Vector', description: 'Clean vector graphics' },
    { value: 'realistic', label: 'Realistic', description: 'Photorealistic style' },
    { value: 'anime', label: 'Anime', description: 'Japanese anime style' },
  ];

  useEffect(() => {
    if (initialAnimations.length > 0) {
      setAnimations(initialAnimations);
    } else {
      fetchAnimations();
    }
  }, [projectId, userId]);

  const fetchAnimations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/animations?userId=${userId}`);
      const data = await response.json();
      if (data.animations) {
        setAnimations(data.animations);
      }
    } catch (error) {
      console.error('Error fetching animations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnimation = async () => {
    if (!newAnimation.sceneName) return;

    setCreatingAnimation(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/animations?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnimation),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchAnimations();
        setNewAnimation({
          sceneName: '',
          sceneOrder: 0,
          description: '',
          prompt: '',
          style: '3d',
          aiModel: '',
        });
        onSave?.(animations);
        alert('Animation scene created successfully!');
      }
    } catch (error) {
      console.error('Error creating animation:', error);
      alert('Failed to create animation scene. Please try again.');
    } finally {
      setCreatingAnimation(false);
    }
  };

  const handleDeleteAnimation = async (animationId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/animations?userId=${userId}&animationId=${animationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchAnimations();
        onSave?.(animations);
      }
    } catch (error) {
      console.error('Error deleting animation:', error);
    }
  };

  const handleMoveScene = async (animationId: string, direction: 'up' | 'down') => {
    const currentIndex = animations.findIndex(a => a.id === animationId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= animations.length) return;

    const updatedAnimations = [...animations];
    const temp = updatedAnimations[currentIndex].sceneOrder;
    updatedAnimations[currentIndex].sceneOrder = updatedAnimations[newIndex].sceneOrder;
    updatedAnimations[newIndex].sceneOrder = temp;

    // Update each animation individually
    for (const anim of [updatedAnimations[currentIndex], updatedAnimations[newIndex]]) {
      try {
        await fetch(`/api/projects/${projectId}/animations?userId=${userId}&animationId=${anim.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sceneOrder: anim.sceneOrder }),
        });
      } catch (error) {
        console.error('Error updating scene order:', error);
      }
    }

    await fetchAnimations();
  };

  const handleGenerateAnimation = async (animation: any) => {
    setProcessing({ ...processing, [animation.id]: true });
    try {
      const response = await fetch(`/api/projects/${projectId}/animations?userId=${userId}&animationId=${animation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      });
      
      if (response.ok) {
        await fetchAnimations();
      }
    } catch (error) {
      console.error('Error generating animation:', error);
    } finally {
      setProcessing({ ...processing, [animation.id]: false });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
      pending: { color: 'bg-gray-500/20 border-gray-500/30 text-gray-400', label: 'Pending', icon: <Clock className="h-2.5 w-2.5" /> },
      processing: { color: 'bg-blue-500/20 border-blue-500/30 text-blue-400', label: 'Processing', icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
      completed: { color: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400', label: 'Completed', icon: <CheckCircle className="h-2.5 w-2.5" /> },
      failed: { color: 'bg-red-500/20 border-red-500/30 text-red-400', label: 'Failed', icon: <AlertCircle className="h-2.5 w-2.5" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`flex items-center gap-1 text-[10px] px-2 py-0.5 border ${config.color}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
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
          <h2 className="text-lg font-bold text-white/90">Animation</h2>
          <p className="text-[10px] text-white/50 mt-0.5">Create and manage animated scenes for your project</p>
        </div>
        <Button
          size="sm"
          onClick={() => setCreatingAnimation(!creatingAnimation)}
          className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20"
        >
          {creatingAnimation ? (
            <span className="text-[10px] font-medium">Cancel</span>
          ) : (
            <>
              <Plus className="h-3 w-3 mr-1.5" />
              <span className="text-[10px] font-medium">New Scene</span>
            </>
          )}
        </Button>
      </div>

      {/* Create New Animation Form */}
      {creatingAnimation && (
        <CollapsibleSection
          title="Create New Animation Scene"
          icon={<Film className="h-3 w-3" />}
          color="purple"
          progress={newAnimation.sceneName ? 100 : 0}
          totalFields={1}
          filledFields={newAnimation.sceneName ? 1 : 0}
          defaultOpen={true}
        >
          <div className="space-y-3">
            {/* Scene Name & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <CompactInput
                label="Scene Name *"
                value={newAnimation.sceneName}
                onChange={(value) => setNewAnimation({ ...newAnimation, sceneName: value })}
                placeholder="Enter scene name"
                color="purple"
                icon={<Film className="h-3 w-3" />}
                size="sm"
              />
              <CompactInput
                label="Scene Order"
                value={newAnimation.sceneOrder.toString()}
                onChange={(value) => setNewAnimation({ ...newAnimation, sceneOrder: parseInt(value) || 0 })}
                placeholder="0"
                type="number"
                color="purple"
                icon={<Clock className="h-3 w-3" />}
                size="sm"
              />
            </div>

            {/* Animation Style */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Animation Style</Label>
              <Select value={newAnimation.style} onValueChange={(value) => setNewAnimation({ ...newAnimation, style: value })}>
                <SelectTrigger className="h-7 text-xs bg-black/20 border-purple-400/30 focus:border-purple-400/50 focus:ring-purple-400/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animationStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-xs">
                      <div>
                        <div className="font-medium text-xs">{style.label}</div>
                        <div className="text-[10px] text-white/40">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-purple-400">Description</Label>
              <Textarea
                value={newAnimation.description}
                onChange={(e) => setNewAnimation({ ...newAnimation, description: e.target.value })}
                placeholder="Describe this animation scene"
                rows={2}
                className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-purple-400/50 focus:ring-purple-400/20"
              />
            </div>

            {/* AI Prompt */}
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-purple-400">AI Prompt</Label>
              <Textarea
                value={newAnimation.prompt}
                onChange={(e) => setNewAnimation({ ...newAnimation, prompt: e.target.value })}
                placeholder="Describe animation you want to generate..."
                rows={2}
                className="bg-black/20 border-white/10 text-white/90 text-xs resize-none focus:border-cyan-400/50 focus:ring-cyan-400/20"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingAnimation(false)}
                className="text-white/60 hover:text-white/90 h-7 text-[10px]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnimation}
                disabled={creatingAnimation || !newAnimation.sceneName}
                className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 h-7 text-[10px]"
              >
                {creatingAnimation ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                ) : (
                  <Save className="h-3 w-3 mr-1" />
                )}
                Create Scene
              </Button>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Animations List */}
      {animations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-black/20 rounded-lg border border-white/5">
          <Film className="h-10 w-10 text-white/30 mb-3" />
          <h4 className="text-sm font-semibold text-white/70 mb-1">No Animation Scenes Yet</h4>
          <p className="text-[10px] text-white/40 mb-4 max-w-xs">
            Create your first animation scene to start building your story
          </p>
          <Button
            onClick={() => setCreatingAnimation(true)}
            className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 h-7 text-[10px]"
          >
            <Plus className="h-3 w-3 mr-1.5" />
            Create First Scene
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {animations.map((animation, index) => {
            return (
              <div key={animation.id} className="p-3 rounded-lg bg-black/20 border border-white/10 hover:border-purple-400/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-purple-500/10 border-purple-500/20 text-purple-400">
                      #{animation.sceneOrder || index + 1}
                    </Badge>
                    <span className="text-xs font-medium text-white/90">{animation.sceneName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(animation.status)}
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/40 hover:text-white/90 hover:bg-white/5"
                        onClick={() => handleMoveScene(animation.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-white/40 hover:text-white/90 hover:bg-white/5"
                        onClick={() => handleMoveScene(animation.id, 'down')}
                        disabled={index === animations.length - 1}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {animation.description && (
                  <p className="text-[10px] text-white/40 line-clamp-2 mb-2">{animation.description}</p>
                )}
                
                {animation.prompt && (
                  <div className="p-2 bg-black/20 rounded border border-white/5 mb-2">
                    <p className="text-[10px] text-purple-400 font-medium mb-0.5">AI Prompt:</p>
                    <p className="text-[10px] text-white/60 line-clamp-2">{animation.prompt}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/60">
                    {animation.style}
                  </Badge>
                  {animation.duration && (
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/60">
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      {animation.duration}s
                    </Badge>
                  )}
                  {animation.aiModel && (
                    <Badge variant="outline" className="text-[10px] bg-white/5 border-white/10 text-white/60">
                      {animation.aiModel}
                    </Badge>
                  )}
                </div>

                {animation.videoUrl && (
                  <div className="flex gap-1 mb-2">
                    <Button variant="ghost" size="sm" className="flex-1 h-6 text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20" asChild>
                      <a href={animation.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-2.5 w-2.5 mr-1" />
                        Watch
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-6 text-[10px] bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20" asChild>
                      <a href={animation.videoUrl} download>
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
                    onClick={() => handleGenerateAnimation(animation)}
                    disabled={processing[animation.id] || animation.status === 'processing'}
                  >
                    {processing[animation.id] ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : (
                      <Sparkles className="h-2.5 w-2.5 mr-1" />
                    )}
                    Generate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => handleDeleteAnimation(animation.id)}
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
