import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import GameQuestion, { GameQuestionModel } from "../models/game-question";
import IdServiceImpl from "./id-impl.service";
import gameGroupCompletedQuestionService from "./game-group-completed-question.service";
import gameGroupUsedClueService from "./game-group-used-clue.service";
import gameGroupService from "./game-group.service";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

const idService = new IdServiceImpl();

type Filters = GameQuestion | {
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

class GameQuestionService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<Filters>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<GameQuestion>> {
    const users = await GameQuestionModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: GameQuestion[] = [];
    for (const user of users) {
      entities.push(this.mapEntity(user));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<GameQuestion> {
    const entity = await GameQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Filters>): Promise<GameQuestion> {
    const entity = await GameQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await GameQuestionModel.count(filters);

    return count;
  }

  public async create(gameQuestion: GameQuestion): Promise<GameQuestion> {
    gameQuestion.id = await idService.create();
    gameQuestion.createdAt = Date.now();
    gameQuestion.updatedAt = Date.now();
    const entity = await GameQuestionModel.create(gameQuestion);

    return this.findById(entity.id);
  }

  public async update(gameQuestion: GameQuestion): Promise<GameQuestion> {
    gameQuestion.updatedAt = Date.now();
    const entity = await GameQuestionModel.findOneAndUpdate({ id: gameQuestion.id }, gameQuestion);

    return this.findById(entity.id);
  }

  public async delete(gameQuestion: GameQuestion): Promise<GameQuestion> {
    const entity = await GameQuestionModel.findOneAndDelete({ id: gameQuestion.id });

    return entity && this.mapEntity(entity);
  }

  public async getCompletedQuestion(userId: string, questionIndex: number) {
    const group = await gameGroupService.findUserGroup(userId);
    if (!group) {
      throw new HttpError(400, []);
    }

    const gameGroupCompletedQuestions = await gameGroupCompletedQuestionService.find({
      gameGroupId: group.id,
    });
    const completedQuestions = await this.find({
      pagination: new PaginationRequest(1, 9999),
      filters: {
        id: gameGroupCompletedQuestions.map((question) => question.gameQuestionId),
      }
    });

    const question = await this.findOne({ index: questionIndex });
    if (!question) {
      throw new HttpError(404, []);
    }

    const isFirstQuestion = questionIndex === 0;
    const currentQuestionIndex = completedQuestions.getEntities().length > 0 ? (completedQuestions.getEntities().reduce((a, b) =>
      a.index > b.index ? a : b
    ).index + 1) : 0;
    const isQuestionCompleted = currentQuestionIndex > questionIndex;
    const isQuestionInProgress = currentQuestionIndex === questionIndex;
    if (!isQuestionCompleted && !isQuestionInProgress && !isFirstQuestion) {
      throw new HttpError(403, []);
    }

    const isClueUsedInQuestion = await gameGroupUsedClueService.findOne({
      gameQuestionId: question.id,
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

  private mapEntity(entity: Model<GameQuestion> & GameQuestion): GameQuestion {
    return {
      id: entity.id,
      game: entity.game,
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

export default new GameQuestionService();
