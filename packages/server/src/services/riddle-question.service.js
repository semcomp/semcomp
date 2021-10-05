const createError = require("http-errors");

const AdminLog = require("../models/admin-log");
const RiddleQuestionModel = require("../models/riddle-question");
const RiddleGroupModel = require("../models/riddle-group");

const { getRiddleGroupQuestion } = require("../lib/get-riddle-group-question");

const riddleQuestionService = {
  get: async () => {
    const riddleQuestions = await RiddleQuestionModel.find();

    return riddleQuestions;
  },
  getOne: async (id) => {
    const riddleQuestion = await RiddleQuestionModel.findById(id);

    if (!riddleQuestion) {
      throw new createError.NotFound(
        `Não foi encontrada pergunta com o id ${id}`
      );
    }

    return riddleQuestion;
  },
  adminCreate: async (
    { index, title, question, imgUrl, clue, answer, isLegendary },
    adminUser
  ) => {
    const questionFound = await RiddleQuestionModel.findOne({ index });
    if (questionFound) {
      throw new createError.BadRequest();
    }

    const newRiddleQuestion = new RiddleQuestionModel({
      index,
      title,
      question,
      imgUrl,
      clue,
      answer,
      isLegendary,
    });
    await newRiddleQuestion.save();

    await AdminLog({
      user: adminUser,
      type: "create",
      collectionName: "riddle-question",
      objectAfter: JSON.stringify(newRiddleQuestion),
    }).save();

    return newRiddleQuestion;
  },
  adminUpdate: async (
    id,
    { index, title, question, imgUrl, clue, answer, isLegendary },
    adminUser
  ) => {
    const questionFound = await riddleQuestionService.getOne(id);

    const updatedRiddleQuestion = await RiddleQuestionModel.findByIdAndUpdate(
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

    await AdminLog({
      user: adminUser,
      type: "update",
      collectionName: "riddle-question",
      objectBefore: JSON.stringify(questionFound),
      objectAfter: JSON.stringify(updatedRiddleQuestion),
    }).save();

    return updatedRiddleQuestion;
  },
  adminDelete: async (id, adminUser) => {
    const questionFound = await riddleQuestionService.getOne(id);

    await RiddleQuestionModel.findByIdAndDelete(id);

    await AdminLog({
      user: adminUser,
      type: "delete",
      collectionName: "riddle-question",
      objectBefore: JSON.stringify(questionFound),
    }).save();

    return questionFound;
  },
  getCompletedQuestion: async (index, { userId }) => {
    const group = await RiddleGroupModel.findOne({ members: userId });
    if (!group) {
      throw new createError.BadRequest();
    }

    const question = await RiddleQuestionModel.findOne({ index });
    if (!question) {
      throw new createError.NotFound();
    }

    const groupQuestionInfo = getRiddleGroupQuestion(group, index);

    if (!groupQuestionInfo.isQuestionInProgress) {
      throw new createError.Forbidden();
    }

    return {
      index: question.index,
      title: question.title,
      question: question.question,
      imgUrl: question.imgUrl,
      isLegendary: question.isLegendary,
      answer: groupQuestionInfo.isQuestionCompleted ? question.answer : null,
      clue: groupQuestionInfo.isClueUsedInQuestion ? question.clue : null,
    };
  },
};

module.exports = riddleQuestionService;
