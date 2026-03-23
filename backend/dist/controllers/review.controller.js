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
exports.voteReview = exports.createReply = exports.deleteReview = exports.updateReview = exports.createReview = void 0;
const reviewService = __importStar(require("../services/review.service"));
const response_1 = require("../utils/response");
const createReview = async (req, res, next) => {
    try {
        const review = await reviewService.createReview(req.userId, req.body);
        res.status(201).json((0, response_1.successResponse)(review));
    }
    catch (err) {
        next(err);
    }
};
exports.createReview = createReview;
const updateReview = async (req, res, next) => {
    try {
        const review = await reviewService.updateReview(req.userId, req.params.id, req.body);
        res.status(200).json((0, response_1.successResponse)(review));
    }
    catch (err) {
        next(err);
    }
};
exports.updateReview = updateReview;
const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview(req.userId, req.params.id, req.userRole || "USER");
        res.status(200).json((0, response_1.successResponse)({ message: "Review deleted" }));
    }
    catch (err) {
        next(err);
    }
};
exports.deleteReview = deleteReview;
const createReply = async (req, res, next) => {
    try {
        const reply = await reviewService.createReply(req.userId, req.params.id, req.body);
        res.status(201).json((0, response_1.successResponse)(reply));
    }
    catch (err) {
        next(err);
    }
};
exports.createReply = createReply;
const voteReview = async (req, res, next) => {
    try {
        const result = await reviewService.voteReview(req.userId, req.params.id, req.body);
        res.status(200).json((0, response_1.successResponse)(result));
    }
    catch (err) {
        next(err);
    }
};
exports.voteReview = voteReview;
//# sourceMappingURL=review.controller.js.map