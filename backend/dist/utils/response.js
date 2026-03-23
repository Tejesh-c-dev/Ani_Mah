"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = void 0;
const successResponse = (data) => ({
    success: true,
    data,
    error: null,
});
exports.successResponse = successResponse;
const errorResponse = (error) => ({
    success: false,
    data: null,
    error,
});
exports.errorResponse = errorResponse;
//# sourceMappingURL=response.js.map