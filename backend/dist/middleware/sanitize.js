"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeInputMiddleware = void 0;
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const sanitizeValue = (value) => {
    if (typeof value === "string") {
        return (0, sanitize_html_1.default)(value, {
            allowedTags: [],
            allowedAttributes: {},
        }).trim();
    }
    if (Array.isArray(value)) {
        return value.map((item) => sanitizeValue(item));
    }
    if (value && typeof value === "object") {
        const sanitized = {};
        for (const [key, nestedValue] of Object.entries(value)) {
            sanitized[key] = sanitizeValue(nestedValue);
        }
        return sanitized;
    }
    return value;
};
const sanitizeInputMiddleware = (req, _res, next) => {
    if (req.body && typeof req.body === "object") {
        req.body = sanitizeValue(req.body);
    }
    next();
};
exports.sanitizeInputMiddleware = sanitizeInputMiddleware;
//# sourceMappingURL=sanitize.js.map