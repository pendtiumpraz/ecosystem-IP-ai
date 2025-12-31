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
import { toast } from '@/lib/sweetalert';

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
  const [generatingAllPrompts, setGeneratingAllPrompts] = useState(false);
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

  const handleGenerateAllPrompts = async () => {
    setGeneratingAllPrompts(true);
    try {
      const response = await fetch('/api/ai/generate-animation-prompts', {
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

      if (result.scenes) {
        // Create new animations from generated scenes
        for (const scene of result.scenes) {
          await fetch(`/api/projects/${projectId}/animations?userId=${userId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sceneName: scene.sceneName,
              sceneOrder: scene.sceneOrder,
              description: scene.description,
              prompt: scene.prompt,
              style: scene.style || '3d',
            }),
          });
        }
        await fetchAnimations();
        toast.success(`${result.scenes.length} animation prompts generated successfully!`);
      }
    } catch (error: any) {
      console.error('Error generating animation prompts:', error);
      toast.error(error.message || 'Failed to generate animation prompts');
    } finally {
      setGeneratingAllPrompts(false);
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
        toast.success('Animation scene created successfully!');
      }
    } catch (error) {
      console.error('Error creating animation:', error);
      toast.error('Failed to create animation scene. Please try again.');
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
      pending: { color: 'bg-gray-100 border-gray-200 text-gray-600', label: 'Pending', icon: <Clock className="h-2.5 w-2.5" /> },
      processing: { color: 'bg-blue-50 border-blue-200 text-blue-600', label: 'Processing', icon: <Loader2 className="h-2.5 w-2.5 animate-spin" /> },
      completed: { color: 'bg-green-50 border-green-200 text-green-600', label: 'Completed', icon: <CheckCircle className="h-2.5 w-2.5" /> },
      failed: { color: 'bg-red-50 border-red-200 text-red-600', label: 'Failed', icon: <AlertCircle className="h-2.5 w-2.5" /> },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`flex items-center gap-1 text-[10px] px-2 py-0.5 border ${config.color}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const calculateProgress = () => {
    if (animations.length === 0) return 0;
    const withPrompts = animations.filter(a => a.prompt?.trim()).length;
    return Math.round((withPrompts / animations.length) * 100);
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
          <h2 className="text-lg font-bold text-gray-900">Animation</h2>
          <p className="text-xs text-gray-500 mt-0.5">Create and manage animated scenes for your project</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateAllPrompts}
            disabled={generatingAllPrompts}
            className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
          >
            {generatingAllPrompts ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            <span className="text-xs font-medium">Generate All Prompts with AI</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setCreatingAnimation(!creatingAnimation)}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            {creatingAnimation ? (
              <span className="text-xs font-medium">Cancel</span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                <span className="text-xs font-medium">New Scene</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Prompts Ready</span>
        <div className="flex-1 h-2 bg-orange-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-orange-600 font-bold min-w-[35px] text-right">{progress}%</span>
      </div>

      {/* Create New Animation Form */}
      {creatingAnimation && (
        <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Film className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-bold text-gray-900">Create New Animation Scene</h3>
          </div>
          <div className="space-y-3">
            {/* Scene Name & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Scene Name *</Label>
                <input
                  type="text"
                  value={newAnimation.sceneName}
                  onChange={(e) => setNewAnimation({ ...newAnimation, sceneName: e.target.value })}
                  placeholder="Enter scene name"
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Scene Order</Label>
                <input
                  type="number"
                  value={newAnimation.sceneOrder}
                  onChange={(e) => setNewAnimation({ ...newAnimation, sceneOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-orange-200 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
                />
              </div>
            </div>

            {/* Animation Style */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Animation Style</Label>
              <Select value={newAnimation.style} onValueChange={(value) => setNewAnimation({ ...newAnimation, style: value })}>
                <SelectTrigger className="h-9 text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animationStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value} className="text-sm">
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-gray-500">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">Description</Label>
              <Textarea
                value={newAnimation.description}
                onChange={(e) => setNewAnimation({ ...newAnimation, description: e.target.value })}
                placeholder="Describe this animation scene"
                rows={2}
                className="bg-white border-orange-200 text-gray-900 text-sm resize-none focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>

            {/* AI Prompt */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider font-bold text-orange-600">AI Prompt</Label>
              <Textarea
                value={newAnimation.prompt}
                onChange={(e) => setNewAnimation({ ...newAnimation, prompt: e.target.value })}
                placeholder="Describe animation you want to generate..."
                rows={2}
                className="bg-white border-orange-200 text-gray-900 text-sm resize-none focus:border-orange-400 focus:ring-orange-400/20"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCreatingAnimation(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAnimation}
                disabled={creatingAnimation || !newAnimation.sceneName}
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                {creatingAnimation ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Create Scene
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Animations List */}
      {animations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-orange-50/50 rounded-lg border border-orange-100">
          <Film className="h-12 w-12 text-orange-300 mb-3" />
          <h4 className="text-sm font-semibold text-gray-700 mb-1">No Animation Scenes Yet</h4>
          <p className="text-xs text-gray-500 mb-4 max-w-xs">
            Create your first animation scene or generate prompts from your story
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleGenerateAllPrompts}
              disabled={generatingAllPrompts}
              className="bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100"
            >
              {generatingAllPrompts ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="h-4 w-4 mr-1" />
              )}
              Generate from Story
            </Button>
            <Button
              onClick={() => setCreatingAnimation(true)}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Create Manually
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {animations.map((animation, index) => {
            return (
              <div key={animation.id} className="p-4 rounded-lg bg-white border border-orange-100 hover:border-orange-300 transition-colors shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="text-[10px] bg-orange-100 border-orange-200 text-orange-600">
                      #{animation.sceneOrder || index + 1}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">{animation.sceneName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(animation.status)}
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => handleMoveScene(animation.id, 'up')}
                        disabled={index === 0}
                      >
                        <MoveUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                        onClick={() => handleMoveScene(animation.id, 'down')}
                        disabled={index === animations.length - 1}
                      >
                        <MoveDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {animation.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{animation.description}</p>
                )}

                {animation.prompt && (
                  <div className="p-2 bg-orange-50 rounded border border-orange-100 mb-2">
                    <p className="text-[10px] text-orange-600 font-medium mb-0.5">AI Prompt:</p>
                    <p className="text-xs text-gray-600 line-clamp-2">{animation.prompt}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-600">
                    {animation.style}
                  </Badge>
                  {animation.duration && (
                    <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-600">
                      <Clock className="h-2.5 w-2.5 mr-0.5" />
                      {animation.duration}s
                    </Badge>
                  )}
                  {animation.aiModel && (
                    <Badge variant="outline" className="text-[10px] bg-gray-50 border-gray-200 text-gray-600">
                      {animation.aiModel}
                    </Badge>
                  )}
                </div>

                {animation.videoUrl && (
                  <div className="flex gap-1 mb-2">
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" asChild>
                      <a href={animation.videoUrl} target="_blank" rel="noopener noreferrer">
                        <Video className="h-3 w-3 mr-1" />
                        Watch
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1 h-7 text-xs bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100" asChild>
                      <a href={animation.videoUrl} download>
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
                    onClick={() => handleGenerateAnimation(animation)}
                    disabled={processing[animation.id] || animation.status === 'processing'}
                  >
                    {processing[animation.id] ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Sparkles className="h-3 w-3 mr-1" />
                    )}
                    Generate Video
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteAnimation(animation.id)}
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
