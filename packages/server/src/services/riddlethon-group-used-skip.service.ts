import { Model } from "mongoose";

import RiddlethonGroupUsedSkip, { RiddlethonGroupUsedSkipModel } from "../models/riddlethon-group-used-skip";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class RiddlethonGroupUsedSkipService {
  public async find(filters?: Partial<RiddlethonGroupUsedSkip>): Promise<RiddlethonGroupUsedSkip[]> {
    const riddlethonGroupUsedSkips = await RiddlethonGroupUsedSkipModel.find(filters);

    const entities: RiddlethonGroupUsedSkip[] = [];
    for (const riddlethonGroupUsedSkip of riddlethonGroupUsedSkips) {
      entities.push(this.mapEntity(riddlethonGroupUsedSkip));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonGroupUsedSkip> {
    const entity = await RiddlethonGroupUsedSkipModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<RiddlethonGroupUsedSkip>): Promise<RiddlethonGroupUsedSkip> {
    const entity = await RiddlethonGroupUsedSkipModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<RiddlethonGroupUsedSkip>): Promise<number> {
    const count = await RiddlethonGroupUsedSkipModel.count(filters);

    return count;
  }

  public async create(riddlethonGroupUsedSkip: RiddlethonGroupUsedSkip): Promise<RiddlethonGroupUsedSkip> {
    riddlethonGroupUsedSkip.id = await idService.create();
    riddlethonGroupUsedSkip.createdAt = Date.now();
    riddlethonGroupUsedSkip.updatedAt = Date.now();
    const entity = await RiddlethonGroupUsedSkipModel.create(riddlethonGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async update(riddlethonGroupUsedSkip: RiddlethonGroupUsedSkip): Promise<RiddlethonGroupUsedSkip> {
    riddlethonGroupUsedSkip.updatedAt = Date.now();
    const entity = await RiddlethonGroupUsedSkipModel.findOneAndUpdate({ id: riddlethonGroupUsedSkip.id }, riddlethonGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async delete(riddlethonGroupUsedSkip: RiddlethonGroupUsedSkip): Promise<RiddlethonGroupUsedSkip> {
    const entity = await RiddlethonGroupUsedSkipModel.findOneAndDelete({ id: riddlethonGroupUsedSkip.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<RiddlethonGroupUsedSkip> & RiddlethonGroupUsedSkip): RiddlethonGroupUsedSkip {
    return {
      id: entity.id,
      riddlethonGroupId: entity.riddlethonGroupId,
      riddlethonQuestionId: entity.riddlethonQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonGroupUsedSkipService();
