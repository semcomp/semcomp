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

      const foundQuestion = await gameQuestionService.getGroupCompletedQuestion(game, user.id, parseInt(index));

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async getNumberOfQuestions(req, res, next) {
    try {
      handleValidationResult(req);

      const { game} = req.params;

      const questionCount = await gameQuestionService.count({ game });
      const randomKey = Math.floor(Math.random() * 10000) + 1000; // Chave numérica entre 1000-10999
      
      const encryptedValue = (questionCount * 7 + randomKey) * 3 + 42;
      const encoded = Buffer.from(String(encryptedValue)).toString('base64');

      return res.status(200).json({
        encrypted: encoded,
        key: randomKey
      });
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new GameQuestionController();
