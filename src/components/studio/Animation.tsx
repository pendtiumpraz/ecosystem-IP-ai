'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Upload, Trash2, Play, Download, Plus, Sparkles, Film, Video, Image as ImageIcon, Clock, AlertCircle, CheckCircle, MoveUp, MoveDown } from 'lucide-react';

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
      }
    } catch (error) {
      console.error('Error creating animation:', error);
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
    const statusConfig = {
      pending: { color: 'bg-gray-500', label: 'Pending', icon: Clock },
      processing: { color: 'bg-blue-500', label: 'Processing', icon: Loader2 },
      completed: { color: 'bg-green-500', label: 'Completed', icon: CheckCircle },
      failed: { color: 'bg-red-500', label: 'Failed', icon: AlertCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStyleIcon = (style: string) => {
    return Film;
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
          <h3 className="text-lg font-semibold">Animation</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage animated scenes for your project
          </p>
        </div>
        <Button onClick={() => setCreatingAnimation(!creatingAnimation)}>
          {creatingAnimation ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> New Scene</>}
        </Button>
      </div>

      {/* Create New Animation Form */}
      {creatingAnimation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Animation Scene</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scene-name">Scene Name *</Label>
                <Input
                  id="scene-name"
                  value={newAnimation.sceneName}
                  onChange={(e) => setNewAnimation({ ...newAnimation, sceneName: e.target.value })}
                  placeholder="Enter scene name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scene-order">Scene Order</Label>
                <Input
                  id="scene-order"
                  type="number"
                  value={newAnimation.sceneOrder}
                  onChange={(e) => setNewAnimation({ ...newAnimation, sceneOrder: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animation-style">Animation Style</Label>
              <Select value={newAnimation.style} onValueChange={(value) => setNewAnimation({ ...newAnimation, style: value })}>
                <SelectTrigger id="animation-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {animationStyles.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="animation-description">Description</Label>
              <Textarea
                id="animation-description"
                value={newAnimation.description}
                onChange={(e) => setNewAnimation({ ...newAnimation, description: e.target.value })}
                placeholder="Describe this animation scene"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="animation-prompt">AI Prompt</Label>
              <Textarea
                id="animation-prompt"
                value={newAnimation.prompt}
                onChange={(e) => setNewAnimation({ ...newAnimation, prompt: e.target.value })}
                placeholder="Describe the animation you want to generate..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreatingAnimation(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnimation} disabled={creatingAnimation || !newAnimation.sceneName}>
                {creatingAnimation ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Create Scene
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Animations List */}
      {animations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Animation Scenes Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first animation scene to start building your story
            </p>
            <Button onClick={() => setCreatingAnimation(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Scene
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {animations.map((animation, index) => {
            const StyleIcon = getStyleIcon(animation.style);
            return (
              <Card key={animation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                          #{animation.sceneOrder || index + 1}
                        </Badge>
                        <StyleIcon className="h-5 w-5 text-muted-foreground" />
                        <CardTitle className="text-base">{animation.sceneName}</CardTitle>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(animation.status)}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveScene(animation.id, 'up')}
                          disabled={index === 0}
                        >
                          <MoveUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleMoveScene(animation.id, 'down')}
                          disabled={index === animations.length - 1}
                        >
                          <MoveDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {animation.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{animation.description}</p>
                  )}
                  
                  {animation.prompt && (
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-medium mb-1">AI Prompt:</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{animation.prompt}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      {animation.style}
                    </Badge>
                    {animation.duration && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {animation.duration}s
                      </Badge>
                    )}
                    {animation.aiModel && (
                      <Badge variant="outline" className="text-xs">
                        {animation.aiModel}
                      </Badge>
                    )}
                  </div>

                  {animation.videoUrl && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={animation.videoUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="h-3 w-3 mr-1" />
                          Watch Video
                        </a>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={animation.videoUrl} download>
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
                      onClick={() => handleGenerateAnimation(animation)}
                      disabled={processing[animation.id] || animation.status === 'processing'}
                    >
                      {processing[animation.id] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1" />
                      )}
                      Generate
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteAnimation(animation.id)}
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
