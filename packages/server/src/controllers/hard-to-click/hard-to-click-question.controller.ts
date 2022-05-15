import createError from "http-errors";

import HardToClickGroupModel from "../../models/hard-to-click-group";
import HardToClickQuestionModel from "../../models/hard-to-click-question";

import { handleError } from "../../lib/handle-error";

const hardToClickQuestionController = {
  getQuestion: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { user } = req;

      const groupFound = await HardToClickGroupModel.findOne({
        members: user._id,
      });
      if (!groupFound) {
        throw new createError.BadRequest();
      }

      const completedQuestions = groupFound.completedQuestionsIndexes;

      const foundQuestion = await HardToClickQuestionModel.findOne({
        index: id,
      });
      if (!foundQuestion) {
        throw new createError.NotFound();
      }

      const isFirstQuestion = +id === 0;
      const actualQuestion = completedQuestions.length;
      const isQuestionCompleted = actualQuestion > +id;
      const isQuestionInProgress = actualQuestion === +id;
      if (!isQuestionCompleted && !isQuestionInProgress && !isFirstQuestion) {
        throw new createError.Forbidden();
      }

      return res.status(200).json({
        index: foundQuestion.index,
        title: foundQuestion.title,
        question: foundQuestion.question,
        imgUrl: foundQuestion.imgUrl,
        answer:
          isQuestionInProgress || (isFirstQuestion && !isQuestionCompleted)
            ? null
            : foundQuestion.answer,
      });
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default hardToClickQuestionController;
