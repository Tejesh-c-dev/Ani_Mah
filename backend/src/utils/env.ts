// Environment validation and derived config helpers

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
] as const;

export const validateEnv = (): void => {
  const missing: string[] = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
    missing.push("CORS_ORIGIN");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
};

export const corsOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
