import { Router } from "express";
import { body, param } from "express-validator";

import ConfigController from "../controllers/admin/config.controller";
import authMiddleware from "../middlewares/auth.middleware";

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

router.put(
  "/coffee-quantity",
  ConfigController.setCoffeeQuantity,
  body("value", "Invalid field 'value'").not().isEmpty(),
);

router.get(
  "/coffee-total",
  ConfigController.getCoffeeTotal
);

router.get(
  "/coffee-quantity",
  ConfigController.getCoffeeQuantity
);

router.get(
  "/coffee-remaining",
  ConfigController.getRemainingCoffee
);

export default router;
