const riddlethonQuestionService = require("../../services/riddlethon-question.service");

const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

module.exports = {
  getQuestion: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const { user } = req;

      const foundQuestion =
        await riddlethonQuestionService.getCompletedQuestion(+id, {
          userId: user._id,
        });

      return res.status(200).json(foundQuestion);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
