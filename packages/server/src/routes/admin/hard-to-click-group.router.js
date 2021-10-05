const { Router } = require("express");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminHardToClickGroupsController = require("../../controllers/admin/hard-to-click-group.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.list
);

router.get(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.get
);

router.delete(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.delete
);

module.exports = router;
