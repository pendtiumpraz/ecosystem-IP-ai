"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Shield, FileText, Search, AlertTriangle, CheckCircle, Clock,
  Plus, Upload, Download, Eye, ExternalLink, Calendar,
  ShieldCheck, FileSearch, Lock, Gavel, ClipboardCheck, Bell
} from "lucide-react";

const mockRegistrations = [
  {
    id: "1",
    title: "Legenda Nusantara",
    type: "Hak Cipta",
    registrationNo: "EC00202312345",
    status: "registered",
    filedDate: "2023-06-15",
    expiresDate: "2073-06-15",
    thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=200&fit=crop",
  },
  {
    id: "2",
    title: "Gatotkaca Character Design",
    type: "Hak Cipta",
    registrationNo: "EC00202312346",
    status: "registered",
    filedDate: "2023-07-20",
    expiresDate: "2073-07-20",
    thumbnail: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=200&h=200&fit=crop",
  },
  {
    id: "3",
    title: "MODO Logo",
    type: "Merek Dagang",
    registrationNo: null,
    status: "pending",
    filedDate: "2024-01-10",
    expiresDate: null,
    thumbnail: "https://images.unsplash.com/photo-1560009320-6c12f6e75ed0?w=200&h=200&fit=crop",
  },
];

const mockAlerts = [
  {
    id: "1",
    type: "infringement",
    title: "Potential Infringement Detected",
    description: "Similar content found on YouTube channel 'CopyIP'",
    severity: "high",
    time: "2 hours ago",
  },
  {
    id: "2",
    type: "renewal",
    title: "Trademark Renewal Due",
    description: "MODO Logo trademark expires in 30 days",
    severity: "medium",
    time: "1 day ago",
  },
];

const stats = [
  { label: "Registered IPs", value: "5", icon: ShieldCheck, color: "green" },
  { label: "Pending Applications", value: "2", icon: Clock, color: "amber" },
  { label: "Active Monitors", value: "12", icon: FileSearch, color: "blue" },
  { label: "Alerts This Month", value: "3", icon: AlertTriangle, color: "red" },
];

const registrationTypes = [
  { type: "Hak Cipta", description: "Protect your creative works", icon: FileText },
  { type: "Merek Dagang", description: "Protect your brand identity", icon: Shield },
  { type: "Paten", description: "Protect your inventions", icon: Lock },
  { type: "Desain Industri", description: "Protect your product designs", icon: ClipboardCheck },
];

export default function HakiPage() {
  const [activeTab, setActiveTab] = useState<"registrations" | "monitor">("registrations");

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-7 h-7 text-blue-500" />
            HAKI
          </h1>
          <p className="text-gray-500">Protect your intellectual property</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSearch className="w-4 h-4" />
            Run IP Scan
          </Button>
          <Button>
            <Plus className="w-4 h-4" />
            New Registration
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts */}
      {mockAlerts.length > 0 && (
        <div className="mb-8 space-y-3">
          {mockAlerts.map((alert) => (
            <Card key={alert.id} className={`border-l-4 ${
              alert.severity === "high" ? "border-l-red-500 bg-red-50" :
              alert.severity === "medium" ? "border-l-amber-500 bg-amber-50" :
              "border-l-blue-500 bg-blue-50"
            }`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.severity === "high" ? "text-red-500" :
                    alert.severity === "medium" ? "text-amber-500" :
                    "text-blue-500"
                  }`} />
                  <div>
                    <h3 className="font-medium text-gray-900">{alert.title}</h3>
                    <p className="text-sm text-gray-600">{alert.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{alert.time}</span>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "registrations" ? "default" : "outline"}
              onClick={() => setActiveTab("registrations")}
            >
              <FileText className="w-4 h-4" />
              Registrations
            </Button>
            <Button
              variant={activeTab === "monitor" ? "default" : "outline"}
              onClick={() => setActiveTab("monitor")}
            >
              <Eye className="w-4 h-4" />
              Monitor
            </Button>
          </div>

          {activeTab === "registrations" ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>IP Registrations</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search..." className="pl-9 w-48" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockRegistrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={reg.thumbnail}
                      alt={reg.title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{reg.title}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          reg.status === "registered"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {reg.status === "registered" ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Registered
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{reg.type}</p>
                      {reg.registrationNo && (
                        <p className="text-sm text-gray-500">No: {reg.registrationNo}</p>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Filed: {reg.filedDate}</div>
                      {reg.expiresDate && (
                        <div className="text-gray-500">Expires: {reg.expiresDate}</div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Infringement Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    AI-Powered IP Monitoring
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Our AI continuously scans the web for unauthorized use of your registered IPs
                  </p>
                  <Button>
                    <FileSearch className="w-4 h-4" />
                    Configure Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Registration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {registrationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.type}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{type.type}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Legal Support */}
          <Card className="bg-gradient-to-br from-blue-500 to-amber-600 text-white">
            <CardContent className="p-6">
              <Gavel className="w-8 h-8 mb-3 opacity-80" />
              <h3 className="font-semibold mb-1">Need Legal Help?</h3>
              <p className="text-sm text-blue-100 mb-4">
                Connect with verified IP lawyers for registration assistance or enforcement
              </p>
              <Button variant="white" size="sm">
                <Gavel className="w-4 h-4" />
                Find Lawyer
              </Button>
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-600 hover:text-orange-600">
                <FileText className="w-4 h-4" />
                HAKI Registration Guide
              </a>
              <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-600 hover:text-orange-600">
                <FileText className="w-4 h-4" />
                Copyright vs Trademark
              </a>
              <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-600 hover:text-orange-600">
                <FileText className="w-4 h-4" />
                Infringement Response
              </a>
              <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 text-sm text-gray-600 hover:text-orange-600">
                <ExternalLink className="w-4 h-4" />
                DJKI Official Website
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

