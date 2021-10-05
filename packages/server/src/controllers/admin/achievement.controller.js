const achievementService = require("../../services/achievement.service");

const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

const achievementController = {
  list: async (req, res, next) => {
    try {
      const achievements = await achievementService.get();

      return res.status(200).json(achievements);
    } catch (error) {
      return handleError(error, next);
    }
  },
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const {
        title,
        description,
        startDate,
        endDate,
        type,
        category,
        eventId,
        eventType,
        minPercentage,
        numberOfAchievements,
        numberOfPresences,
      } = req.body;

      const achievement = await achievementService.create({
        title,
        description,
        startDate,
        endDate,
        type,
        category,
        eventId,
        eventType,
        minPercentage,
        numberOfAchievements,
        numberOfPresences,
      });

      return res.status(200).json(achievement);
    } catch (error) {
      return handleError(error, next);
    }
  },
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const {
        title,
        description,
        startDate,
        endDate,
        type,
        category,
        eventId,
        eventType,
        minPercentage,
        numberOfAchievements,
        numberOfPresences,
      } = req.body;

      const achievement = await achievementService.update(id, {
        title,
        description,
        startDate,
        endDate,
        type,
        category,
        eventId,
        eventType,
        minPercentage,
        numberOfAchievements,
        numberOfPresences,
      });

      return res.status(200).json(achievement);
    } catch (error) {
      return handleError(error, next);
    }
  },
  delete: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const achievement = await achievementService.delete(id);

      return res.status(200).json(achievement);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = achievementController;
