import { Router } from "express";
import { param } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminRiddlethonGroupsController from "../../controllers/admin/riddlethon-group.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminRiddlethonGroupsController.list
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddlethonGroupsController.delete
);

export default router;
