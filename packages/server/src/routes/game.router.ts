import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import GameGroupController from "../controllers/game/game-group.controller";
import GameQuestionController from "../controllers/game/game-question.controller";
import GameConfigController from "../controllers/game/game-config.controller";

const router = Router();

router.post(
  "/:game/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  GameGroupController.create
);

router.put(
  "/:game/group/join",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameGroupController.join
);

router.put(
  "/:game/group/leave",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameGroupController.leave
);

router.get(
  "/:game/question/:index",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameQuestionController.getQuestion
);

router.get(
  "/:game/config",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameConfigController.getConfig
);


export default router;
