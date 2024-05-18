import { Router } from "express";
import { body, param } from "express-validator";

import ConfigController from "../controllers/admin/config.controller";
import authMiddleware from "../middlewares/auth.middleware";
import adminAuthMiddleware from "../middlewares/admin-auth.middleware";

const router = Router();

router.get(
  "/",
  ConfigController.getOne
);


router.put(
  "/",
  ConfigController.update,
  body("config", "Invalid field 'config'").not().isEmpty(),
);

router.get(
  "/coffee-total",
  ConfigController.getCoffeeTotal
);

router.get(
  "/coffee-remaining",
  ConfigController.getRemainingCoffee
);

router.post(
  "/open-signup",
  [
    body("openSignup", "Invalid field 'openSignup'").isBoolean(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  ConfigController.setOpenSignup
);

router.post(
  "/open-sales",
  [
    body("openSales", "Invalid field 'openSales'").isBoolean(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  ConfigController.setOpenSales
);

router.post(
  "/switch-beta",
  [
    body("switchBeta", "Invalid field 'switchBeta'").isBoolean(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  ConfigController.setSwitchBeta
)

export default router;
