"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Express app entry point — wires up middleware, routes, and error handler
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const title_routes_1 = __importDefault(require("./routes/title.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const sanitize_1 = require("./middleware/sanitize");
const env_1 = require("./utils/env");
(0, env_1.validateEnv)();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    credentials: true,
    origin: (origin, callback) => {
        if (!origin) {
            callback(null, true);
            return;
        }
        if (env_1.corsOrigins.length === 0 || env_1.corsOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("Not allowed by CORS"));
    },
};
// Global middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(sanitize_1.sanitizeInputMiddleware);
// Routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/titles", title_routes_1.default);
app.use("/api/reviews", review_routes_1.default);
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
});
// Centralized error handler (must be last)
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=app.js.map