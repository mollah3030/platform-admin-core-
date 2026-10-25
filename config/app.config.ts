import { z, ZodError } from "zod";

// ─── Environment Schema ───────────────────────────────────────────────────────
// Validates and provides typed access to all environment variables at startup.
// In Next.js, client-accessible vars MUST be prefixed with NEXT_PUBLIC_.

export const envSchema = z.object({
    // ── App ───────────────────────────────────────────────────────────────────
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),

    // ── API ───────────────────────────────────────────────────────────────────
    // NEXT_PUBLIC_ prefix makes these available on both server and client.
    NEXT_PUBLIC_API_URL: z
        .string()
        .url("NEXT_PUBLIC_API_URL must be a valid URL")
        .default("http://localhost:4040"),

    // ── Auth cookies ─────────────────────────────────────────────────────────
    // These are only read server-side (middleware / route handlers).
    AUTH_COOKIE_KEY: z.string().default("crm_access_token"),
    REFRESH_COOKIE_KEY: z.string().default("crm_refresh_token"),
});

export type EnvConfig = z.infer<typeof envSchema>;

// ── Parse and validate at module load time ────────────────────────────────────
const parseEnv = (): EnvConfig => {
    try {
        return envSchema.parse({
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
            AUTH_COOKIE_KEY: process.env.AUTH_COOKIE_KEY,
            REFRESH_COOKIE_KEY: process.env.REFRESH_COOKIE_KEY,
        });
    } catch (error) {
        if (error instanceof ZodError) {
            const messages = error.issues
                .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
                .join("\n");
            throw new Error(`Environment validation failed:\n${messages}`);
        }
        throw new Error(`Environment validation failed: ${error}`);
    }
};

// ─── App Config ───────────────────────────────────────────────────────────────
export const appConfig = {
    env: parseEnv(),

    app: {
        name: "Plartform Pannel",
        version: "1.4.0",
    },

    pagination: {
        defaultPageSize: 25,
        pageSizeOptions: [10, 25, 50, 100],
    },

    dateFormats: {
        display: "MMM DD, YYYY",
        api: "YYYY-MM-DD",
        datetime: "MMM DD, YYYY HH:mm",
    },
};