import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import HardToClickGroupController from "../controllers/hard-to-click/hard-to-click-group.controller";
import HardToClickQuestionController from "../controllers/hard-to-click/hard-to-click-question.controller";
import HardToClickMessageController from "../controllers/hard-to-click/hard-to-click-message.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  HardToClickGroupController.createGroup
);

router.put(
  "/group/join",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickGroupController.joinGroup
);

router.put(
  "/group/leave",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickGroupController.leaveGroup
);

router.get(
  "/question/:id",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickQuestionController.getQuestion
);

router.get(
  "/message",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickMessageController.getMessages
);

export default router;
