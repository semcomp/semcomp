const { Router } = require("express");
const { param } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminRiddleGroupsController = require("../../controllers/admin/riddle-group.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminRiddleGroupsController.list
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddleGroupsController.delete
);

module.exports = router;
