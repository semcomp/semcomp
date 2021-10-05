const achievementService = require("../services/achievement.service");

const { handleValidationResult } = require("../lib/handle-validation-result");
const { handleError } = require("../lib/handle-error");

const userController = {
  getUserAchievements: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const achievements = await achievementService.getUserAchievements(
        req.user,
        req.userHouse
      );

      return res.status(200).json(achievements);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = userController;
