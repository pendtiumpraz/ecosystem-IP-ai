"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Users, Search, Filter, MoreVertical, Edit, Trash2, Ban,
  CheckCircle, XCircle, UserCheck, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  userType: string;
  subscriptionTier: string | null;
  creditBalance: number;
  emailVerified: boolean;
  isActive: boolean;
  trialEndsAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [filterType, page]);

  async function fetchUsers() {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "20",
        offset: String(page * 20),
        ...(filterType !== "all" && { userType: filterType }),
        ...(search && { search }),
      });
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  }

  async function handleUpdateUser(userId: string, updates: Partial<User>) {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, ...updates }),
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  async function toggleUserActive(user: User) {
    await handleUpdateUser(user.id, { isActive: !user.isActive } as any);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="w-7 h-7" />
            Users Management
          </h1>
          <p className="text-gray-400">Manage all platform users</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-800 border-gray-700 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <form onSubmit={handleSearch} className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name or email..."
                  className="pl-9 bg-gray-700 border-gray-600 text-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </form>
            <div className="flex gap-2">
              {["all", "tenant", "investor", "superadmin"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setFilterType(type); setPage(0); }}
                  className={filterType !== type ? "border-gray-600 text-gray-300" : ""}
                >
                  {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Subscription</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Credits</th>
                    <th className="text-center p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-medium">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.name}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          user.userType === "superadmin" ? "bg-red-500/20 text-red-400" :
                          user.userType === "investor" ? "bg-green-500/20 text-green-400" :
                          "bg-blue-500/20 text-blue-400"
                        }`}>
                          {user.userType}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-300">
                          {user.subscriptionTier || "-"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-white font-medium">{user.creditBalance}</span>
                      </td>
                      <td className="p-4 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <XCircle className="w-4 h-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => toggleUserActive(user)}
                          >
                            {user.isActive ? <Ban className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {user.userType !== "superadmin" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-red-400"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-gray-700">
            <span className="text-sm text-gray-400">
              Showing {page * 20 + 1}-{Math.min((page + 1) * 20, total)} of {total} users
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="border-gray-600 text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={(page + 1) * 20 >= total}
                onClick={() => setPage(p => p + 1)}
                className="border-gray-600 text-gray-300"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white">Edit User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">User Type</label>
                <select
                  value={editingUser.userType}
                  onChange={(e) => setEditingUser({ ...editingUser, userType: e.target.value })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="tenant">Tenant (Creator)</option>
                  <option value="investor">Investor</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Subscription Tier</label>
                <select
                  value={editingUser.subscriptionTier || ""}
                  onChange={(e) => setEditingUser({ ...editingUser, subscriptionTier: e.target.value || null })}
                  className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white"
                >
                  <option value="">None</option>
                  <option value="trial">Trial</option>
                  <option value="creator">Creator</option>
                  <option value="studio">Studio</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400">Credit Balance</label>
                <Input
                  type="number"
                  value={editingUser.creditBalance}
                  onChange={(e) => setEditingUser({ ...editingUser, creditBalance: parseInt(e.target.value) })}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUpdateUser(editingUser.id, {
                    name: editingUser.name,
                    userType: editingUser.userType,
                    subscriptionTier: editingUser.subscriptionTier,
                    creditBalance: editingUser.creditBalance,
                  } as any)}
                >
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
