import { Router } from "express";
import { param } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminGameGroupsController from "../../controllers/admin/game-group.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminGameGroupsController.list
);

router.get(
  "/winner",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminGameGroupsController.listWinner
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminGameGroupsController.deleteById
);

router.get(
  "/get-last-index",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminGameGroupsController.getLastQuestionByGroup
)

export default router;
