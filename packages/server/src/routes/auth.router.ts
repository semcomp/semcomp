import { Router } from "express";

import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import AuthController from "../controllers/auth.controller";

export default class AuthRouter {
  private authController: AuthController;

  constructor(authController: AuthController) {
    this.authController = authController;
  }

  public create(): Router {
    const router = Router();

    router.post(
      "/signup",
      [
        body("name", "Invalid field 'name'").not().isEmpty(),
        body("email", "Invalid field 'email'").isEmail(),
        body("password", "Invalid field 'password'").isLength({ min: 8 }),
        body("permission", "Invalid field 'permission'").isBoolean(),
      ],
      (req, res, next) => this.authController.signup(req, res, next),
    );

    router.post(
      "/login",
      [
        body("email", "Invalid field 'email'").isEmail(),
        body("password", "Invalid field 'password'").isLength({ min: 8 }),
      ],
      (req, res, next) => this.authController.login(req, res, next),
    );

    router.post(
      "/forgot-password",
      [body("email", "Invalid field 'email'").isEmail()],
      (req, res, next) => this.authController.forgotPassword(req, res, next),
    );
    
    //Optional code if you want another email only for the verification
    router.post(
      "/send-verification-code",
      [body("email", "Invalid field 'email'").isEmail()],
      (req, res, next) => this.authController.sendVerificationCode(req, res, next),
    );
    router.post(
      "/confirm-verification-code",
      [
        body("email", "Invalid field 'email'").isEmail(),
        body("code", "Invalid field 'code'").isLength({ min: 12, max: 12 }),
      ],
      (req, res, next) => this.authController.confirmVerificationCode(req, res, next),
    );

    router.post(
      "/reset-password",
      [
        body("email", "Invalid field 'email'").isEmail(),
        body("code", "Invalid field 'code'").isLength({ min: 12, max: 12 }),
        body("password", "Invalid field 'password'").isLength({ min: 8 }),
      ],
      (req, res, next) => this.authController.resetPassword(req, res, next),
    );

    router.get(
      "/me",
      [authMiddleware.authenticate, authMiddleware.isAuthenticated],
      (req, res, next) => this.authController.getLoggedUser(req, res, next),
    );

    return router;
  }
}
