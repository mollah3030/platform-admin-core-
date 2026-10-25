import { appConfig } from "@/config/app.config";

// ─── API Config ───────────────────────────────────────────────────────────────
// All values are derived from the validated env schema in app.config.ts.
// Import apiConfig wherever you need API base URL, version, or timeouts.

export const apiConfig = {
    // Base URL comes from NEXT_PUBLIC_API_URL env var (validated at startup)
    baseURL: appConfig.env.NEXT_PUBLIC_API_URL,

    // API version prefix — empty because backend routes are prefixed as /admin/...
    apiVersion: "",

    // Axios request timeout in milliseconds
    requestTimeout: 120_000, // 120 seconds

    // Default headers attached to every Axios request
    // (Authorization header is added by the Axios interceptor in lib/axios.ts)
    defaultHeaders: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
} as const;