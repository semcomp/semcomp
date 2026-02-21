import { Router } from "express";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminLogController from "../../controllers/admin/log.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminLogController.list
);

export default router;
