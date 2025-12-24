'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Upload, Trash2, FileText, Image, Video, Music, File, Eye, EyeOff, Tag, Folder } from 'lucide-react';

interface ProjectMaterialsProps {
  projectId: string;
  userId: string;
  initialMaterials?: any[];
  onSave?: (materials: any[]) => void;
}

export function ProjectMaterials({ projectId, userId, initialMaterials = [], onSave }: ProjectMaterialsProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    description: '',
    type: 'document',
    fileUrl: '',
    fileSize: '',
    mimeType: '',
    category: '',
    tags: [] as string[],
    isPublic: false,
  });

  const [tagInput, setTagInput] = useState('');

  const materialTypes = [
    { value: 'document', label: 'Document', icon: FileText },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'audio', label: 'Audio', icon: Music },
    { value: 'other', label: 'Other', icon: File },
  ];

  const categories = [
    'concept',
    'reference',
    'inspiration',
    'moodboard',
    'character',
    'environment',
    'story',
    'script',
    'music',
    'sound',
    'other',
  ];

  useEffect(() => {
    if (initialMaterials.length > 0) {
      setMaterials(initialMaterials);
    } else {
      fetchMaterials();
    }
  }, [projectId, userId]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/materials?userId=${userId}`);
      const data = await response.json();
      if (data.materials) {
        setMaterials(data.materials);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.type) return;

    setUploading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/materials?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchMaterials();
        setNewMaterial({
          name: '',
          description: '',
          type: 'document',
          fileUrl: '',
          fileSize: '',
          mimeType: '',
          category: '',
          tags: [],
          isPublic: false,
        });
        setAddingMaterial(false);
        onSave?.(materials);
      }
    } catch (error) {
      console.error('Error adding material:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/materials?userId=${userId}&materialId=${materialId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchMaterials();
        onSave?.(materials);
      }
    } catch (error) {
      console.error('Error deleting material:', error);
    }
  };

  const handleTogglePublic = async (material: any) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/materials?userId=${userId}&materialId=${material.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !material.isPublic }),
      });
      
      if (response.ok) {
        await fetchMaterials();
      }
    } catch (error) {
      console.error('Error updating material:', error);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newMaterial.tags.includes(tagInput.trim())) {
      setNewMaterial({ ...newMaterial, tags: [...newMaterial.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewMaterial({ ...newMaterial, tags: newMaterial.tags.filter(t => t !== tagToRemove) });
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = materialTypes.find(t => t.value === type);
    return typeInfo ? typeInfo.icon : File;
  };

  const formatFileSize = (size: string) => {
    if (!size) return '-';
    const num = parseInt(size);
    if (isNaN(num)) return size;
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
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
          <h3 className="text-lg font-semibold">Pre-existing Materials</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage existing materials for your project
          </p>
        </div>
        <Button onClick={() => setAddingMaterial(!addingMaterial)}>
          {addingMaterial ? 'Cancel' : <><Upload className="h-4 w-4 mr-2" /> Add Material</>}
        </Button>
      </div>

      {/* Add New Material Form */}
      {addingMaterial && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add New Material</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-name">Name *</Label>
                <Input
                  id="material-name"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  placeholder="Enter material name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-type">Type *</Label>
                <Select value={newMaterial.type} onValueChange={(value) => setNewMaterial({ ...newMaterial, type: value })}>
                  <SelectTrigger id="material-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((type) => (
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
              <Label htmlFor="material-description">Description</Label>
              <Textarea
                id="material-description"
                value={newMaterial.description}
                onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                placeholder="Describe this material"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-file-url">File URL</Label>
                <Input
                  id="material-file-url"
                  value={newMaterial.fileUrl}
                  onChange={(e) => setNewMaterial({ ...newMaterial, fileUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-file-size">File Size</Label>
                <Input
                  id="material-file-size"
                  value={newMaterial.fileSize}
                  onChange={(e) => setNewMaterial({ ...newMaterial, fileSize: e.target.value })}
                  placeholder="e.g., 1024"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="material-mime-type">MIME Type</Label>
                <Input
                  id="material-mime-type"
                  value={newMaterial.mimeType}
                  onChange={(e) => setNewMaterial({ ...newMaterial, mimeType: e.target.value })}
                  placeholder="e.g., image/png"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="material-category">Category</Label>
                <Select value={newMaterial.category} onValueChange={(value) => setNewMaterial({ ...newMaterial, category: value })}>
                  <SelectTrigger id="material-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4" />
                          {cat}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {newMaterial.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newMaterial.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="material-public"
                checked={newMaterial.isPublic}
                onChange={(e) => setNewMaterial({ ...newMaterial, isPublic: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="material-public" className="cursor-pointer">
                Make this material public
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddingMaterial(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddMaterial} disabled={uploading || !newMaterial.name || !newMaterial.type}>
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Add Material
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Materials List */}
      {materials.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Materials Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Upload existing materials to use as reference for your project
            </p>
            <Button onClick={() => setAddingMaterial(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Add First Material
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => {
            const TypeIcon = getTypeIcon(material.type);
            return (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base truncate">{material.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleTogglePublic(material)}
                      >
                        {material.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDeleteMaterial(material.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {material.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{material.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-1">
                    {material.category && (
                      <Badge variant="outline" className="text-xs">
                        <Folder className="h-3 w-3 mr-1" />
                        {material.category}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {formatFileSize(material.fileSize)}
                    </Badge>
                  </div>

                  {material.tags && material.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {material.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {material.fileUrl && (
                    <a
                      href={material.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate block"
                    >
                      {material.fileUrl}
                    </a>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
