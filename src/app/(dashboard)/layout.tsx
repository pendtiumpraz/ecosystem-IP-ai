"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import {
  Clapperboard,
  LayoutDashboard,
  FolderOpen,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Sparkles,
  Play,
  TrendingUp,
  ShoppingBag,
  Users,
  Shield,
} from "lucide-react";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Studio", icon: Clapperboard },
  { href: "/watch", label: "Watch", icon: Play },
  { href: "/invest", label: "Invest", icon: TrendingUp },
  { href: "/license", label: "License", icon: ShoppingBag },
  { href: "/fandom", label: "Fandom", icon: Users },
  { href: "/haki", label: "HAKI", icon: Shield },
];

const bottomLinks = [
  { href: "/credits", label: "Credits", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help", icon: HelpCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    } else if (!isLoading && user) {
      // Redirect to correct dashboard based on role
      if (user.role === "superadmin") router.push("/admin");
      else if (user.role === "investor") router.push("/investor");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading || !user || user.role !== "tenant") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/1765357415536-92189366.png" alt="MODO" width={36} height={36} className="rounded-lg" />
        </Link>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <Link href="/dashboard">
            <Image src="/1765357415536-92189366.png" alt="MODO" width={44} height={44} className="rounded-xl" />
          </Link>
        </div>

        {/* Navigation - Scrollable */}
        <div className="flex flex-col h-[calc(100%-4rem)] overflow-hidden">
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors",
                    isActive
                      ? "bg-orange-50 text-orange-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="my-3 border-t border-gray-100" />

            {/* Bottom Links */}
            {bottomLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Credits Card */}
          <div className="p-4 border-t border-gray-100">
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl p-3 text-white mb-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium text-sm">Credits</span>
                </div>
                <span className="text-lg font-bold">{user.creditBalance || 0}</span>
              </div>
              <div className="text-orange-200 text-xs mb-2">
                {user.subscriptionTier === "trial" ? "Trial Credits" : "Monthly Credits"}
              </div>
              <Link href="/credits">
                <Button size="sm" variant="white" className="w-full h-8 text-xs">
                  Get More Credits
                </Button>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-orange-600 font-medium text-sm">{user.name[0].toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-900 truncate">{user.name}</div>
                <div className="text-xs text-gray-500 capitalize">
                  {user.subscriptionTier || "Trial"}
                  {user.trialEndsAt && (
                    <> • {Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}d left</>
                  )}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
