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
};

export default userController;
