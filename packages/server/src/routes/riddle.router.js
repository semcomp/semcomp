const { Router } = require("express");

const AuthMiddleware = require("../middlewares/auth.middleware");
const RiddleGroupController = require("../controllers/riddle/riddle-group.controller");
const RiddleQuestionController = require("../controllers/riddle/riddle-question.controller");

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

module.exports = router;
