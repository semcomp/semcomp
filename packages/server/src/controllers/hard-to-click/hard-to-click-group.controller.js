const createError = require("http-errors");

const HardToClickGroupModel = require("../../models/hard-to-click-group");

const {
  handleValidationResult,
} = require("../../lib/handle-validation-result");
const { handleError } = require("../../lib/handle-error");

const MAX_MEMBERS_IN_GROUP = 3;

const hardToClickGroupController = {
  createGroup: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { name } = req.body;
      const { user } = req;

      const groupFound = await HardToClickGroupModel.findOne({ name });
      if (groupFound) {
        throw new createError.BadRequest();
      }

      const createdGroup = new HardToClickGroupModel({
        name,
        members: [user._id],
        completedQuestionsIndexes: [],
      });
      await createdGroup.save();

      return res.status(200).json(createdGroup);
    } catch (error) {
      return handleError(error, next);
    }
  },
  joinGroup: async (req, res, next) => {
    try {
      const { id } = req.query;
      const { user } = req;

      const groupFound = await HardToClickGroupModel.findById(id);
      if (
        !groupFound ||
        !groupFound.members ||
        groupFound.members.includes(user._id) ||
        groupFound.members.length >= MAX_MEMBERS_IN_GROUP
      ) {
        throw new createError.BadRequest();
      }

      const joinedGroup = await HardToClickGroupModel.findByIdAndUpdate(id, {
        $push: { members: user._id },
      });

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  },
  leaveGroup: async (req, res, next) => {
    try {
      const { user } = req;

      const groupFound = await HardToClickGroupModel.updateOne(
        { members: user._id },
        {
          $pullAll: { members: [user._id] },
        }
      );
      if (!groupFound) {
        throw new createError.BadRequest();
      }

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = hardToClickGroupController;
