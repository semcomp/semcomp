import { Model } from "mongoose";

import GameGroupUsedClue, { GameGroupUsedClueModel } from "../models/game-group-used-clue";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class GameGroupUsedClueService {
  public async find(filters?: Partial<GameGroupUsedClue>): Promise<GameGroupUsedClue[]> {
    const gameGroupUsedClues = await GameGroupUsedClueModel.find(filters);

    const entities: GameGroupUsedClue[] = [];
    for (const gameGroupUsedClue of gameGroupUsedClues) {
      entities.push(this.mapEntity(gameGroupUsedClue));
    }

    return entities;
  }

  public async findById(id: string): Promise<GameGroupUsedClue> {
    const entity = await GameGroupUsedClueModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroupUsedClue>): Promise<GameGroupUsedClue> {
    const entity = await GameGroupUsedClueModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<GameGroupUsedClue>): Promise<number> {
    const count = await GameGroupUsedClueModel.count(filters);

    return count;
  }

  public async create(gameGroupUsedClue: GameGroupUsedClue): Promise<GameGroupUsedClue> {
    gameGroupUsedClue.id = await idService.create();
    gameGroupUsedClue.createdAt = Date.now();
    gameGroupUsedClue.updatedAt = Date.now();
    const entity = await GameGroupUsedClueModel.create(gameGroupUsedClue);

    return this.findById(entity.id);
  }

  public async update(gameGroupUsedClue: GameGroupUsedClue): Promise<GameGroupUsedClue> {
    gameGroupUsedClue.updatedAt = Date.now();
    const entity = await GameGroupUsedClueModel.findOneAndUpdate({ id: gameGroupUsedClue.id }, gameGroupUsedClue);

    return this.findById(entity.id);
  }

  public async delete(gameGroupUsedClue: GameGroupUsedClue): Promise<GameGroupUsedClue> {
    const entity = await GameGroupUsedClueModel.findOneAndDelete({ id: gameGroupUsedClue.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<GameGroupUsedClue> & GameGroupUsedClue): GameGroupUsedClue {
    return {
      id: entity.id,
      gameGroupId: entity.gameGroupId,
      gameQuestionId: entity.gameQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new GameGroupUsedClueService();
