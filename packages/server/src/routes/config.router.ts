import { Router } from "express";
import { body, param } from "express-validator";

import ConfigController from "../controllers/admin/config.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminAuthMiddleware from "../middlewares/admin-auth.middleware";

const router = Router();

router.get(
  "/",
  ConfigController.list
);

router.post(
  "/open-singup",
  [
    body("openSingup", "Invalid field 'openSingup'").isBoolean(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  ConfigController.setOpenSingup
);

export default router;
