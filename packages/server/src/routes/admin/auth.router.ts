import { Router } from "express";
import { body } from "express-validator";

import AdminAuthController from "../../controllers/admin/admin-auth.controller";

const router = Router();

router.post(
  "/signup",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
  ],
  AdminAuthController.signup
);

router.post(
  "/login",
  [
    body("email", "Invalid field 'email'").isEmail(),
    body("password", "Invalid field 'password'").isLength({ min: 6 }),
  ],
  AdminAuthController.login
)

export default router;
