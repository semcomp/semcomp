import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import itemController from "../../controllers/admin/item.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  itemController.list
);

router.post(
    "/",
    [
        body("name", "Invalid field 'name'").not().isEmpty(),
        body("value", "Invalid field 'value'").not().isEmpty(),
        body("maxQuantity", "Invalid field 'maxQuantity'").not().isEmpty(),
        body("tier", "Invalid field 'tier'").not().isEmpty(),
        adminAuthMiddleware.authenticate,
        adminAuthMiddleware.isAuthenticated,
    ],
    itemController.create
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  itemController.delete
);

export default router;
