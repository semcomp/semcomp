import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminSubscribeController from "../../controllers/admin/subscription.controller";

const router = Router();

router.get(
    "/event/:eventId",
    [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
    adminSubscribeController.findByEventId
  );

  router.get(
    "/event/users/:eventId",
    [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
    adminSubscribeController.getUsersByEvent
  );

export default router;