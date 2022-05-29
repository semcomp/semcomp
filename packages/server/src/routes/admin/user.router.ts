import { Router } from "express";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminUserController from "../../controllers/admin/user.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.list
);

router.get(
  "/for-enterprise",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.listForEnterprise
);

router.get(
  "/attendance/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.getAttendance
);

router.post(
  "/:userId/achievements/:achievementId",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.addUserAchievement
);

router.get(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.get
);

router.put(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.update
);

router.delete(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  adminUserController.deleteById
);

export default router;
