import { Model } from "mongoose";

import GameGroupCompletedQuestion, { GameGroupCompletedQuestionModel } from "../models/game-group-completed-question";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  gameGroupId: string | string[];
  gameQuestionId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class GameGroupCompletedQuestionService {
  public async find(filters?: Partial<Filters>): Promise<GameGroupCompletedQuestion[]> {
    const gameGroupCompletedQuestions = await GameGroupCompletedQuestionModel.find(filters);

    const entities: GameGroupCompletedQuestion[] = [];
    for (const gameGroupCompletedQuestion of gameGroupCompletedQuestions) {
      entities.push(this.mapEntity(gameGroupCompletedQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroupCompletedQuestion>): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await GameGroupCompletedQuestionModel.count(filters);

    return count;
  }

  public async create(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    gameGroupCompletedQuestion.id = await idService.create();
    gameGroupCompletedQuestion.createdAt = Date.now();
    gameGroupCompletedQuestion.updatedAt = Date.now();
    const entity = await GameGroupCompletedQuestionModel.create(gameGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async update(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    gameGroupCompletedQuestion.updatedAt = Date.now();
    const entity = await GameGroupCompletedQuestionModel.findOneAndUpdate({ id: gameGroupCompletedQuestion.id }, gameGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async delete(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOneAndDelete({ id: gameGroupCompletedQuestion.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<GameGroupCompletedQuestion> & GameGroupCompletedQuestion): GameGroupCompletedQuestion {
    return {
      id: entity.id,
      gameGroupId: entity.gameGroupId,
      gameQuestionId: entity.gameQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new GameGroupCompletedQuestionService();
