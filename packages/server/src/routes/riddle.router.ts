import { Router } from "express";

import * as AuthMiddleware from "../middlewares/auth.middleware";
import RiddleGroupController from "../controllers/riddle/riddle-group.controller";
import RiddleQuestionController from "../controllers/riddle/riddle-question.controller";

const router = Router();

router.post(
  "/group",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  RiddleGroupController.create
);

// router.put(
//     '/group/join',
//     [
//       AuthMiddleware.authenticate,
//       AuthMiddleware.isAuthenticated,
//     ],
//     RiddleGroupController.join,
// );

// router.put(
//     '/group/leave',
//     [
//       AuthMiddleware.authenticate,
//       AuthMiddleware.isAuthenticated,
//     ],
//     RiddleGroupController.leave,
// );

router.get(
  "/question/:id",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  RiddleQuestionController.getQuestion
);

export default router;
