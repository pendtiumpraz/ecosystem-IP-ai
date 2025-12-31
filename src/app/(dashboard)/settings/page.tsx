"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import {
  User, Mail, Shield, CreditCard, Coins, Calendar,
  Settings, Key, Link2, Check, X, Loader2, ExternalLink,
  HardDrive, AlertCircle, Crown, Sparkles
} from "lucide-react";
import { toast } from "@/lib/sweetalert";

const PLAN_FEATURES: Record<string, string[]> = {
  trial: ["1 Project", "100 Credits", "Basic AI Models", "14 Days Access"],
  creator: ["5 Projects", "500 Credits/month", "All AI Models", "Email Support"],
  studio: ["20 Projects", "2000 Credits/month", "Priority AI", "Priority Support", "API Access"],
  enterprise: ["Unlimited Projects", "Unlimited Credits", "All Features", "24/7 Support", "Custom Models"],
};

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [checkingGoogle, setCheckingGoogle] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Check for Google connection status from URL params
  useEffect(() => {
    if (searchParams.get("google_connected") === "true") {
      setGoogleConnected(true);
    }
    if (searchParams.get("error")) {
      toast.error("Failed to connect Google: " + searchParams.get("error"));
    }
  }, [searchParams]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      });
      checkGoogleConnection();
    }
  }, [user]);

  async function checkGoogleConnection() {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/user/google-status?userId=${user.id}`);
      const data = await res.json();
      setGoogleConnected(data.connected);
    } catch (e) {
      console.error("Failed to check Google status:", e);
    } finally {
      setCheckingGoogle(false);
    }
  }

  async function handleSave() {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function connectGoogle() {
    if (!user?.id) return;
    window.location.href = `/api/auth/google?userId=${user.id}&returnUrl=/settings`;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Please login to view settings</p>
      </div>
    );
  }

  const planFeatures = PLAN_FEATURES[user.subscriptionTier || "trial"] || PLAN_FEATURES.trial;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-orange-600" />
          Settings
        </h1>
        <p className="text-gray-500">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-indigo-400 flex items-center justify-center text-white text-3xl font-bold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
                <p className="text-gray-500">{user.email}</p>
                <Badge variant={user.role === "superadmin" ? "destructive" : "secondary"} className="mt-1">
                  {user.role === "tenant" ? "Creator" : user.role}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Subscription Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-500" />
              Subscription
            </CardTitle>
            <CardDescription>Your current plan and credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-indigo-50 rounded-xl mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-semibold capitalize">
                    {user.subscriptionTier || "Trial"} Plan
                  </span>
                  {user.subscriptionTier === "enterprise" && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Enterprise
                    </Badge>
                  )}
                </div>
                {user.trialEndsAt && (
                  <p className="text-sm text-gray-600">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {user.subscriptionTier === "trial" ? "Trial ends" : "Renews"}: {" "}
                    {new Date(user.trialEndsAt).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
              <Button variant="outline">
                Upgrade Plan
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Coins className="w-4 h-4" />
                  Credit Balance
                </div>
                <div className="text-3xl font-bold text-orange-600">
                  {user.creditBalance || 0}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Sparkles className="w-4 h-4" />
                  Plan Features
                </div>
                <ul className="text-sm space-y-1">
                  {planFeatures.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <Check className="w-3 h-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <CreditCard className="w-4 h-4" />
              Buy More Credits
            </Button>
          </CardContent>
        </Card>

        {/* Integrations Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5" />
              Integrations
            </CardTitle>
            <CardDescription>Connect external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Drive */}
            <div className="flex items-center justify-between p-4 border rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Google Drive</h4>
                  <p className="text-sm text-gray-500">
                    Store generated images and videos
                  </p>
                </div>
              </div>
              {checkingGoogle ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : googleConnected ? (
                <Badge variant="success" className="bg-green-100 text-green-700">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              ) : (
                <Button onClick={connectGoogle} variant="outline">
                  <ExternalLink className="w-4 h-4" />
                  Connect
                </Button>
              )}
            </div>

            {/* Info about Google Drive */}
            {!googleConnected && !checkingGoogle && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Connect Google Drive</h4>
                  <p className="text-sm text-amber-700">
                    Connect your Google Drive to automatically save generated images and videos.
                    Files will be stored in a "MODO Creator Verse" folder in your Drive.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys Section (for Studio/Enterprise) */}
        {(user.subscriptionTier === "studio" || user.subscriptionTier === "enterprise") && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>Bring your own AI provider keys (BYOK)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-center py-8">
                BYOK feature coming soon. Use your own OpenAI, Anthropic, or other API keys.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>Account security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">
              <Key className="w-4 h-4" />
              Change Password
            </Button>
            <p className="text-sm text-gray-500">
              Last login: {new Date().toLocaleDateString("id-ID")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

