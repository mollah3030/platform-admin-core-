"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authStorage } from "./auth-storage";
import { authApi } from "@/resources/apis/auth.api";
import type { User, JwtPayload, LoginResponse } from "@/resources/interfaces";

interface AuthContextType {
  user: User | null;
  payload: JwtPayload | null;
  permissions: string[];
  isSuperAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginResponse) => void;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [payload, setPayload] = useState<JwtPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initAuth = useCallback(async () => {
    try {
      const storedUser = authStorage.getUser();
      const storedPayload = authStorage.getPayload();
      const token = authStorage.getAccessToken();

      if (token) {
        setUser(storedUser);
        setPayload(storedPayload);

        // Fetch fresh me payload
        try {
          const freshPayload = await authApi.getMe();
          setPayload(freshPayload);
          authStorage.setAuthData({
            accessToken: token,
            refreshToken: authStorage.getRefreshToken() || "",
            payload: freshPayload,
            user: storedUser || undefined,
          });
        } catch {
          // If token expired, getMe will fail and axios interceptor handles refresh/logout
        }
      } else {
        setUser(null);
        setPayload(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = useCallback((data: LoginResponse) => {
    // Decode or populate payload from JWT token
    let decodedPayload: JwtPayload | null = null;
    try {
      const parts = data.accessToken.split(".");
      if (parts.length === 3) {
        decodedPayload = JSON.parse(atob(parts[1]));
      }
    } catch {
      // fallback
    }

    authStorage.setAuthData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
      payload: decodedPayload || undefined,
    });

    setUser(data.user);
    if (decodedPayload) {
      setPayload(decodedPayload);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout network errors
    } finally {
      authStorage.clearAuthData();
      setUser(null);
      setPayload(null);
      router.push("/admin/login");
    }
  }, [router]);

  const refreshSession = useCallback(async () => {
    await initAuth();
  }, [initAuth]);

  const isSuperAdmin = Boolean(payload?.isSuperAdmin);
  const permissions = payload?.permissions || [];

  const hasPermission = useCallback(
    (perm: string): boolean => {
      if (isSuperAdmin) return true;
      return permissions.includes(perm);
    },
    [isSuperAdmin, permissions],
  );

  const hasAnyPermission = useCallback(
    (perms: string[]): boolean => {
      if (isSuperAdmin) return true;
      return perms.some((p) => permissions.includes(p));
    },
    [isSuperAdmin, permissions],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        payload,
        permissions,
        isSuperAdmin,
        isAuthenticated: Boolean(user || authStorage.getAccessToken()),
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
