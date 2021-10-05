const { Router } = require("express");
const { body } = require("express-validator");

const AuthMiddleware = require("../middlewares/auth.middleware");
const RiddlethonGroupController = require("../controllers/riddlethon/riddlethon-group.controller");
const RiddlethonQuestionController = require("../controllers/riddlethon/riddlethon-question.controller");

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

module.exports = router;
