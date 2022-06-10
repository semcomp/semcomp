import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminEventController from "../../controllers/admin/event.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminEventController.list
);

router.post(
  "/",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("description", "Invalid field 'description'").not().isEmpty(),
    body("link", "Invalid field 'link'").not().isEmpty(),
    body("startDate", "Invalid field 'dateStart'").not().isEmpty(),
    body("endDate", "Invalid field 'dateEnd'").not().isEmpty(),
    body("type", "Invalid field 'dateEnd'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.update
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.delete
);

router.post(
  "/:eventId/mark-attendance",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
    body("userId", "Invalid field 'userId'").not().isEmpty(),
  ],
  AdminEventController.markUserAttendance
);

export default router;
