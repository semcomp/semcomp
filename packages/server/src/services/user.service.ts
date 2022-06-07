
import bcrypt from "bcryptjs";
import { Model } from "mongoose";

import User, { UserModel } from "../models/user";
import eventService from "./event.service";
import attendanceService from "./attendance.service";
import IdServiceImpl from "./id-impl.service";
import houseMemberService from "./house-member.service";
import houseService from "./house.service";
import House from "../models/house";
import achievementService from "./achievement.service";
import AchievementTypes from "../lib/constants/achievement-types-enum";
import userAchievementService from "./user-achievement.service";
import AchievementCategories from "../lib/constants/achievement-categories-enum";
import UserAchievement from "../models/user-achievement";
import userDisabilityService from "./user-disability.service";

const idService = new IdServiceImpl();

type Filters = User | {
  id: string[];
  nusp: string[];
  email: string[];
  name: string[];
  password: string[];
  course: string[];
  discord: string[];
  telegram: string[];
  permission: boolean[];
  resetPasswordCode: string[];
  paid: boolean[];
  createdAt: number[];
  updatedAt: number[];
};

export interface UserService {
  findById(id: string): Promise<User>;
  pay(id: string): Promise<void>;
}

class UserServiceImpl implements UserService {
  public async find(filters?: Partial<Filters>): Promise<User[]> {
    const users = await UserModel.find(filters);

    const entities: User[] = [];
    for (const user of users) {
      entities.push(this.mapEntity(user));
    }

    return entities;
  }

  public async findById(id: string): Promise<User> {
    const entity = await UserModel.findOne({ id });

    return entity && this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<User>): Promise<User> {
    const entity = await UserModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await UserModel.count(filters);

    return count;
  }

  public async create(user: User): Promise<User> {
    user.id = await idService.create();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    const entity = await UserModel.create(user);

    return this.findById(entity.id);
  }

  public async update(user: User): Promise<User> {
    const entity = await UserModel.findOneAndUpdate({ id: user.id }, user);

    return this.findById(entity.id);
  }

  public async delete(user: User): Promise<User> {
    const entity = await UserModel.findOneAndDelete({ id: user.id });

    const disabilities = await userDisabilityService.find({ userId: user.id });
    for (const disability of disabilities) {
      await userDisabilityService.delete(disability);
    }

    const houseMemberships = await houseMemberService.find({ userId: user.id });
    for (const houseMembership of houseMemberships) {
      await houseMemberService.delete(houseMembership);
    }

    const userAchievements = await userAchievementService.find({ userId: user.id });
    for (const userAchievement of userAchievements) {
      await userAchievementService.delete(userAchievement);
    }

    return entity && this.mapEntity(entity);
  }

  async getUserHouse(userId: string): Promise<House> {
    const userHouseMember = await houseMemberService.findOne({ userId });
    const userHouse = await houseService.findOne({ id: userHouseMember.houseId });

    return userHouse;
  }

  async checkAchievements(): Promise<void> {
    const users = await this.find();
    const events = await eventService.find();
    const individualAchievements = await achievementService.find({
      type: AchievementTypes.INDIVIDUAL,
    });

    for (const user of users) {
      const userAchievementCount = await userAchievementService.count({ userId: user.id });
      for (const achievement of individualAchievements) {
        const userAchievement = await userAchievementService.findOne({ userId: user.id, achievementId: achievement.id });
        if (userAchievement) {
          continue;
        }

        // Presença em Evento
        if (achievement.category === AchievementCategories.PRESENCA_EM_EVENTO) {
          if (await attendanceService.findOne({ eventId: achievement.eventId, userId: user.id })) {
            const newUserAchievement: UserAchievement = {
              achievementId: achievement.id,
              userId: user.id,
            };
            await userAchievementService.create(newUserAchievement);
          }
        }

        // Presença em Tipo de Evento
        if (achievement.category === AchievementCategories.PRESENCA_EM_TIPO_DE_EVENTO) {
          let i = 0;
          for (const event of events) {
            if (
              event.type === achievement.eventType &&
              await attendanceService.findOne({
                eventId: event.id,
                userId: user.id,
              })
            ) {
              i++;
            }
          }

          if (i >= achievement.numberOfPresences) {
            const newUserAchievement: UserAchievement = {
              achievementId: achievement.id,
              userId: user.id,
            };
            await userAchievementService.create(newUserAchievement);
          }
        }

        // Número de Conquistas
        if (achievement.category === AchievementCategories.NUMERO_DE_CONQUISTAS) {
          if (userAchievementCount >= achievement.numberOfAchievements) {
            const newUserAchievement: UserAchievement = {
              achievementId: achievement.id,
              userId: user.id,
            };
            await userAchievementService.create(newUserAchievement);
          }
        }
      }
    }
  }

  async pay(id: string): Promise<void> {
    const user = await this.findById(id);

    user.paid = true;

    await this.update(user);
  }

  private mapEntity(entity: Model<User> & User): User {
    return {
      id: entity.id,
      nusp: entity.nusp,
      email: entity.email,
      name: entity.name,
      password: entity.password,
      course: entity.course,
      discord: entity.discord,
      telegram: entity.telegram,
      permission: entity.permission,
      resetPasswordCode: entity.resetPasswordCode,
      paid: entity.paid,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  public minimalMapEntity(entity: User): Partial<User> {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      course: entity.course,
      discord: entity.discord,
      telegram: entity.telegram,
    };
  }
};

export default new UserServiceImpl();
