import { Router } from "express";
import { body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import * as AdminHardToClickQuestionsController from "../../controllers/admin/hard-to-click-question.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.list
);

router.get(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.get
);

router.post(
  "/",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminHardToClickQuestionsController.create
);

router.put(
  "/:id",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  AdminHardToClickQuestionsController.update
);

router.delete(
  "/:id",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  AdminHardToClickQuestionsController.deleteById
);

export default router;
