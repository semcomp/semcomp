import { Router } from "express";
import { body } from "express-validator";

import * as AuthMiddleware from "../middlewares/auth.middleware";
import RiddlethonGroupController from "../controllers/riddlethon/riddlethon-group.controller";
import RiddlethonQuestionController from "../controllers/riddlethon/riddlethon-question.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  RiddlethonGroupController.create
);

router.put(
  "/group/join",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  RiddlethonGroupController.join
);

router.put(
  "/group/leave",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  RiddlethonGroupController.leave
);

router.get(
  "/question/:id",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  RiddlethonQuestionController.getQuestion
);

export default router;
