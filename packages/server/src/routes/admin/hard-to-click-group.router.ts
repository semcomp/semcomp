import { Router } from "express";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminHardToClickGroupsController from "../../controllers/admin/hard-to-click-group.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.list
);

router.get(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.get
);

router.delete(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.deleteById
);

export default router;
