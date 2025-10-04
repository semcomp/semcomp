import { Router } from "express";
import { body, param } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import GameGroupController from "../controllers/game/game-group.controller";
import GameQuestionController from "../controllers/game/game-question.controller";
import GameConfigController from "../controllers/game/game-config.controller";
import Game from "../lib/constants/game-enum";

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

router.post(
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
  param("game").isIn(Object.values(Game)).withMessage("Jogo inválido"),
  GameQuestionController.getQuestion
);

router.get(
  "/:game/numberOfQuestions",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameQuestionController.getNumberOfQuestions
);

router.get(
  "/:game/config",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameConfigController.getConfig
);

router.get(
  "/isHappening",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameConfigController.getIsHappening
);

router.post(
  "/:game/group/use-clue",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  GameGroupController.useClue
);

router.get(
  "/:game/group/user/:userId",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  param("game").isIn(Object.values(Game)).withMessage("Jogo inválido"),
  param("userId").isString().withMessage("ID do usuário inválido"),
  GameGroupController.getGroupByUserIdAndGame
);

export default router;
