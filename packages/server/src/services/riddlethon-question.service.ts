import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import RiddlethonQuestion, { RiddlethonQuestionModel } from "../models/riddlethon-question";
import IdServiceImpl from "./id-impl.service";
import riddlethonGroupCompletedQuestionService from "./riddlethon-group-completed-question.service";
import riddlethonGroupUsedClueService from "./riddlethon-group-used-clue.service";
import riddlethonGroupService from "./riddlethon-group.service";

const idService = new IdServiceImpl();

type Filters = RiddlethonQuestion | {
  id: string[];
  index: number[];
  title: string[];
  question: string[];
  imgUrl: string[];
  clue: string[];
  answer: string[];
  isLegendary: boolean[];
  createdAt: number[];
  updatedAt: number[];
};

class RiddlethonQuestionService {
  public async find(filters?: Partial<Filters>): Promise<RiddlethonQuestion[]> {
    const riddlethonQuestions = await RiddlethonQuestionModel.find(filters);

    const entities: RiddlethonQuestion[] = [];
    for (const riddlethonQuestion of riddlethonQuestions) {
      entities.push(this.mapEntity(riddlethonQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonQuestion> {
    const entity = await RiddlethonQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Filters>): Promise<RiddlethonQuestion> {
    const entity = await RiddlethonQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await RiddlethonQuestionModel.count(filters);

    return count;
  }

  public async create(riddlethonQuestion: RiddlethonQuestion): Promise<RiddlethonQuestion> {
    riddlethonQuestion.id = await idService.create();
    const entity = await RiddlethonQuestionModel.create(riddlethonQuestion);

    return this.findById(entity.id);
  }

  public async update(riddlethonQuestion: RiddlethonQuestion): Promise<RiddlethonQuestion> {
    const entity = await RiddlethonQuestionModel.findOneAndUpdate({ id: riddlethonQuestion.id }, riddlethonQuestion);

    return this.findById(entity.id);
  }

  public async delete(riddlethonQuestion: RiddlethonQuestion): Promise<RiddlethonQuestion> {
    const entity = await RiddlethonQuestionModel.findOneAndDelete({ id: riddlethonQuestion.id });

    return entity && this.mapEntity(entity);
  }

  public async getCompletedQuestion(userId: string, questionIndex: number) {
    const group = await riddlethonGroupService.findUserGroup(userId);
    if (!group) {
      throw new HttpError(400, []);
    }

    const riddlethonGroupCompletedQuestions = await riddlethonGroupCompletedQuestionService.find({
      riddlethonGroupId: group.id,
    });
    const completedQuestions = await this.find({
      id: riddlethonGroupCompletedQuestions.map((question) => question.riddlethonQuestionId),
    });

    const question = await this.findOne({ index: questionIndex });
    if (!question) {
      throw new HttpError(404, []);
    }

    const isFirstQuestion = questionIndex === 0;
    const currentQuestionIndex = completedQuestions.reduce((a, b) =>
      a.index > b.index ? a : b
    ).index;
    const isQuestionCompleted = currentQuestionIndex >= questionIndex;
    const isQuestionInProgress = currentQuestionIndex === questionIndex;
    if (!isQuestionCompleted && !isQuestionInProgress && !isFirstQuestion) {
      throw new HttpError(403, []);
    }

    const isClueUsedInQuestion = await riddlethonGroupUsedClueService.findOne({
      riddlethonQuestionId: question.id,
    });

    return {
      index: question.index,
      title: question.title,
      question: question.question,
      imgUrl: !question.isLegendary ? question.imgUrl : null,
      isLegendary: question.isLegendary,
      answer: isQuestionCompleted ? question.answer : null,
      clue: isClueUsedInQuestion ? question.clue : null,
    };
  }

  private mapEntity(entity: Model<RiddlethonQuestion> & RiddlethonQuestion): RiddlethonQuestion {
    return {
      id: entity.id,
      index: entity.index,
      title: entity.title,
      question: entity.question,
      imgUrl: entity.imgUrl,
      clue: entity.clue,
      answer: entity.answer,
      isLegendary: entity.isLegendary,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonQuestionService();
