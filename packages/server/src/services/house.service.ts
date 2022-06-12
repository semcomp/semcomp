import { Model } from "mongoose";

import houseAchievementService from "./house-achievement.service";
import houseMemberService from "./house-member.service";
import House, { HouseModel } from "../models/house";
import IdServiceImpl from "./id-impl.service";
import achievementService from "./achievement.service";
import AchievementTypes from "../lib/constants/achievement-types-enum";
import attendanceService from "./attendance.service";
import HouseAchievement from "../models/house-achievement";
import AchievementCategories from "../lib/constants/achievement-categories-enum";

const idService = new IdServiceImpl();

class HouseService {
  public async find(filters?: Partial<House>): Promise<House[]> {
    const houses = await HouseModel.find(filters);

    const entities: House[] = [];
    for (const house of houses) {
      entities.push(this.mapEntity(house));
    }

    return entities;
  }

  public async findById(id: string): Promise<House> {
    const entity = await HouseModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<House>): Promise<House> {
    const entity = await HouseModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<House>): Promise<number> {
    const count = await HouseModel.count(filters);

    return count;
  }

  public async create(house: House): Promise<House> {
    house.id = await idService.create();
    house.createdAt = Date.now();
    house.updatedAt = Date.now();
    const entity = await HouseModel.create(house);

    return this.findById(entity.id);
  }

  public async update(house: House): Promise<House> {
    house.updatedAt = Date.now();
    const entity = await HouseModel.findOneAndUpdate({ id: house.id }, house);

    return this.findById(entity.id);
  }

  public async delete(house: House): Promise<House> {
    const entity = await HouseModel.findOneAndDelete({ id: house.id });

    const houseAchievements = await houseAchievementService.find({ houseId: house.id });
    for (const houseAchievement of houseAchievements) {
      await houseAchievementService.delete(houseAchievement);
    }

    const houseMembers = await houseMemberService.find({ houseId: house.id });
    for (const houseMember of houseMembers) {
      await houseMemberService.delete(houseMember);
    }

    return entity && this.mapEntity(entity);
  }

  public async checkAchievements() {
    const houses = await this.find();
    const achievements = await achievementService.find({
      type: AchievementTypes.CASA,
    });

    for (const house of houses) {
      const houseMemberCount = await houseMemberService.count({ houseId: house.id });
      const houseMembers = await houseMemberService.find({ houseId: house.id });
      const houseAchievementCount = await houseAchievementService.count({ houseId: house.id });
      for (const achievement of achievements) {
        const houseAchievement = await houseAchievementService.findOne({ houseId: house.id, achievementId: achievement.id });

        if (houseAchievement) {
          continue;
        }

        // Presença em Evento
        if (achievement.category === AchievementCategories.PRESENCA_EM_EVENTO) {
          let i = 0;
          const totalUsersWhoAttendedThisEventCount = await attendanceService.count({ eventId: achievement.eventId });
          let houseMembersWhoAttendedThisEventCount = 0
          for (const houseMember of houseMembers) {
            if (await attendanceService.findOne({ eventId: achievement.eventId, userId: houseMember.userId })) {
              houseMembersWhoAttendedThisEventCount++;
            }
          }

          if (houseMembersWhoAttendedThisEventCount > houseMemberCount * (achievement.minPercentage / 100)) {
            const newHouseAchievement: HouseAchievement = {
              achievementId: achievement.id,
              houseId: house.id,
            };
            await houseAchievementService.create(newHouseAchievement);
          }
        }

        // Número de Conquistas
        if (achievement.category === AchievementCategories.NUMERO_DE_CONQUISTAS) {
          if (houseAchievementCount >= achievement.numberOfAchievements) {
            const newHouseAchievement: HouseAchievement = {
              achievementId: achievement.id,
              houseId: house.id,
            };
            await houseAchievementService.create(newHouseAchievement);
          }
        }
      }
    }
  }

  public async addHousePoints(house: House, points: number): Promise<House> {
    if (house) {
      house.score += Math.floor(+points);
    }

    return this.update(house);
  };

  private mapEntity(entity: Model<House> & House): House {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      telegramLink: entity.telegramLink,
      score: entity.score,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export default new HouseService();
