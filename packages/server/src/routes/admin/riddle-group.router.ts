import { Router } from "express";
import { param } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminRiddleGroupsController from "../../controllers/admin/riddle-group.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminRiddleGroupsController.list
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddleGroupsController.delete
);

export default router;
