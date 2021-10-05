const { Router } = require("express");
const { body } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const AdminUserController = require("../../controllers/admin/admin-user.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminUserController.list
);

router.post(
  "/",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
    body("adminRole", "Invalid field 'adminRole'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminUserController.create
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

module.exports = router;
