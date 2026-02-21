import { Router } from "express";
import { body, param } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import UserController from "../controllers/user.controller";

const router = Router();

router.put(
  "/",
  [
    body("name", "Invalid field 'name'").optional().not().isEmpty(),
    body("permission", "Invalid field 'permission'").optional().isBoolean(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  UserController.update
);

router.get(
  "/get-attendance",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  UserController.getAttendance
);

export default router;
