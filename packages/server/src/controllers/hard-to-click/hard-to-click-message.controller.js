const createError = require("http-errors");

const HardToClickGroupModel = require("../../models/riddlethon-group");
const MessageModel = require("../../models/message");

const { handleError } = require("../../lib/handle-error");

const hardToClickMessageController = {
  getMessages: async (req, res, next) => {
    try {
      const { page, items } = req.query;
      const { user } = req;

      const groupFound = await HardToClickGroupModel.findOne({
        members: user._id,
      });
      if (!groupFound) {
        throw new createError.BadRequest();
      }

      const messages = await MessageModel.find(
        { group: groupFound._id },
        { skip: page * items, limit: items }
      );

      return res.status(200).json(messages);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = hardToClickMessageController;
