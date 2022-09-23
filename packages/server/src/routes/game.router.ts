import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import GameGroupController from "../controllers/game/game-group.controller";
import GameQuestionController from "../controllers/game/game-question.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  GameGroupController.create
);

router.put(
  "/group/join",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameGroupController.join
);

router.put(
  "/group/leave",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameGroupController.leave
);

router.get(
  "/question/:index",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameQuestionController.getQuestion
);

export default router;
