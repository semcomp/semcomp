import { Router } from "express";
import { param } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminRiddlethonGroupsController from "../../controllers/admin/riddlethon-group.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminRiddlethonGroupsController.list
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddlethonGroupsController.delete
);

export default router;
