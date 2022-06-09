import { Router } from "express";
import { param } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminHardToClickGroupsController from "../../controllers/admin/hard-to-click-group.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminHardToClickGroupsController.list
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminHardToClickGroupsController.deleteById
);

export default router;
