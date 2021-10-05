const { Router } = require("express");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminLogController = require("../../controllers/admin/log.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminLogController.list
);

module.exports = router;
