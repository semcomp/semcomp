import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middlewares/auth.middleware";
import RiddlethonGroupController from "../controllers/riddlethon/riddlethon-group.controller";
import RiddlethonQuestionController from "../controllers/riddlethon/riddlethon-question.controller";

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    authMiddleware.authenticate,
    authMiddleware.isAuthenticated,
  ],
  RiddlethonGroupController.create
);

router.put(
  "/group/join",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  RiddlethonGroupController.join
);

router.put(
  "/group/leave",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  RiddlethonGroupController.leave
);

router.get(
  "/question/:index",
  [authMiddleware.authenticate, authMiddleware.isAuthenticated],
  RiddlethonQuestionController.getQuestion
);

export default router;
