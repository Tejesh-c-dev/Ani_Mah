// Auth routes — register and login
import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth";
import { requireAdmin } from "../middleware/admin";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me/profile", authMiddleware, authController.getMyProfile);
router.patch("/me/profile-image", authMiddleware, upload.single("image"), authController.updateMyProfileImage);
router.patch("/users/:id/role", authMiddleware, requireAdmin, authController.updateUserRole);

export default router;
