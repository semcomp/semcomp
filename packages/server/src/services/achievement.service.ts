import { Model } from "mongoose";

import Achievement, { AchievementModel } from "../models/achievement";
import houseAchievementService from "./house-achievement.service";
import houseMemberService from "./house-member.service";
import IdServiceImpl from "./id-impl.service";
import userAchievementService from "./user-achievement.service";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import { handleError } from "../lib/handle-error";
import UserAchievement from "../models/user-achievement";
import HttpError from "../lib/http-error";

const idService = new IdServiceImpl();

class AchievementService {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const entities = await AchievementModel.find({ pagination });

      return res.status(200).json(entities);
    } catch (error) {
      return handleError(error, next);
    }
  };
  
  public async findWithPagination({
    filters,
    pagination
  } : {
    filters?: Partial<Achievement>;
    pagination?:  PaginationRequest;
  }): Promise<PaginationResponse<Achievement>>  {
    const achievements = await AchievementModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());

    const count = await this.count(filters);

    const entities: Achievement[] = [];
    for (const achievement of achievements) {
      entities.push(this.mapEntity(achievement));
    }

    const paginatedResponse = new PaginationResponse(entities, count)
    return paginatedResponse;
  }

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

  public async addQrCodeAchievement(userId: string, achievementId: string) {
    const userAchievement = await userAchievementService.findOne({ userId: userId, achievementId: achievementId });
    if (userAchievement) {
      throw new HttpError(409, ['Conquista já atribuída.']);
    }

    const achievement = await this.findOne({ id: achievementId });
    if (!achievement) {
      throw new HttpError(404, ['Conquista não existe.']);
    }

    const newUserAchievement: UserAchievement = {
      userId: userId,
      achievementId: achievementId,
    };
    await userAchievementService.create(newUserAchievement);
  }
  
  public async update(achievement: Achievement): Promise<Achievement> {
    achievement.updatedAt = Date.now();
    const entity = await AchievementModel.findOneAndUpdate({ id: achievement.id }, achievement);

    return this.findById(entity.id);
  }

  public async delete(id: string): Promise<Achievement> {
    const entity = await AchievementModel.findOneAndDelete({ id: id });

    const houseAchievements = await houseAchievementService.find({ achievementId: id });
    for (const houseAchievement of houseAchievements) {
      await houseAchievementService.delete(houseAchievement);
    }

    const userAchievements = await userAchievementService.find({ achievementId: id });
    for (const userAchievement of userAchievements) {
      await userAchievementService.delete(userAchievement);
    }

    return entity && this.mapEntity(entity);
  }

  public async getUserAchievements(userId: string): Promise<(Achievement & { isEarned: boolean })[]> {
    const achievements = await this.find();
    const userHouse = await houseMemberService.findOne({ userId });
    const userHouseAchievements = await houseAchievementService.find({ houseId: userHouse ? userHouse.houseId : null });
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
      imageBase64: entity?.imageBase64,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new AchievementService();
