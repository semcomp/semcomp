const { Router } = require("express");
const { body } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const PushNotificationController = require("../../controllers/admin/push-notification.controller");

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

module.exports = router;
