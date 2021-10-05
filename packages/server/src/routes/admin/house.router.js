const { Router } = require("express");
const { param, body } = require("express-validator");

const AdminAuthMiddleware = require("../../middlewares/admin-auth.middleware");
const HouseController = require("../../controllers/admin/house.controller");

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  HouseController.list
);

router.post(
  "/assign-houses",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  HouseController.assignHouses
);

router.post(
  "/:id/add-points",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    body("points", "Invalid field 'points'").isFloat({ gt: 0.0 }),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  HouseController.addPoints
);

router.post(
  "/:houseId/achievements/:achievementId",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  HouseController.addHouseAchievement
);

router.post(
  "/",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("description", "Invalid field 'description'").not().isEmpty(),
    body("telegramLink", "Invalid field 'telegramLink'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  HouseController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  HouseController.update
);

module.exports = router;
