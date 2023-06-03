import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import gameQuestionService from "../../services/game-question.service";

class GameQuestionController {
  public async getQuestion(req, res, next) {
    try {
      handleValidationResult(req);

      const { game, index } = req.params;
      const { user } = req;

      const foundQuestion = await gameQuestionService.getCompletedQuestion(game, user.id, parseInt(index));

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new GameQuestionController();
