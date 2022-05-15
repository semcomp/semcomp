import { Router } from "express";
import { body } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as PushNotificationController from "../../controllers/admin/push-notification.controller";

const router = Router();

router.post(
  "/send",
  [
    body("title", "Invalid field 'title'").not().isEmpty(),
    body("text", "Invalid field 'text'").not().isEmpty(),
    body("image", "Invalid field 'image'").not().isEmpty(),
    body("tag", "Invalid field 'tag'").not().isEmpty(),
    body("url", "Invalid field 'url'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  PushNotificationController.sendPushNotification
);

export default router;
