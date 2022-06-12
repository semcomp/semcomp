import { Model } from "mongoose";

import RiddlethonGroupUsedClue, { RiddlethonGroupUsedClueModel } from "../models/riddlethon-group-used-clue";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class RiddlethonGroupUsedClueService {
  public async find(filters?: Partial<RiddlethonGroupUsedClue>): Promise<RiddlethonGroupUsedClue[]> {
    const riddlethonGroupUsedClues = await RiddlethonGroupUsedClueModel.find(filters);

    const entities: RiddlethonGroupUsedClue[] = [];
    for (const riddlethonGroupUsedClue of riddlethonGroupUsedClues) {
      entities.push(this.mapEntity(riddlethonGroupUsedClue));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonGroupUsedClue> {
    const entity = await RiddlethonGroupUsedClueModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<RiddlethonGroupUsedClue>): Promise<RiddlethonGroupUsedClue> {
    const entity = await RiddlethonGroupUsedClueModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<RiddlethonGroupUsedClue>): Promise<number> {
    const count = await RiddlethonGroupUsedClueModel.count(filters);

    return count;
  }

  public async create(riddlethonGroupUsedClue: RiddlethonGroupUsedClue): Promise<RiddlethonGroupUsedClue> {
    riddlethonGroupUsedClue.id = await idService.create();
    riddlethonGroupUsedClue.createdAt = Date.now();
    riddlethonGroupUsedClue.updatedAt = Date.now();
    const entity = await RiddlethonGroupUsedClueModel.create(riddlethonGroupUsedClue);

    return this.findById(entity.id);
  }

  public async update(riddlethonGroupUsedClue: RiddlethonGroupUsedClue): Promise<RiddlethonGroupUsedClue> {
    riddlethonGroupUsedClue.updatedAt = Date.now();
    const entity = await RiddlethonGroupUsedClueModel.findOneAndUpdate({ id: riddlethonGroupUsedClue.id }, riddlethonGroupUsedClue);

    return this.findById(entity.id);
  }

  public async delete(riddlethonGroupUsedClue: RiddlethonGroupUsedClue): Promise<RiddlethonGroupUsedClue> {
    const entity = await RiddlethonGroupUsedClueModel.findOneAndDelete({ id: riddlethonGroupUsedClue.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<RiddlethonGroupUsedClue> & RiddlethonGroupUsedClue): RiddlethonGroupUsedClue {
    return {
      id: entity.id,
      riddlethonGroupId: entity.riddlethonGroupId,
      riddlethonQuestionId: entity.riddlethonQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonGroupUsedClueService();
