const { Router } = require("express");
const { body } = require("express-validator");

const AuthMiddleware = require("../middlewares/auth.middleware");
const AuthController = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/signup",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
    body("permission", "Invalid field 'permission'").isBoolean(),
  ],
  AuthController.signup
);

router.post(
  "/signup-usp-second-step",
  [
    body("permission", "Invalid field 'permission'").isBoolean(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  AuthController.signupUspSecondStep
);

router.post(
  "/login",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
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
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
  ],
  AuthController.resetPassword
);

router.get(
  "/me",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  AuthController.getLoggedUser
);

router.get("/success", AuthController.authenticationSuccess);

router.get("/failure", AuthController.authenticationFailure);

router.get("/logout", AuthController.logout);

module.exports = router;
