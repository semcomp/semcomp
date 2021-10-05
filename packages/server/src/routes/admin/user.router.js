const { Router } = require("express");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminUserController = require("../../controllers/admin/user.controller");

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
  AdminUserController.delete
);

router.post(
  "/merge-presences",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.mergePresences
);

module.exports = router;
