import { Model } from "mongoose";

import HardToClickGroupUsedSkip, { HardToClickGroupUsedSkipModel } from "../models/hard-to-click-group-used-skip";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class HardToClickGroupUsedSkipService {
  public async find(filters?: Partial<HardToClickGroupUsedSkip>): Promise<HardToClickGroupUsedSkip[]> {
    const hardToClickGroupUsedSkips = await HardToClickGroupUsedSkipModel.find(filters);

    const entities: HardToClickGroupUsedSkip[] = [];
    for (const hardToClickGroupUsedSkip of hardToClickGroupUsedSkips) {
      entities.push(this.mapEntity(hardToClickGroupUsedSkip));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickGroupUsedSkip> {
    const entity = await HardToClickGroupUsedSkipModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HardToClickGroupUsedSkip>): Promise<HardToClickGroupUsedSkip> {
    const entity = await HardToClickGroupUsedSkipModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<HardToClickGroupUsedSkip>): Promise<number> {
    const count = await HardToClickGroupUsedSkipModel.count(filters);

    return count;
  }

  public async create(hardToClickGroupUsedSkip: HardToClickGroupUsedSkip): Promise<HardToClickGroupUsedSkip> {
    hardToClickGroupUsedSkip.id = await idService.create();
    const entity = await HardToClickGroupUsedSkipModel.create(hardToClickGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async update(hardToClickGroupUsedSkip: HardToClickGroupUsedSkip): Promise<HardToClickGroupUsedSkip> {
    const entity = await HardToClickGroupUsedSkipModel.findOneAndUpdate({ id: hardToClickGroupUsedSkip.id }, hardToClickGroupUsedSkip);

    return this.findById(entity.id);
  }

  public async delete(hardToClickGroupUsedSkip: HardToClickGroupUsedSkip): Promise<HardToClickGroupUsedSkip> {
    const entity = await HardToClickGroupUsedSkipModel.findOneAndDelete({ id: hardToClickGroupUsedSkip.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<HardToClickGroupUsedSkip> & HardToClickGroupUsedSkip): HardToClickGroupUsedSkip {
    return {
      id: entity.id,
      hardToClickGroupId: entity.hardToClickGroupId,
      hardToClickQuestionId: entity.hardToClickQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HardToClickGroupUsedSkipService();
