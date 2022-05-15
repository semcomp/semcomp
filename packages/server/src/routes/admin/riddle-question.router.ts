import { Router } from "express";
import { param, body } from "express-validator";

import * as AdminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import AdminRiddleQuestionsController from "../../controllers/admin/riddle-question.controller";

const router = Router();

router.get(
  "/",
  [AdminAuthMiddleware.authenticate, AdminAuthMiddleware.isAuthenticated],
  AdminRiddleQuestionsController.list
);

router.post(
  "/",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("title", "Invalid field 'title'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    body("isLegendary", "Invalid field 'isLegendary'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddleQuestionsController.create
);

router.put(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("title", "Invalid field 'title'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    body("isLegendary", "Invalid field 'isLegendary'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddleQuestionsController.update
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    AdminAuthMiddleware.authenticate,
    AdminAuthMiddleware.isAuthenticated,
  ],
  AdminRiddleQuestionsController.delete
);

export default router;
