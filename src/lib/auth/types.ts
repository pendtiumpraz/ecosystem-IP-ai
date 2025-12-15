export type UserRole = "superadmin" | "tenant" | "investor";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  organizationId?: string;
  organizationName?: string;
  createdAt: Date;
  trialEndsAt?: Date;
  subscriptionTier?: "trial" | "creator" | "studio" | "enterprise";
  creditBalance?: number;
}

export interface Session {
  user: User;
  accessToken: string;
  expiresAt: Date;
}

// Role-based permissions
export const rolePermissions = {
  superadmin: [
    "manage_users",
    "manage_organizations",
    "manage_ai_providers",
    "manage_subscriptions",
    "verify_payments",
    "view_analytics",
    "system_settings",
  ],
  tenant: [
    "manage_projects",
    "use_ai",
    "manage_watch",
    "manage_invest",
    "manage_license",
    "manage_fandom",
    "manage_haki",
  ],
  investor: [
    "view_projects",
    "make_investments",
    "view_portfolio",
    "view_returns",
  ],
} as const;

export type Permission = (typeof rolePermissions)[UserRole][number];

export function hasPermission(user: User, permission: Permission): boolean {
  return (rolePermissions[user.role] as readonly string[]).includes(permission);
}

export function canAccessRoute(user: User, route: string): boolean {
  const superadminRoutes = ["/admin"];
  const tenantRoutes = ["/projects", "/watch", "/invest", "/license", "/fandom", "/haki"];
  const investorRoutes = ["/investor"];
  
  if (route.startsWith("/admin")) {
    return user.role === "superadmin";
  }
  if (route.startsWith("/investor")) {
    return user.role === "investor";
  }
  if (tenantRoutes.some(r => route.startsWith(r))) {
    return user.role === "tenant";
  }
  // Dashboard accessible by all
  if (route === "/dashboard") {
    return true;
  }
  return true;
}
