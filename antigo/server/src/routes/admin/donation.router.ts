import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import donationController from "../../controllers/admin/donation.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  donationController.list
);

router.post(
    "/",
    [
        body("houseId", "Invalid field 'houseId'").not().isEmpty(),
        body("item", "Invalid field 'item'").not().isEmpty(),
        body("quantity", "Invalid field 'quantity'").not().isEmpty(),
        body("points", "Invalid field 'points'").not().isEmpty(),
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated,
    ],
    donationController.create
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  donationController.delete
);

export default router;
