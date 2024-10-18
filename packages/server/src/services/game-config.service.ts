import { Model } from "mongoose";

import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import GameConfig, {GameConfigModel} from "../models/game-config";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class GameConfigService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<GameConfig>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<GameConfig>> {
    const games = await GameConfigModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: GameConfig[] = [];
    for (const game of games) {
      entities.push(this.mapEntity(game));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<GameConfig> {
    const entity = await GameConfigModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameConfig>): Promise<GameConfig> {
    const entity = await GameConfigModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async findMany(filters?: Partial<GameConfig>): Promise<GameConfig[]> {
    const games = await GameConfigModel.find(filters);
    const entities: GameConfig[] = [];
    for (const game of games) {
      entities.push(this.mapEntity(game));
    }

    return entities;
  }

  public async count(filters?: Partial<GameConfig>): Promise<number> {
    const count = await GameConfigModel.count(filters);

    return count;
  }

  public async create(game: GameConfig): Promise<GameConfig> {
    game.id = idService.create();
    game.createdAt = Date.now();
    game.updatedAt = Date.now();
    const entity = await GameConfigModel.create(game);

    return this.findById(entity.id);
  }

  public async update(game: GameConfig): Promise<GameConfig> {
    game.updatedAt = Date.now();
    const entity = await GameConfigModel.findOneAndUpdate({ id: game.id }, game);

    return this.findById(entity.id);
  }

  public async delete(id: string): Promise<GameConfig> {
    const entity = await GameConfigModel.findOneAndDelete({ id: id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<GameConfig> & GameConfig): GameConfig {
    return {
      id: entity.id,
      game: entity.game,
      title: entity.title,
      description: entity.description,
      rules: entity.rules,
      eventPrefix: entity.eventPrefix,
      startDate: entity.startDate,
      endDate: entity.endDate,
      hasGroups: entity.hasGroups,
      maximumNumberOfMembersInGroup: entity.maximumNumberOfMembersInGroup,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new GameConfigService();
