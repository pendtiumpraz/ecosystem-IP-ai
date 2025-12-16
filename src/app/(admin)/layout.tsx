"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Settings,
  Bot,
  DollarSign,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/organizations", label: "Organizations", icon: Building2 },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/payments", label: "Payments", icon: DollarSign },
  { href: "/admin/ai-providers", label: "AI Providers", icon: Bot },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "superadmin")) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "superadmin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-gray-700 z-40 flex items-center justify-between px-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image src="/1765357415536-92189366.png" alt="MODO" width={32} height={32} className="rounded-lg" />
          <span className="font-bold text-white">MODO Admin</span>
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-white">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-gray-800 border-r border-gray-700 z-50 transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/1765357415536-92189366.png" alt="MODO" width={40} height={40} className="rounded-xl" />
            <span className="text-xl font-bold text-white">Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-red-600/20 text-red-400"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white font-medium">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-gray-400">Superadmin</div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
