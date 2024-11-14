import { Router } from "express";
import { body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import attendanceController from "../../controllers/attendance.controller";

const router = Router();

router.post(
  "/list-attendance-info-with-event-type-rate",
  [
    body("eventType", "Invalid field 'eventType'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  
  attendanceController.listAttendanceInfoWithEventTypeRate
);

export default router;
