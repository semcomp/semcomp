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
  "/calc-total-time-by-event-type",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
    body("eventType", "Invalid field 'eventType'").not().isEmpty(),
  ],
  AdminEventController.calcTotalTimeByEventType
)

router.post(
  "/",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    body("description", "Invalid field 'description'").not().isEmpty(),
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

router.get(
  "/attendances-info",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.listUsersAttendancesInfo
);

router.get(
  "/:eventId/attendances-info/",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.listUsersAttendancesInfoByEventId
);

router.post(
  "/:eventId/mark-attendance/bulk",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
    body("emails", "Invalid field 'emails'").not().isEmpty(),
  ],
  AdminEventController.markUserAttendanceBulk
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

router.post(
  "/get-coffee-permission",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
    body("userId", "Invalid field 'userId'").not().isEmpty(),
    body("coffeeItemId", "Invalid field 'coffeeItemId'").not().isEmpty(),
  ],
  AdminEventController.getCoffeePermission
);

router.get(
  "/get-coffee-options",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminEventController.getCoffeeOptions
);

router.post(
  "/:eventId/qr-code",
  [
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  AdminEventController.createAttendanceQrCode
);

export default router;
