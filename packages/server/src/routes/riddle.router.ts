import { Router } from "express";

import authMiddleware from "../middlewares/auth.middleware";
import RiddleGroupController from "../controllers/riddle/riddle-group.controller";
import RiddleQuestionController from "../controllers/riddle/riddle-question.controller";

const router = Router();

router.post(
  "/group",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  RiddleGroupController.create
);

// router.put(
//     '/group/join',
//     [
//       authMiddleware.authenticate,
//       authMiddleware.isAuthenticated,
//     ],
//     RiddleGroupController.join,
// );

// router.put(
//     '/group/leave',
//     [
//       authMiddleware.authenticate,
//       authMiddleware.isAuthenticated,
//     ],
//     RiddleGroupController.leave,
// );

router.get(
  "/question/:id",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  RiddleQuestionController.getQuestion
);

export default router;
