"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = void 0;
const AppError_1 = require("../utils/AppError");
const requireAdmin = (req, _res, next) => {
    if (req.userRole !== "ADMIN") {
        throw new AppError_1.AppError("Admin access required", 403);
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=admin.js.map