import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import HardToClickGroupController from "../controllers/hard-to-click/hard-to-click-group.controller";
import HardToClickQuestionController from "../controllers/hard-to-click/hard-to-click-question.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  HardToClickGroupController.create
);

router.put(
  "/group/join",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickGroupController.join
);

router.put(
  "/group/leave",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickGroupController.leave
);

router.get(
  "/question/:id",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  HardToClickQuestionController.getQuestion
);

export default router;
