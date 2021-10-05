const { Router } = require("express");
const { body } = require("express-validator");

const AuthMiddleware = require("../middlewares/auth.middleware");
const HardToClickGroupController = require("../controllers/hard-to-click/hard-to-click-group.controller");
const HardToClickQuestionController = require("../controllers/hard-to-click/hard-to-click-question.controller");
const HardToClickMessageController = require("../controllers/hard-to-click/hard-to-click-message.controller");

const router = Router();

router.post(
  "/group",
  [
    body("name", "Invalid field 'name'").not().isEmpty(),
    AuthMiddleware.authenticate,
    AuthMiddleware.isAuthenticated,
  ],
  HardToClickGroupController.createGroup
);

router.put(
  "/group/join",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickGroupController.joinGroup
);

router.put(
  "/group/leave",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickGroupController.leaveGroup
);

router.get(
  "/question/:id",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickQuestionController.getQuestion
);

router.get(
  "/message",
  [AuthMiddleware.authenticate, AuthMiddleware.isAuthenticated],
  HardToClickMessageController.getMessages
);

module.exports = router;
