import riddleQuestionService from "../../services/riddle-question.service";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";

export default {
  getQuestion: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const { user } = req;

      const foundQuestion = await riddleQuestionService.getCompletedQuestion(
        +id,
        { userId: user._id }
      );

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
