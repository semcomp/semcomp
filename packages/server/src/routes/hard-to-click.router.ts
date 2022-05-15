import { Router } from "express";
import { body } from "express-validator";

import * as AuthMiddleware from "../middlewares/auth.middleware";
import HardToClickGroupController from "../controllers/hard-to-click/hard-to-click-group.controller";
import HardToClickQuestionController from "../controllers/hard-to-click/hard-to-click-question.controller";
import HardToClickMessageController from "../controllers/hard-to-click/hard-to-click-message.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  HardToClickGroupController.createGroup
);

router.put(
  "/group/join",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickGroupController.joinGroup
);

router.put(
  "/group/leave",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickGroupController.leaveGroup
);

router.get(
  "/question/:id",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickQuestionController.getQuestion
);

router.get(
  "/message",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickMessageController.getMessages
);

export default router;
