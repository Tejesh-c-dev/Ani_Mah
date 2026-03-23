"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const response_1 = require("../utils/response");
const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError_1.AppError) {
        res.status(err.statusCode).json((0, response_1.errorResponse)(err.message));
        return;
    }
    console.error("Unexpected error:", err);
    res.status(500).json((0, response_1.errorResponse)("Internal server error"));
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map