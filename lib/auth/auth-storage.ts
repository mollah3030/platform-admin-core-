import { appConfig } from "@/config/app.config";
import type { User, JwtPayload } from "@/resources/interfaces";

const ACCESS_TOKEN_KEY = appConfig.env.AUTH_COOKIE_KEY || "crm_access_token";
const REFRESH_TOKEN_KEY = appConfig.env.REFRESH_COOKIE_KEY || "crm_refresh_token";
const USER_KEY = "platform_admin_user";
const PAYLOAD_KEY = "platform_admin_payload";

// Helper to set cookie
function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export const authStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookie(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY) || getCookie(REFRESH_TOKEN_KEY);
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  getPayload(): JwtPayload | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(PAYLOAD_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as JwtPayload;
    } catch {
      return null;
    }
  },

  setAuthData(params: {
    accessToken: string;
    refreshToken: string;
    user?: User;
    payload?: JwtPayload;
  }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, params.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, params.refreshToken);
    setCookie(ACCESS_TOKEN_KEY, params.accessToken);
    setCookie(REFRESH_TOKEN_KEY, params.refreshToken);

    if (params.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(params.user));
    }
    if (params.payload) {
      localStorage.setItem(PAYLOAD_KEY, JSON.stringify(params.payload));
    }
  },

  clearAuthData() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PAYLOAD_KEY);
    deleteCookie(ACCESS_TOKEN_KEY);
    deleteCookie(REFRESH_TOKEN_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getAccessToken());
  },
};
