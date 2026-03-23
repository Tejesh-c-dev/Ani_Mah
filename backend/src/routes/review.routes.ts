// Review routes — CRUD for reviews (all protected)
import { Router } from "express";
import * as reviewController from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth";
import { reviewWriteLimiter } from "../middleware/rateLimit";

const router = Router();

router.post("/", authMiddleware, reviewWriteLimiter, reviewController.createReview);
router.put("/:id", authMiddleware, reviewWriteLimiter, reviewController.updateReview);
router.delete("/:id", authMiddleware, reviewWriteLimiter, reviewController.deleteReview);
router.post("/:id/replies", authMiddleware, reviewWriteLimiter, reviewController.createReply);
router.post("/:id/vote", authMiddleware, reviewWriteLimiter, reviewController.voteReview);

export default router;
