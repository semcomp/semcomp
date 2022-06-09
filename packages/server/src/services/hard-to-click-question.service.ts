import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import HardToClickQuestion, { HardToClickQuestionModel } from "../models/hard-to-click-question";
import IdServiceImpl from "./id-impl.service";
import hardToClickGroupCompletedQuestionService from "./hard-to-click-group-completed-question.service";
import hardToClickGroupUsedClueService from "./hard-to-click-group-used-clue.service";
import hardToClickGroupService from "./hard-to-click-group.service";

const idService = new IdServiceImpl();

type Filters = HardToClickQuestion | {
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

class HardToClickQuestionService {
  public async find(filters?: Partial<Filters>): Promise<HardToClickQuestion[]> {
    const hardToClickQuestions = await HardToClickQuestionModel.find(filters);

    const entities: HardToClickQuestion[] = [];
    for (const hardToClickQuestion of hardToClickQuestions) {
      entities.push(this.mapEntity(hardToClickQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickQuestion> {
    const entity = await HardToClickQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Filters>): Promise<HardToClickQuestion> {
    const entity = await HardToClickQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await HardToClickQuestionModel.count(filters);

    return count;
  }

  public async create(hardToClickQuestion: HardToClickQuestion): Promise<HardToClickQuestion> {
    hardToClickQuestion.id = await idService.create();
    const entity = await HardToClickQuestionModel.create(hardToClickQuestion);

    return this.findById(entity.id);
  }

  public async update(hardToClickQuestion: HardToClickQuestion): Promise<HardToClickQuestion> {
    const entity = await HardToClickQuestionModel.findOneAndUpdate({ id: hardToClickQuestion.id }, hardToClickQuestion);

    return this.findById(entity.id);
  }

  public async delete(hardToClickQuestion: HardToClickQuestion): Promise<HardToClickQuestion> {
    const entity = await HardToClickQuestionModel.findOneAndDelete({ id: hardToClickQuestion.id });

    return entity && this.mapEntity(entity);
  }

  public async getCompletedQuestion(userId: string, questionIndex: number) {
    const group = await hardToClickGroupService.findUserGroup(userId);
    if (!group) {
      throw new HttpError(400, []);
    }

    const hardToClickGroupCompletedQuestions = await hardToClickGroupCompletedQuestionService.find({
      hardToClickGroupId: group.id,
    });
    const completedQuestions = await this.find({
      id: hardToClickGroupCompletedQuestions.map((question) => question.hardToClickQuestionId),
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

    const isClueUsedInQuestion = await hardToClickGroupUsedClueService.findOne({
      hardToClickQuestionId: question.id,
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

  private mapEntity(entity: Model<HardToClickQuestion> & HardToClickQuestion): HardToClickQuestion {
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

export default new HardToClickQuestionService();