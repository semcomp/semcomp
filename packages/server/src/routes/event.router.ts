import { Router } from "express";
import { param } from "express-validator";

import EventController from "../controllers/event.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = Router();

router.get("/", [authMiddleware.authenticate], EventController.getInfo);

router.get(
  "/subscribables",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  EventController.getSubscribables
);

router.get(
  "/current",
  [authMiddleware.authenticate],
  EventController.getCurrent
);

router.get(
  "/:id",
  [param("id", "Invalid field 'id'").not().isEmpty()],
  EventController.getOne
);

// router.post(
//   "/mark-presence/:eventId",
//   [
//     authMiddleware.authenticate,
//     authMiddleware.authenticateUserHouse,
//     authMiddleware.isAuthenticated,
//     param("eventId", "Invalid field 'eventId'").not().isEmpty(),
//   ],
//   EventController.markPresence
// );

router.post(
  "/:eventId/subscribe",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  EventController.subscribe
);

router.delete(
  "/:eventId/subscribe",
  [
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
    param("eventId", "Invalid field 'eventId'").not().isEmpty(),
  ],
  EventController.unsubscribe
);

export default router;
