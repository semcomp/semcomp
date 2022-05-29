import { Router } from "express";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminHardToClickGroupsController from "../../controllers/admin/hard-to-click-group.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.list
);

router.get(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.get
);

router.delete(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickGroupsController.deleteById
);

export default router;
