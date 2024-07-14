import { Model } from "mongoose";

import Achievement, { AchievementModel } from "../models/achievement";
import houseAchievementService from "./house-achievement.service";
import houseMemberService from "./house-member.service";
import IdServiceImpl from "./id-impl.service";
import userAchievementService from "./user-achievement.service";

const idService = new IdServiceImpl();

class AchievementService {
  public async find(filters?: Partial<Achievement>): Promise<Achievement[]> {
    const achievements = await AchievementModel.find(filters);

    const entities: Achievement[] = [];
    for (const achievement of achievements) {
      entities.push(this.mapEntity(achievement));
    }

    return entities;
  }

  public async findById(id: string): Promise<Achievement> {
    const entity = await AchievementModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<Achievement>): Promise<Achievement> {
    const entity = await AchievementModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Achievement>): Promise<number> {
    const count = await AchievementModel.count(filters);

    return count;
  }

  public async create(achievement: Achievement): Promise<Achievement> {
    achievement.id = await idService.create();
    achievement.createdAt = Date.now();
    achievement.updatedAt = Date.now();
    const entity = await AchievementModel.create(achievement);

    return this.findById(entity.id);
  }

  public async update(achievement: Achievement): Promise<Achievement> {
    achievement.updatedAt = Date.now();
    const entity = await AchievementModel.findOneAndUpdate({ id: achievement.id }, achievement);

    return this.findById(entity.id);
  }

  public async delete(achievement: Achievement): Promise<Achievement> {
    const entity = await AchievementModel.findOneAndDelete({ id: achievement.id });

    const houseAchievements = await houseAchievementService.find({ achievementId: achievement.id });
    for (const houseAchievement of houseAchievements) {
      await houseAchievementService.delete(houseAchievement);
    }

    return entity && this.mapEntity(entity);
  }

  public async getUserAchievements(userId: string): Promise<(Achievement & { isEarned: boolean })[]> {
    const achievements = await this.find();
    const userHouse = await houseMemberService.findOne({ userId });
    const userHouseAchievements = await houseAchievementService.find({ houseId: userHouse ? userHouse.id : null });
    const userAchievements = await userAchievementService.find({ userId });

    const achievementsWithUserInfo = [];
    for (const achievement of achievements) {
      const userHaveAchievement = userAchievements.find(
        (userAchievement) => userAchievement.achievementId === achievement.id
      );
      const userHouseHasAchievement = userHouseAchievements ? userHouseAchievements.find(
        (houseAchievement) => houseAchievement.achievementId === achievement.id
      ) : null;

      achievementsWithUserInfo.push({
        ...achievement,
        isEarned:
          userHaveAchievement || userHouseHasAchievement ? true : false,
      });
    }

    return achievementsWithUserInfo;
  }

  private mapEntity(entity: Model<Achievement> & Achievement): Achievement {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      startDate: entity.startDate,
      endDate: entity.endDate,
      type: entity.type,
      minPercentage: entity.minPercentage,
      category: entity.category,
      eventId: entity.eventId,
      eventType: entity.eventType,
      numberOfPresences: entity.numberOfPresences,
      numberOfAchievements: entity.numberOfAchievements,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new AchievementService();
