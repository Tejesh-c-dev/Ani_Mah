// Rate limiting middleware — protects write-heavy endpoints from spam
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

export const reviewWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || ipKeyGenerator(req.ip || ""),
  message: {
    success: false,
    data: null,
    error: "Too many review actions. Please try again later.",
  },
});
