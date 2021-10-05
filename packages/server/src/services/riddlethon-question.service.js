const createError = require("http-errors");

const AdminLog = require("../models/admin-log");
const RiddlethonQuestionModel = require("../models/riddlethon-question");

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

    await AdminLog({
      user: adminUser,
      type: "create",
      collectionName: "riddlethon-question",
      objectAfter: JSON.stringify(newRiddlethonQuestion),
    }).save();

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

    await AdminLog({
      user: adminUser,
      type: "update",
      collectionName: "riddlethon-question",
      objectBefore: JSON.stringify(questionFound),
      objectAfter: JSON.stringify(updatedRiddlethonQuestion),
    }).save();

    return updatedRiddlethonQuestion;
  },
  adminDelete: async (id, adminUser) => {
    const questionFound = await riddlethonQuestionService.getOne(id);

    await RiddlethonQuestionModel.findByIdAndDelete(id);

    await AdminLog({
      user: adminUser,
      type: "delete",
      collectionName: "riddlethon-question",
      objectBefore: JSON.stringify(questionFound),
    }).save();

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

    const isClueUsedInQuestion = usedClueIndexes.includes(index);

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

module.exports = riddlethonQuestionService;
