import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminHardToClickQuestionsController from "../../controllers/admin/hard-to-click-question.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminHardToClickQuestionsController.list
);

router.post(
  "/",
  [
    body("index", "Invalid field 'index'").not().isEmpty(),
    body("title", "Invalid field 'title'").not().isEmpty(),
    body("question", "Invalid field 'question'").not().isEmpty(),
    body("answer", "Invalid field 'answer'").not().isEmpty(),
    body("isLegendary", "Invalid field 'isLegendary'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminHardToClickQuestionsController.create
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
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminHardToClickQuestionsController.updateById
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminHardToClickQuestionsController.deleteById
);

export default router;
