import { Router } from "express";
import { param } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminAchievementController from "../../controllers/admin/achievement.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminAchievementController.list
);

router.post(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminAchievementController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminAchievementController.update
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminAchievementController.delete
);

export default router;
