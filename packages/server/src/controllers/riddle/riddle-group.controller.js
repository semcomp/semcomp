const riddleGroupService = require("../../services/riddle-group.service");

const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

module.exports = {
  create: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { user } = req;

      const createdGroup = await riddleGroupService.create({
        userId: user._id,
      });

      return res.status(200).json(createdGroup);
    } catch (error) {
      return handleError(error, next);
    }
  },
  join: async (req, res, next) => {
    try {
      const { id } = req.query;
      const { user } = req;

      const joinedGroup = await riddleGroupService.join(id, {
        userId: user._id,
      });

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  },
  leave: async (req, res, next) => {
    try {
      const { user } = req;

      await riddleGroupService.leave({ userId: user._id });

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  },
};
