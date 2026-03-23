"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyProfileImage = exports.getMyProfile = exports.updateUserRole = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const register = async (req, res, next) => {
    try {
        const user = await authService.register(req.body);
        res.status(201).json((0, response_1.successResponse)(user));
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json((0, response_1.successResponse)(result));
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
const updateUserRole = async (req, res, next) => {
    try {
        const updated = await authService.updateUserRole(req.params.id, req.body);
        res.status(200).json((0, response_1.successResponse)(updated));
    }
    catch (err) {
        next(err);
    }
};
exports.updateUserRole = updateUserRole;
const getMyProfile = async (req, res, next) => {
    try {
        const profile = await authService.getMyProfile(req.userId);
        res.status(200).json((0, response_1.successResponse)(profile));
    }
    catch (err) {
        next(err);
    }
};
exports.getMyProfile = getMyProfile;
const updateMyProfileImage = async (req, res, next) => {
    try {
        const profile = await authService.updateMyProfileImage(req.userId, req.file);
        res.status(200).json((0, response_1.successResponse)(profile));
    }
    catch (err) {
        next(err);
    }
};
exports.updateMyProfileImage = updateMyProfileImage;
//# sourceMappingURL=auth.controller.js.map