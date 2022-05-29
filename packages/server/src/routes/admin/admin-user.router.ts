import { Router } from "express";
import { body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminUserController from "../../controllers/admin/admin-user.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminUserController.list
);

router.post(
  "/",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
    body("adminRole", "Invalid field 'adminRole'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminUserController.create
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
