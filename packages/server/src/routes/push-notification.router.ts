import { Router } from "express";
import { body } from "express-validator";

import PushNotificationController from "../controllers/push-notification.controller";
import * as AuthMiddleware from "../middlewares/auth.middleware";

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

export default router;
