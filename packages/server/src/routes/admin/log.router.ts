import { Router } from "express";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminLogController from "../../controllers/admin/log.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminLogController.list
);

export default router;
