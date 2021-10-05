const { Router } = require("express");

const AuthMiddleware = require("../middlewares/auth.middleware");
const AchievementController = require("../controllers/achievement.controller");

const router = Router();

router.get(
  "/",
  [
    AuthMiddleware.authenticate,
    AuthMiddleware.authenticateUserHouse,
    AuthMiddleware.isAuthenticated,
  ],
  AchievementController.getUserAchievements
);

module.exports = router;
