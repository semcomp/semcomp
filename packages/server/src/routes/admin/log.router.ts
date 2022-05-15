import { Router } from "express";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminLogController from "../../controllers/admin/log.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminLogController.list
);

export default router;
