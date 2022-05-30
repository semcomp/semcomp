import createError from "http-errors";

import AdminLog from "../models/admin-log";
import RiddlethonQuestionModel from "../models/riddlethon-question";
import RiddlethonGroupModel from "../models/riddlethon-group";
import adminLogService from "./admin-log.service";

const riddlethonQuestionService = {
  get: async () => {
    const riddlethonQuestions = await RiddlethonQuestionModel.find();

    return riddlethonQuestions;
  },
  getOne: async (id) => {
    const riddlethonQuestion = await RiddlethonQuestionModel.findById(id);

    if (!riddlethonQuestion) {
      throw new createError.NotFound(
        `Não foi encontrada pergunta com o id ${id}`
      );
    }

    return riddlethonQuestion;
  },
  adminCreate: async (
    { index, title, question, imgUrl, clue, answer, isLegendary },
    adminUser
  ) => {
    const questionFound = await RiddlethonQuestionModel.findOne({ index });
    if (questionFound) {
      throw new createError.BadRequest();
    }

    const newRiddlethonQuestion = new RiddlethonQuestionModel({
      index,
      title,
      question,
      imgUrl,
      clue,
      answer,
      isLegendary,
    });
    await newRiddlethonQuestion.save();

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "create",
      collectionName: "riddlethon-question",
      objectAfter: JSON.stringify(newRiddlethonQuestion),
    };
    await adminLogService.create(adminLog);

    return newRiddlethonQuestion;
  },
  adminUpdate: async (
    id,
    { index, title, question, imgUrl, clue, answer, isLegendary },
    adminUser
  ) => {
    const questionFound = await riddlethonQuestionService.getOne(id);

    const updatedRiddlethonQuestion =
      await RiddlethonQuestionModel.findByIdAndUpdate(
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
        { new: true }
      );

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "update",
      collectionName: "riddlethon-question",
      objectBefore: JSON.stringify(questionFound),
      objectAfter: JSON.stringify(updatedRiddlethonQuestion),
    };
    await adminLogService.create(adminLog);

    return updatedRiddlethonQuestion;
  },
  adminDelete: async (id, adminUser) => {
    const questionFound = await riddlethonQuestionService.getOne(id);

    await RiddlethonQuestionModel.findByIdAndDelete(id);

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "delete",
      collectionName: "riddlethon-question",
      objectBefore: JSON.stringify(questionFound),
    };
    await adminLogService.create(adminLog);

    return questionFound;
  },
  getCompletedQuestion: async (index, { userId }) => {
    const group = await RiddlethonGroupModel.findOne({ members: userId });
    if (!group) {
      throw new createError.BadRequest();
    }

    const completedQuestionsIndexes = group.completedQuestionsIndexes;

    const question = await RiddlethonQuestionModel.findOne({ index });
    if (!question) {
      throw new createError.NotFound();
    }

    const isFirstQuestion = index === 0;
    const currentQuestionIndex = completedQuestionsIndexes.reduce((a, b) =>
      a.index > b.index ? a : b
    ).index;
    const isQuestionCompleted = currentQuestionIndex >= index;
    const isQuestionInProgress = currentQuestionIndex === index;
    if (!isQuestionCompleted && !isQuestionInProgress && !isFirstQuestion) {
      throw new createError.Forbidden();
    }

    const isClueUsedInQuestion = group.usedClueIndexes.includes(index);

    return {
      index: question.index,
      title: question.title,
      question: question.question,
      imgUrl: !question.isLegendary ? question.imgUrl : null,
      isLegendary: question.isLegendary,
      answer: isQuestionCompleted ? question.answer : null,
      clue: isClueUsedInQuestion ? question.clue : null,
    };
  },
};

export default riddlethonQuestionService;
