const { Router } = require("express");
const { body } = require("express-validator");

const PushNotificationController = require("../controllers/push-notification.controller");
const AuthMiddleware = require("../middlewares/auth.middleware");

const router = Router();

router.post(
  "/subscribe",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
    body("token", "Invalid field 'token'").not().isEmpty(),
  ],
  PushNotificationController.subscribe
);

module.exports = router;
