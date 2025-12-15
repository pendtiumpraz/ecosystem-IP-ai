"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2, Plus, Search, Edit, Trash2, Users, Loader2,
  MoreHorizontal, Eye, CheckCircle, XCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
  slug: string;
  planId: string;
  planName: string;
  memberCount: number;
  projectCount: number;
  isActive: boolean;
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    slug: "",
    planId: "",
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  async function fetchOrganizations() {
    try {
      const res = await fetch("/api/admin/organizations");
      const data = await res.json();
      if (data.success) {
        setOrganizations(data.organizations || []);
      }
    } catch (e) {
      console.error("Failed to fetch organizations:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveOrganization() {
    setIsSaving(true);
    try {
      const method = editingOrg ? "PUT" : "POST";
      const body = editingOrg 
        ? { id: editingOrg.id, ...form }
        : form;
      
      const res = await fetch("/api/admin/organizations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setEditingOrg(null);
        setForm({ name: "", slug: "", planId: "" });
        fetchOrganizations();
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteOrganization(id: string) {
    if (!confirm("Delete this organization? This will soft-delete.")) return;
    try {
      await fetch(`/api/admin/organizations?id=${id}`, { method: "DELETE" });
      fetchOrganizations();
    } catch (e) {
      console.error(e);
    }
  }

  function openEdit(org: Organization) {
    setEditingOrg(org);
    setForm({ name: org.name, slug: org.slug, planId: org.planId });
    setShowModal(true);
  }

  function openCreate() {
    setEditingOrg(null);
    setForm({ name: "", slug: "", planId: "" });
    setShowModal(true);
  }

  const filteredOrgs = organizations.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-7 h-7 text-violet-400" />
            Organizations
          </h1>
          <p className="text-gray-400">Manage workspaces and teams</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add Organization
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">{organizations.length}</div>
            <div className="text-sm text-gray-400">Total Organizations</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">
              {organizations.filter(o => o.isActive).length}
            </div>
            <div className="text-sm text-gray-400">Active</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-white">
              {organizations.reduce((sum, o) => sum + o.memberCount, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Members</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search organizations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-gray-800 border-gray-700 text-white"
        />
      </div>

      {/* Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left p-4 text-gray-400 font-medium">Organization</th>
                <th className="text-left p-4 text-gray-400 font-medium">Plan</th>
                <th className="text-left p-4 text-gray-400 font-medium">Members</th>
                <th className="text-left p-4 text-gray-400 font-medium">Projects</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrgs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No organizations found
                  </td>
                </tr>
              ) : (
                filteredOrgs.map((org) => (
                  <tr key={org.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-violet-400" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{org.name}</div>
                          <div className="text-sm text-gray-400">@{org.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className="bg-violet-500/20 text-violet-400">
                        {org.planName || "Free"}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-300">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {org.memberCount}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{org.projectCount}</td>
                    <td className="p-4">
                      {org.isActive ? (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-400">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(org)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteOrganization(org.id)} className="text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingOrg ? "Edit Organization" : "Create Organization"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Organization name"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s/g, "-") })}
                placeholder="org-slug"
                className="bg-gray-700 border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={form.planId} onValueChange={(v) => setForm({ ...form, planId: v })}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={saveOrganization} disabled={isSaving || !form.name}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editingOrg ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
