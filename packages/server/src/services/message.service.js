const createError = require("http-errors");
const ObjectId = require("mongodb").ObjectID;

const MessageModel = require("../models/message");

const messageService = {
  get: async () => {
    const messages = await MessageModel.find();

    return messages;
  },
  getOne: async (id) => {
    const message = await MessageModel.findById(id);

    if (!message) {
      throw new createError.NotFound(
        `Não foi encontrada messagem com o id ${id}`
      );
    }

    return message;
  },
  create: async (text, user, group) => {
    const newMessage = new MessageModel();

    newMessage._id = new ObjectId();
    newMessage.text = text;
    newMessage.user = user;
    newMessage.group = group;

    await newMessage.save();

    return newMessage;
  },
  update: async (id, text, user, group) => {
    const updatedMessage = await MessageModel.findByIdAndUpdate(
      id,
      {
        text,
        user,
        group,
      },
      { new: true }
    );

    return updatedMessage;
  },
  delete: async (id) => {
    const deletedMessage = await MessageModel.findByIdAndDelete(id);

    return deletedMessage;
  },
};

module.exports = messageService;
