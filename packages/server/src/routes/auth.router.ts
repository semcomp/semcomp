import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import AuthController from "../controllers/auth.controller";

const router = Router();

router.post(
  "/signup",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 8 }),
    body("permission", "Invalid field 'permission'").isBoolean(),
  ],
  AuthController.signup
);

router.post(
  "/login",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 8 }),
  ],
  AuthController.login
);

router.post(
  "/forgot-password",
  [body("email", "Invalid field 'email'").isEmail()],
  AuthController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("code", "Invalid field 'code'").isLength({ min: 12, max: 12 }),
    body("password", "Invalid field 'password'").isLength({ min: 8 }),
  ],
  AuthController.resetPassword
);

router.get(
  "/me",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  AuthController.getLoggedUser
);

export default router;
