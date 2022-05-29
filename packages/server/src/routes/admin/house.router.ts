import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import HouseController from "../../controllers/admin/house.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  HouseController.list
);

router.post(
  "/assign-houses",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  HouseController.assignHouses
);

router.post(
  "/:id/add-points",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    body("points", "Invalid field 'points'").isFloat({ gt: 0.0 }),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  HouseController.addPoints
);

router.post(
  "/:houseId/achievements/:achievementId",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  HouseController.addHouseAchievement
);

router.post(
  "/",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("description", "Invalid field 'description'").not().isEmpty(),
    body("telegramLink", "Invalid field 'telegramLink'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  HouseController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  HouseController.update
);

export default router;
