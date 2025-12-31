'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Save, UserPlus, Trash2, Check, X } from 'lucide-react';
import { toast, alert } from '@/lib/sweetalert';

interface ProjectTeamProps {
  projectId: string;
  userId: string;
  initialTeam?: any[];
  onSave?: () => void;
}

export function ProjectTeam({ projectId, userId, initialTeam, onSave }: ProjectTeamProps) {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);

  // New member form
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    responsibilities: '',
    expertise: '',
  });

  const predefinedRoles = [
    'IP Producer',
    'Head of Creative',
    'Creative Director',
    'Art Director',
    'Lead Writer',
    'Lead Artist',
    'Lead Animator',
    'Lead Composer',
    'Lead Voice Actor',
    'Technical Director',
    'Production Manager',
    'Marketing Director',
    'Business Development',
    'Legal Counsel',
    'Finance Manager',
    'Project Manager',
  ];

  useEffect(() => {
    if (initialTeam) {
      setTeam(initialTeam);
    }
  }, [initialTeam]);

  const handleAddMember = async () => {
    if (!newMember.name) return;

    setAddingMember(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/team?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: userId, // Using current user as the new member
          ...newMember,
        }),
      });

      if (!response.ok) throw new Error('Failed to add team member');

      const result = await response.json();
      setTeam(prev => [...prev, result.member]);
      setNewMember({ name: '', email: '', role: '', responsibilities: '', expertise: '' });
      onSave?.();
      toast.success('Team member added successfully!');
    } catch (error) {
      console.error('Error adding team member:', error);
      toast.error('Failed to add team member. Please try again.');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    const confirmed = await alert.confirm('Remove Team Member', 'Are you sure you want to remove this team member?');
    if (!confirmed.isConfirmed) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/team?userId=${userId}&memberId=${memberId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove team member');

      setTeam(prev => prev.filter(m => m.id !== memberId));
      onSave?.();
      toast.success('Team member removed successfully!');
    } catch (error) {
      console.error('Error removing team member:', error);
      toast.error('Failed to remove team member. Please try again.');
    }
  };

  const handleToggleModoHolder = async (memberId: string, isHolder: boolean) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/team?userId=${userId}&memberId=${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isModoTokenHolder: isHolder }),
      });

      if (!response.ok) throw new Error('Failed to update team member');

      setTeam(prev => prev.map(m =>
        m.id === memberId ? { ...m, isModoTokenHolder: isHolder } : m
      ));
      onSave?.();
    } catch (error) {
      console.error('Error updating team member:', error);
      toast.error('Failed to update team member. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Project Team</h2>
        <Button onClick={onSave} disabled={loading}>
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save
        </Button>
      </div>

      {/* Add New Team Member */}
      <Card>
        <CardHeader>
          <CardTitle>Add Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Team member name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="team@company.com"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select
                value={newMember.role}
                onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select role...</option>
                <option value="">Custom Role</option>
                {predefinedRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Responsibilities</label>
              <Textarea
                value={newMember.responsibilities}
                onChange={(e) => setNewMember(prev => ({ ...prev, responsibilities: e.target.value }))}
                placeholder="Describe responsibilities..."
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Expertise</label>
              <Textarea
                value={newMember.expertise}
                onChange={(e) => setNewMember(prev => ({ ...prev, expertise: e.target.value }))}
                placeholder="Describe expertise..."
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={handleAddMember}
            disabled={addingMember || !newMember.name}
            className="mt-4"
          >
            {addingMember ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            Add Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({team.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {team.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No team members yet. Add your first team member above.
            </div>
          ) : (
            <div className="space-y-4">
              {team.map((member) => (
                <div key={member.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      {member.email && (
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      )}
                      {member.role && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium">
                            {member.role}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  {member.responsibilities && (
                    <div>
                      <p className="text-sm font-medium mb-1">Responsibilities:</p>
                      <p className="text-sm text-muted-foreground">{member.responsibilities}</p>
                    </div>
                  )}

                  {member.expertise && (
                    <div>
                      <p className="text-sm font-medium mb-1">Expertise:</p>
                      <p className="text-sm text-muted-foreground">{member.expertise}</p>
                    </div>
                  )}

                  {/* Modo Token Holder Status */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t">
                    <span className="text-sm font-medium">Modo Token Holder:</span>
                    {member.is_modo_token_holder ? (
                      <span className="flex items-center text-green-600 dark:text-green-400">
                        <Check className="h-4 w-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center text-muted-foreground">
                        <X className="h-4 w-4 mr-1" />
                        No
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleModoHolder(member.id, !member.is_modo_token_holder)}
                    >
                      {member.is_modo_token_holder ? 'Remove' : 'Make Holder'}
                    </Button>
                  </div>

                  {member.modo_token_address && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Token: {member.modo_token_address} ({member.modo_token_amount})
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
