import { Model } from "mongoose";

import HardToClickGroupUsedClue, { HardToClickGroupUsedClueModel } from "../models/hard-to-click-group-used-clue";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class HardToClickGroupUsedClueService {
  public async find(filters?: Partial<HardToClickGroupUsedClue>): Promise<HardToClickGroupUsedClue[]> {
    const hardToClickGroupUsedClues = await HardToClickGroupUsedClueModel.find(filters);

    const entities: HardToClickGroupUsedClue[] = [];
    for (const hardToClickGroupUsedClue of hardToClickGroupUsedClues) {
      entities.push(this.mapEntity(hardToClickGroupUsedClue));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickGroupUsedClue> {
    const entity = await HardToClickGroupUsedClueModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HardToClickGroupUsedClue>): Promise<HardToClickGroupUsedClue> {
    const entity = await HardToClickGroupUsedClueModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<HardToClickGroupUsedClue>): Promise<number> {
    const count = await HardToClickGroupUsedClueModel.count(filters);

    return count;
  }

  public async create(hardToClickGroupUsedClue: HardToClickGroupUsedClue): Promise<HardToClickGroupUsedClue> {
    hardToClickGroupUsedClue.id = await idService.create();
    const entity = await HardToClickGroupUsedClueModel.create(hardToClickGroupUsedClue);

    return this.findById(entity.id);
  }

  public async update(hardToClickGroupUsedClue: HardToClickGroupUsedClue): Promise<HardToClickGroupUsedClue> {
    const entity = await HardToClickGroupUsedClueModel.findOneAndUpdate({ id: hardToClickGroupUsedClue.id }, hardToClickGroupUsedClue);

    return this.findById(entity.id);
  }

  public async delete(hardToClickGroupUsedClue: HardToClickGroupUsedClue): Promise<HardToClickGroupUsedClue> {
    const entity = await HardToClickGroupUsedClueModel.findOneAndDelete({ id: hardToClickGroupUsedClue.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<HardToClickGroupUsedClue> & HardToClickGroupUsedClue): HardToClickGroupUsedClue {
    return {
      id: entity.id,
      hardToClickGroupId: entity.hardToClickGroupId,
      hardToClickQuestionId: entity.hardToClickQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HardToClickGroupUsedClueService();
