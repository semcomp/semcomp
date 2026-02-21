import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import AchievementController from "../controllers/achievement.controller";
import { body } from "express-validator";

const router = Router();

router.get(
  "/",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  AchievementController.getUserAchievements
);


router.post(
  "/:achievementId/qrcode",
  [
    body("achievementId", "Invalid field 'achievementId'").isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  AchievementController.addQrCodeAchievement
)

export default router;
