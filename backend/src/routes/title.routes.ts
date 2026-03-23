// Title routes — CRUD for anime, manhwa, and movie titles
import { Router } from "express";
import * as titleController from "../controllers/title.controller";
import { authMiddleware } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.post("/", authMiddleware, upload.single("image"), titleController.createTitle);
router.get("/", titleController.getAllTitles);
router.get("/recommendations", authMiddleware, titleController.getRecommendedTitles);
router.get("/:id", titleController.getTitleById);

export default router;
