import { Router } from "express";
import { body } from "express-validator";

import PushNotificationController from "../controllers/push-notification.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.post(
  "/subscribe",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
    body("token", "Invalid field 'token'").not().isEmpty(),
  ],
  PushNotificationController.subscribe
);

export default router;
