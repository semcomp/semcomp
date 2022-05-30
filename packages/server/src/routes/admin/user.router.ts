import { Router } from "express";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminUserController from "../../controllers/admin/user.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.list
);

router.get(
  "/for-enterprise",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.listForEnterprise
);

router.get(
  "/attendance/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.getAttendance
);

router.post(
  "/:userId/achievements/:achievementId",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.addUserAchievement
);

router.get(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.get
);

router.put(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.update
);

router.delete(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.deleteById
);

export default router;
