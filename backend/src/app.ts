// Express app entry point — wires up middleware, routes, and error handler
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import titleRoutes from "./routes/title.routes";
import reviewRoutes from "./routes/review.routes";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInputMiddleware } from "./middleware/sanitize";
import { corsOrigins, validateEnv } from "./utils/env";

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions: cors.CorsOptions = {
  credentials: true,
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (corsOrigins.length === 0 || corsOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Not allowed by CORS"));
  },
};

// Global middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(sanitizeInputMiddleware);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/titles", titleRoutes);
app.use("/api/reviews", reviewRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Centralized error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
