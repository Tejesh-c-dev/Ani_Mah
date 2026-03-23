"use strict";
// Environment validation and derived config helpers
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOrigins = exports.validateEnv = void 0;
const REQUIRED_ENV_VARS = [
    "DATABASE_URL",
    "JWT_SECRET",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
];
const validateEnv = () => {
    const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
    if (process.env.NODE_ENV === "production" && !process.env.CORS_ORIGIN) {
        missing.push("CORS_ORIGIN");
    }
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
};
exports.validateEnv = validateEnv;
exports.corsOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
//# sourceMappingURL=env.js.map