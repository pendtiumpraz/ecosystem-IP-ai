"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, Session } from "./types";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; redirectTo?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedSession = localStorage.getItem("modo_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        // Convert date strings back to Date objects
        parsed.user.createdAt = new Date(parsed.user.createdAt);
        if (parsed.user.trialEndsAt) parsed.user.trialEndsAt = new Date(parsed.user.trialEndsAt);
        parsed.expiresAt = new Date(parsed.expiresAt);
        
        // Check if session expired
        if (parsed.expiresAt > new Date()) {
          setUser(parsed.user);
          setSession(parsed);
        } else {
          localStorage.removeItem("modo_session");
        }
      } catch (e) {
        localStorage.removeItem("modo_session");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (data.success && data.user) {
        const loggedInUser: User = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          avatar: data.user.avatarUrl,
          role: data.user.userType as UserRole,
          organizationId: data.user.organizationId,
          organizationName: data.user.organizationName,
          createdAt: new Date(data.user.createdAt),
          trialEndsAt: data.user.trialEndsAt ? new Date(data.user.trialEndsAt) : undefined,
          subscriptionTier: data.user.subscriptionTier,
          creditBalance: data.user.creditBalance,
        };
        
        const newSession: Session = {
          user: loggedInUser,
          accessToken: data.token || "session_" + Date.now(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        
        setUser(loggedInUser);
        setSession(newSession);
        localStorage.setItem("modo_session", JSON.stringify(newSession));
        
        // Determine redirect based on role
        let redirectTo = "/dashboard";
        if (loggedInUser.role === "superadmin") redirectTo = "/admin";
        else if (loggedInUser.role === "investor") redirectTo = "/investor";
        
        setIsLoading(false);
        return { success: true, redirectTo };
      }
      
      setIsLoading(false);
      return { success: false, error: data.error || "Login failed" };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (result.success && result.user) {
        const newUser: User = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.userType as UserRole,
          createdAt: new Date(result.user.createdAt),
          trialEndsAt: result.user.trialEndsAt ? new Date(result.user.trialEndsAt) : undefined,
          subscriptionTier: result.user.subscriptionTier,
          creditBalance: result.user.creditBalance,
        };
        
        const newSession: Session = {
          user: newUser,
          accessToken: result.token || "session_" + Date.now(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        };
        
        setUser(newUser);
        setSession(newSession);
        localStorage.setItem("modo_session", JSON.stringify(newSession));
        setIsLoading(false);
        return { success: true };
      }
      
      setIsLoading(false);
      return { success: false, error: result.error || "Registration failed" };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem("modo_session");
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
