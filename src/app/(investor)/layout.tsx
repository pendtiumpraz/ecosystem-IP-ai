"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  PieChart,
  Wallet,
  FileText,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useState } from "react";

const investorLinks = [
  { href: "/investor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/investor/discover", label: "Discover Projects", icon: Search },
  { href: "/investor/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/investor/returns", label: "Returns", icon: TrendingUp },
  { href: "/investor/analytics", label: "Analytics", icon: PieChart },
  { href: "/investor/wallet", label: "Wallet", icon: Wallet },
  { href: "/investor/documents", label: "Documents", icon: FileText },
];

const bottomLinks = [
  { href: "/investor/notifications", label: "Notifications", icon: Bell },
  { href: "/investor/settings", label: "Settings", icon: Settings },
];

export default function InvestorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "investor")) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== "investor") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <Link href="/investor" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-green-600">MODO Investor</span>
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
          <Link href="/investor" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              MODO Invest
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {investorLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/investor" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}

          <div className="my-4 border-t border-gray-100" />

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

        {/* Investment Stats */}
        <div className="absolute bottom-20 left-4 right-4">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <div className="text-sm text-green-100 mb-1">Total Invested</div>
            <div className="text-2xl font-bold mb-2">Rp 125M</div>
            <div className="flex items-center gap-1 text-sm text-green-100">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% returns</span>
            </div>
          </div>
        </div>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
              {user.name[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{user.name}</div>
              <div className="text-xs text-gray-500">Investor</div>
            </div>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-gray-600">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
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
