import { Router } from "express";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminUserController from "../../controllers/admin/user.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.list
);

router.get(
  "/for-enterprise",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.listForEnterprise
);

router.get(
  "/attendance/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.getAttendance
);

router.post(
  "/:userId/achievements/:achievementId",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.addUserAchievement
);

router.get(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.get
);

router.put(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.update
);

router.delete(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.deleteById
);

router.post(
  "/merge-presences",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.mergePresences
);

export default router;
