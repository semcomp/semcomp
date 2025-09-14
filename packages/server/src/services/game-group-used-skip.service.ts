import { Model } from "mongoose";

import GameGroupUsedSkip, { GameGroupUsedSkipModel } from "../models/game-group-used-skip";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class GameGroupUsedSkipService {
  public async find(filters?: Partial<GameGroupUsedSkip>): Promise<GameGroupUsedSkip[]> {
    const gameGroupUsedSkips = await GameGroupUsedSkipModel.find(filters);

    const entities: GameGroupUsedSkip[] = [];
    for (const gameGroupUsedSkip of gameGroupUsedSkips) {
      entities.push(this.mapEntity(gameGroupUsedSkip));
    }

    return entities;
  }

  public async findById(id: string): Promise<GameGroupUsedSkip> {
    const entity = await GameGroupUsedSkipModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroupUsedSkip>): Promise<GameGroupUsedSkip> {
    const entity = await GameGroupUsedSkipModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<GameGroupUsedSkip>): Promise<number> {
    const count = await GameGroupUsedSkipModel.countDocuments(filters);
    
    return count;
  }

  public async create(gameGroupUsedSkip: GameGroupUsedSkip): Promise<GameGroupUsedSkip> {
    gameGroupUsedSkip.id = await idService.create();
    gameGroupUsedSkip.createdAt = Date.now();
    gameGroupUsedSkip.updatedAt = Date.now();
    const entity = await GameGroupUsedSkipModel.create(gameGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async update(gameGroupUsedSkip: GameGroupUsedSkip): Promise<GameGroupUsedSkip> {
    gameGroupUsedSkip.updatedAt = Date.now();
    const entity = await GameGroupUsedSkipModel.findOneAndUpdate({ id: gameGroupUsedSkip.id }, gameGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async delete(gameGroupUsedSkip: GameGroupUsedSkip): Promise<GameGroupUsedSkip> {
    const entity = await GameGroupUsedSkipModel.findOneAndDelete({ id: gameGroupUsedSkip.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<GameGroupUsedSkip> & GameGroupUsedSkip): GameGroupUsedSkip {
    return {
      id: entity.id,
      gameGroupId: entity.gameGroupId,
      gameQuestionId: entity.gameQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new GameGroupUsedSkipService();
