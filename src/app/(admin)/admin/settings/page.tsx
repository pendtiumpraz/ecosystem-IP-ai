"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Save, Globe, Mail, Shield, Database, Loader2 } from "lucide-react";
import { toast } from "@/lib/sweetalert";

export default function AdminSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: "MODO Creator Verse",
    siteUrl: "https://modo.creator.id",
    supportEmail: "support@modo.id",
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    defaultCredits: 100,
    trialDays: 14,
  });

  async function handleSave() {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast.success("Settings saved!");
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Settings className="w-7 h-7 text-orange-400" />
            Platform Settings
          </h1>
          <p className="text-gray-400">Configure system-wide settings</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Globe className="w-5 h-5" />
              General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Site Name</Label>
              <Input
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Site URL</Label>
              <Input
                value={settings.siteUrl}
                onChange={(e) => setSettings({ ...settings, siteUrl: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Support Email</Label>
              <Input
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Maintenance Mode</Label>
                <p className="text-sm text-gray-500">Disable access for non-admin users</p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Allow Registration</Label>
                <p className="text-sm text-gray-500">Enable new user registration</p>
              </div>
              <Switch
                checked={settings.allowRegistration}
                onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-gray-300">Email Verification</Label>
                <p className="text-sm text-gray-500">Require email verification</p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Default Values */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5" />
              Default Values
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Default Credits for New Users</Label>
              <Input
                type="number"
                value={settings.defaultCredits}
                onChange={(e) => setSettings({ ...settings, defaultCredits: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Trial Period (days)</Label>
              <Input
                type="number"
                value={settings.trialDays}
                onChange={(e) => setSettings({ ...settings, trialDays: parseInt(e.target.value) || 0 })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

