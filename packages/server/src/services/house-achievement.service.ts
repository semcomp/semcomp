import { Model } from "mongoose";

import HouseAchievement, { HouseAchievementModel } from "../models/house-achievement";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class HouseAchievementService {
  public async find(filters?: Partial<HouseAchievement>): Promise<HouseAchievement[]> {
    const houseAchievements = await HouseAchievementModel.find(filters);

    const entities: HouseAchievement[] = [];
    for (const houseAchievement of houseAchievements) {
      entities.push(this.mapEntity(houseAchievement));
    }

    return entities;
  }

  public async findById(id: string): Promise<HouseAchievement> {
    const entity = await HouseAchievementModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<HouseAchievement>): Promise<number> {
    const count = await HouseAchievementModel.count(filters);

    return count;
  }

  public async create(houseAchievement: HouseAchievement): Promise<HouseAchievement> {
    houseAchievement.id = await idService.create();
    const entity = await HouseAchievementModel.create(houseAchievement);

    return this.findById(entity.id);
  }

  public async update(houseAchievement: HouseAchievement): Promise<HouseAchievement> {
    const entity = await HouseAchievementModel.findOneAndUpdate({ id: houseAchievement.id });

    return this.findById(entity.id);
  }

  public async delete(houseAchievement: HouseAchievement): Promise<HouseAchievement> {
    const entity = await HouseAchievementModel.findOneAndDelete({ id: houseAchievement.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<HouseAchievement> & HouseAchievement): HouseAchievement {
    return {
      id: entity.id,
      houseId: entity.houseId,
      achievementId: entity.achievementId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HouseAchievementService();
