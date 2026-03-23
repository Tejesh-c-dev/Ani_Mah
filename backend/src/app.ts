// Express app entry point — wires up middleware, routes, and error handler
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import titleRoutes from "./routes/title.routes";
import reviewRoutes from "./routes/review.routes";
import { errorHandler } from "./middleware/errorHandler";
import { sanitizeInputMiddleware } from "./middleware/sanitize";
import { validateEnv } from "./utils/env";

validateEnv();

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://ani-mah-1.vercel.app"
  ],
  credentials: true
}));
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
