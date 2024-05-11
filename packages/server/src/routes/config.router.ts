import { Router } from "express";
import { body, param } from "express-validator";

import ConfigController from "../controllers/admin/config.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  ConfigController.list
);

export default router;
