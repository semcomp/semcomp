import achievementService from "../../services/achievement.service";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";

class AchievementController {
  public async list(req, res, next) {
    try {
      const achievements = await achievementService.find();

      return res.status(200).json(achievements);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const achievement = await achievementService.create(req.body);

      return res.status(200).json(achievement);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async update(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const achievement = await achievementService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          achievement[key] = req.body[key];
        }
      }

      const updatedAchievement = await achievementService.update(achievement);

      return res.status(200).json(updatedAchievement);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async delete(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const achievement = await achievementService.delete(id);

      return res.status(200).json(achievement);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new AchievementController();
