import { Router } from "express";
import { param, body } from "express-validator";

import adminAuthMiddleware from "../../middlewares/admin-auth.middleware";
import adminGameQuestionsController from "../../controllers/admin/game-question.controller";

const router = Router();

router.get(
  "/",
  [adminAuthMiddleware.authenticate, adminAuthMiddleware.isAuthenticated],
  adminGameQuestionsController.list
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
  adminGameQuestionsController.create
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
  adminGameQuestionsController.updateById
);

router.delete(
  "/:id",
  [
    param("id", "Invalid field 'id'").not().isEmpty(),
    adminAuthMiddleware.authenticate,
    adminAuthMiddleware.isAuthenticated,
  ],
  adminGameQuestionsController.deleteById
);

export default router;
