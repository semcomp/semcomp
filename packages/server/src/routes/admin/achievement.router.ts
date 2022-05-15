import { Router } from "express";
import { param } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminAchievementController from "../../controllers/admin/achievement.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminAchievementController.list
);

router.post(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminAchievementController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminAchievementController.update
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminAchievementController.delete
);

export default router;
