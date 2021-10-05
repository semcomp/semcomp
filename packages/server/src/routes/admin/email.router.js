const { Router } = require("express");
const { body } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const EmailController = require("../../controllers/admin/email.controller");

const router = Router();

router.post(
  "/send",
  [
    body("subject", "Invalid field 'subject'").not().isEmpty(),
    body("text", "Invalid field 'text'").not().isEmpty(),
    body("html", "Invalid field 'html'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  EmailController.sendEmail
);

module.exports = router;
