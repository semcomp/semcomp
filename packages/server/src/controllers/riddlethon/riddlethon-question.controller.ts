import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import riddlethonQuestionService from "../../services/riddlethon-question.service";

class RiddlethonQuestionController {
  public async getQuestion(req, res, next) {
    try {
      handleValidationResult(req);

      const { index } = req.params;
      const { user } = req;

      const foundQuestion = await riddlethonQuestionService.getCompletedQuestion(user.id, parseInt(index));

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new RiddlethonQuestionController();
