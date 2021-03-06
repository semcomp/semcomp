import { Router } from "express";
import { body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import emailController from "../../controllers/admin/email.controller";

const router = Router();

router.post(
  "/send",
  [
    body("subject", "Invalid field 'subject'").not().isEmpty(),
    body("text", "Invalid field 'text'").not().isEmpty(),
    body("html", "Invalid field 'html'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  emailController.send
);

export default router;
