import riddleQuestionService from "../../services/riddle-question.service";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";

export default {
  list: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const questionsFound = await riddleQuestionService.get();

      return res.status(200).json(questionsFound);
    } catch (error) {
      return handleError(error, next);
    }
  },
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { index, title, question, imgUrl, clue, answer, isLegendary } =
        req.body;

      const createdQuestion = await riddleQuestionService.adminCreate(
        {
          index,
          title,
          question,
          imgUrl,
          clue,
          answer,
          isLegendary,
        },
        req.adminUser
      );

      return res.status(200).send(createdQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  },
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const { index, title, question, imgUrl, clue, answer, isLegendary } =
        req.body;

      const updatedQuestion = await riddleQuestionService.adminUpdate(
        id,
        {
          index,
          title,
          question,
          imgUrl,
          clue,
          answer,
          isLegendary,
        },
        req.adminUser
      );

      return res.status(200).send(updatedQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  },
  delete: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const questionDeleted = await riddleQuestionService.adminDelete(
        id,
        req.adminUser
      );

      return res.status(200).send(questionDeleted);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
