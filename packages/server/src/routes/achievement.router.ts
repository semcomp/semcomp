import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import AchievementController from "../controllers/achievement.controller";

const router = Router();

router.get(
  "/",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  AchievementController.getUserAchievements
);

export default router;
