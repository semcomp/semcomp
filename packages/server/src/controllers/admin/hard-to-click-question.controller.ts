import HardToClickQuestionModel from "../../models/hard-to-click-question";

import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import AdminLog from "../../models/admin-log";

export const list = async (req, res) => {
  const questionsFound = await HardToClickQuestionModel.find();

  return res.status(200).json(questionsFound);
};

export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404, ["Pergunta não encontrada."]);
    }

    return res.status(200).json(questionFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const create = async (req, res) => {
  try {
    const { index, question, imgUrl, answer } = req.body;

    const questionFound = await HardToClickQuestionModel.findOne({ index });
    if (questionFound) {
      throw new HttpError(400, ["Pergunta já existente."]);
    }

    const createdQuestion = new HardToClickQuestionModel({
      index,
      question,
      imgUrl,
      answer,
    });
    await createdQuestion.save();

    const adminLog: AdminLog = {
      adminId: req.adminUser.id,
      type: "create",
      collectionName: "hard-to-click-question",
      objectAfter: JSON.stringify(createdQuestion),
    };
    await adminLogService.create(adminLog);

    return res.status(200).send(createdQuestion);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { index, question, imgUrl, answer } = req.body;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404, ["Pergunta não encontrada"]);
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

    const adminLog: AdminLog = {
      adminId: req.adminUser.id,
      type: "update",
      collectionName: "hard-to-click-question",
      objectBefore: JSON.stringify(questionFound),
      objectAfter: JSON.stringify(updatedQuestion),
    };
    await adminLogService.create(adminLog);

    return res.status(200).send(updatedQuestion);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const questionFound = await HardToClickQuestionModel.findById(id);
    if (!questionFound) {
      throw new HttpError(404, ["Pergunta não encontrada."]);
    }

    await HardToClickQuestionModel.findByIdAndDelete(id);

    const adminLog: AdminLog = {
      adminId: req.adminUser.id,
      type: "delete",
      collectionName: "hard-to-click-question",
      objectBefore: JSON.stringify(questionFound),
    };
    await adminLogService.create(adminLog);

    return res.status(200).send(questionFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
