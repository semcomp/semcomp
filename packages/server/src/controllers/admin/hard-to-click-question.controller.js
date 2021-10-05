const HardToClickQuestionModel = require("../../models/hard-to-click-question");
const AdminLog = require("../../models/admin-log");

const { HttpError } = require("../../lib/http-error");

module.exports.list = async (req, res) => {
  const questionsFound = await HardToClickQuestionModel.find();

  return res.status(200).json(questionsFound);
};

module.exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404);
    }

    return res.status(200).json(questionFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.create = async (req, res) => {
  try {
    const { index, question, imgUrl, answer } = req.body;

    const questionFound = await HardToClickQuestionModel.findOne({ index });
    if (questionFound) {
      throw new HttpError(400);
    }

    const createdQuestion = new HardToClickQuestionModel({
      index,
      question,
      imgUrl,
      answer,
    });
    await createdQuestion.save();

    await AdminLog({
      user: req.adminUser,
      type: "create",
      collectionName: "hard-to-click-question",
      objectAfter: JSON.stringify(createdQuestion),
    }).save();

    return res.status(200).send(createdQuestion);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { index, question, imgUrl, answer } = req.body;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404);
    }

    const updatedQuestion = await HardToClickQuestionModel.findByIdAndUpdate(
      id,
      {
        index,
        question,
        imgUrl,
        answer,
      },
      { new: true }
    );

    await AdminLog({
      user: req.adminUser,
      type: "update",
      collectionName: "hard-to-click-question",
      objectBefore: JSON.stringify(questionFound),
      objectAfter: JSON.stringify(updatedQuestion),
    }).save();

    return res.status(200).send(updatedQuestion);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404);
    }

    await HardToClickQuestionModel.findByIdAndDelete(id);

    await AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "hard-to-click-question",
      objectBefore: JSON.stringify(questionFound),
    }).save();

    return res.status(200).send(questionFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
