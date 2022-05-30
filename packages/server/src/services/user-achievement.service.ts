import { Model } from "mongoose";

import UserAchievement, { UserAchievementModel } from "../models/user-achievement";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class UserAchievementService {
  public async find(filters?: Partial<UserAchievement>): Promise<UserAchievement[]> {
    const userAchievements = await UserAchievementModel.find(filters);

    const entities: UserAchievement[] = [];
    for (const userAchievement of userAchievements) {
      entities.push(this.mapEntity(userAchievement));
    }

    return entities;
  }

  public async findById(id: string): Promise<UserAchievement> {
    const entity = await UserAchievementModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<UserAchievement>): Promise<number> {
    const count = await UserAchievementModel.count(filters);

    return count;
  }

  public async create(userAchievement: UserAchievement): Promise<UserAchievement> {
    userAchievement.id = await idService.create();
    const entity = await UserAchievementModel.create(userAchievement);

    return this.findById(entity.id);
  }

  public async update(userAchievement: UserAchievement): Promise<UserAchievement> {
    const entity = await UserAchievementModel.findOneAndUpdate({ id: userAchievement.id }, userAchievement);

    return this.findById(entity.id);
  }

  public async delete(userAchievement: UserAchievement): Promise<UserAchievement> {
    const entity = await UserAchievementModel.findOneAndDelete({ id: userAchievement.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<UserAchievement> & UserAchievement): UserAchievement {
    return {
      id: entity.id,
      userId: entity.userId,
      achievementId: entity.achievementId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new UserAchievementService();
