import { Router } from "express";
import { param } from "express-validator";

import EventController from "../controllers/event.controller";
import * as AuthMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", [AuthMiddleware.authenticate], EventController.getInfo);

router.get(
  "/subscribables",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  EventController.getSubscribables
);

router.get(
  "/current",
  [AuthMiddleware.authenticate],
  EventController.getCurrent
);

router.get(
  "/:id",
  [param("id", "Invalid field 'id'").not().isEmpty()],
  EventController.getOne
);

router.post(
  "/mark-presence/:eventId",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.authenticateUserHouse,
    AuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  EventController.markPresence
);

router.post(
  "/:eventId/subscribe",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  EventController.subscribe
);

router.delete(
  "/:eventId/subscribe",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  EventController.unsubscribe
);

export default router;
