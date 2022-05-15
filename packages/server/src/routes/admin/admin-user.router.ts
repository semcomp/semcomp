import { Router } from "express";
import { body } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminUserController from "../../controllers/admin/admin-user.controller";

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
  AdminUserController.deleteById
);

export default router;
