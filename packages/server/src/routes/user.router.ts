import { Router } from "express";
import { body } from "express-validator";

import * as AuthMiddleware from "../middlewares/auth.middleware";
import UserController from "../controllers/user.controller";

const router = Router();

router.put(
  "/",
  [
    body("name", "Invalid field 'name'").optional().not().isEmpty(),
    body("permission", "Invalid field 'permission'").optional().isBoolean(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  UserController.update
);

export default router;
