import { Router } from "express";

import * as AuthMiddleware from "../middlewares/auth.middleware";
import AchievementController from "../controllers/achievement.controller";

const router = Router();

router.get(
  "/",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.authenticateUserHouse,
    AuthMiddleware.isAuthenticated,
  ],
  AchievementController.getUserAchievements
);

export default router;
