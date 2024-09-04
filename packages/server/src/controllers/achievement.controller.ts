import achievementService from "../services/achievement.service";

import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

const userController = {
  getUserAchievements: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const achievements = await achievementService.getUserAchievements(
        req.user.id,
      );

      return res.status(200).json(achievements);
    } catch (error) {
      return handleError(error, next);
    }
  },

  addQrCodeAchievement: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { achievementId } = req.params;
      const userId = req.user.id;

      const user = await achievementService.addQrCodeAchievement(userId, achievementId);

      return res.status(200).json(user);
    } catch (error) {
      return handleError(error, next);
    }
  }
};

export default userController;
