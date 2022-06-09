import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import hardToClickQuestionService from "../../services/hard-to-click-question.service";

class HardToClickQuestionController {
  public async getQuestion(req, res, next) {
    try {
      handleValidationResult(req);

      const { index } = req.params;
      const { user } = req;

      const foundQuestion = await hardToClickQuestionService.getCompletedQuestion(user.id, index);

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new HardToClickQuestionController();
