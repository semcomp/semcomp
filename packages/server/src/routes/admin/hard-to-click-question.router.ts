import { Router } from "express";
import { body } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminHardToClickQuestionsController from "../../controllers/admin/hard-to-click-question.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.list
);

router.get(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.get
);

router.post(
  "/",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminHardToClickQuestionsController.create
);

router.put(
  "/:id",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminHardToClickQuestionsController.update
);

router.delete(
  "/:id",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.deleteById
);

export default router;
