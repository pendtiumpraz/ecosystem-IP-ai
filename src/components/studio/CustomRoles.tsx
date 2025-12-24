'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trash2, Plus, Shield, Globe } from 'lucide-react';

interface CustomRolesProps {
  projectId: string;
  userId: string;
  initialRoles?: any[];
  onSave?: (roles: any[]) => void;
}

export function CustomRoles({ projectId, userId, initialRoles = [], onSave }: CustomRolesProps) {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creatingRole, setCreatingRole] = useState(false);
  
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    icon: '',
    permissions: [] as string[],
    isPublic: false,
  });

  const [permissionInput, setPermissionInput] = useState('');

  const predefinedPermissions = [
    'manage_team',
    'edit_project',
    'delete_project',
    'manage_roles',
    'manage_materials',
    'manage_animations',
    'manage_strategic_plan',
    'manage_universe_formula',
    'manage_edit_mix',
    'export_ip_bible',
    'view_analytics',
  ];

  const predefinedRoles = [
    { name: 'IP Producer', color: '#8b5cf6', icon: 'Crown', permissions: ['manage_team', 'edit_project', 'delete_project', 'manage_roles'] },
    { name: 'Head of Creative', color: '#10b981', icon: 'Palette', permissions: ['manage_team', 'edit_project', 'manage_materials', 'manage_animations'] },
    { name: 'Creative Director', color: '#f59e0b', icon: 'Film', permissions: ['edit_project', 'manage_materials', 'manage_animations'] },
    { name: 'Art Director', color: '#ef4444', icon: 'Brush', permissions: ['manage_materials', 'manage_animations'] },
    { name: 'Lead Writer', color: '#3b82f6', icon: 'FileText', permissions: ['edit_project', 'manage_strategic_plan'] },
    { name: 'Lead Artist', color: '#8b5cf6', icon: 'Image', permissions: ['manage_materials'] },
    { name: 'Lead Animator', color: '#10b981', icon: 'Video', permissions: ['manage_animations'] },
    { name: 'Lead Composer', color: '#f59e0b', icon: 'Music', permissions: ['manage_materials'] },
    { name: 'Technical Director', color: '#6366f1', icon: 'Settings', permissions: ['edit_project', 'manage_edit_mix'] },
  ];

  useEffect(() => {
    if (initialRoles.length > 0) {
      setRoles(initialRoles);
    } else {
      fetchRoles();
    }
  }, [projectId, userId]);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/custom-roles?userId=${userId}`);
      const data = await response.json();
      if (data.roles) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching custom roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRole.name) return;

    setCreatingRole(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/custom-roles?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRole),
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchRoles();
        setNewRole({
          name: '',
          description: '',
          color: '#3b82f6',
          icon: '',
          permissions: [],
          isPublic: false,
        });
        onSave?.(roles);
      }
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setCreatingRole(false);
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/custom-roles?userId=${userId}&roleId=${roleId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchRoles();
        onSave?.(roles);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
    }
  };

  const handleAddPermission = () => {
    if (permissionInput.trim() && !newRole.permissions.includes(permissionInput.trim())) {
      setNewRole({ ...newRole, permissions: [...newRole.permissions, permissionInput.trim()] });
      setPermissionInput('');
    }
  };

  const handleRemovePermission = (permissionToRemove: string) => {
    setNewRole({ ...newRole, permissions: newRole.permissions.filter((p: string) => p !== permissionToRemove) });
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
          <h3 className="text-lg font-semibold">Custom Roles</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage custom roles for your project team
          </p>
        </div>
        <Button onClick={() => setCreatingRole(!creatingRole)}>
          {creatingRole ? 'Cancel' : <><Plus className="h-4 w-4 mr-2" /> New Role</>}
        </Button>
      </div>

      {/* Create New Role Form */}
      {creatingRole && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create New Custom Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name *</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="role-color"
                    type="color"
                    value={newRole.color}
                    onChange={(e) => setNewRole({ ...newRole, color: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <div 
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: newRole.color }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                placeholder="Describe this role's responsibilities"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-icon">Icon (Lucide icon name)</Label>
              <Input
                id="role-icon"
                value={newRole.icon}
                onChange={(e) => setNewRole({ ...newRole, icon: e.target.value })}
                placeholder="e.g., Shield, Star, User"
              />
            </div>

            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="flex gap-2">
                <Input
                  value={permissionInput}
                  onChange={(e) => setPermissionInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPermission())}
                  placeholder="Add permission and press Enter"
                />
                <Button type="button" variant="outline" onClick={handleAddPermission}>
                  Add
                </Button>
              </div>
              {newRole.permissions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newRole.permissions.map((permission: string) => (
                    <Badge key={permission} variant="secondary" className="cursor-pointer" onClick={() => handleRemovePermission(permission)}>
                      {permission} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="role-public"
                checked={newRole.isPublic}
                onChange={(e) => setNewRole({ ...newRole, isPublic: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="role-public" className="cursor-pointer flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Make this role public (available to other projects)
              </Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreatingRole(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={creatingRole || !newRole.name}>
                {creatingRole ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Create Role
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Predefined Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Predefined Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedRoles.map((role) => (
              <div 
                key={role.name}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                style={{ borderLeftColor: role.color, borderLeftWidth: '4px' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: role.color }}
                  >
                    <Shield className="h-4 w-4" />
                  </div>
                  <h4 className="font-semibold">{role.name}</h4>
                </div>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 3).map((permission: string) => (
                    <Badge key={permission} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                  {role.permissions.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{role.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Roles List */}
      {roles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">No Custom Roles Yet</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Create custom roles to define specific permissions for your team
            </p>
            <Button onClick={() => setCreatingRole(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Role
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: role.color }}
                    >
                      <Shield className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    {role.isPublic && (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteRole(role.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {role.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{role.description}</p>
                )}
                
                {role.permissions && role.permissions.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((permission: string) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
