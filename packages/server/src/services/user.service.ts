
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
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import EventTypes from "../lib/constants/event-types-enum";
import configService from "./config.service";
import subscriptionService from "./subscription.service";

const idService = new IdServiceImpl();

type Filters = User | {
  id: string[];
  email: string[];
  name: string[];
  password: string[];
  course: string[];
  discord: string[];
  telegram: string[];
  permission: boolean[];
  resetPasswordCode: string[];
  wantNameTag: boolean[];
  paid: boolean[];
  gotKit: boolean[];
  createdAt: number[];
  updatedAt: number[];
};

export interface UserService {
  find({
    filters,
    pagination,
  }: {
    filters?: Partial<Filters>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<User>>;
  findById(id: string): Promise<User>;
}

type UserStats = {
  name: string;
  email: string;
  hours: number;
  percentage: number;
};

class UserServiceImpl implements UserService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<Filters>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<User>> {
    const users = await UserModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: User[] = [];
    for (const user of users) {
      entities.push(this.mapEntity(user));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async minimalFind(filters?: Partial<Filters>): Promise<Partial<User>[]> {
    const users = await UserModel.find(filters);

    const entities: Partial<User>[] = [];
    for (const user of users) {
      entities.push(this.minimalMapEntity(user));
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
    user.createdAt = Date.now();
    user.updatedAt = Date.now();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    const entity = await UserModel.create(user);

    return this.findById(entity.id);
  }

  public async update(user: User): Promise<User> {
    user.updatedAt = Date.now();
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
    if (!userHouseMember) {
      return null;
    }
    
    const userHouse = await houseService.findOne({ id: userHouseMember.houseId });

    return userHouse;
  }

  async checkAchievements(): Promise<void> {
    const config = await configService.getOne();
    if (!config || !config.openAchievement) {
      return null;
    }
    
    const users = await this.find({ pagination: new PaginationRequest(1, 9999) });
    const events = await eventService.find({ pagination: new PaginationRequest(1, 9999) });
    const individualAchievements = await achievementService.find({
      type: AchievementTypes.INDIVIDUAL,
    });

    for (const user of users.getEntities()) {
      const userAchievementCount = await userAchievementService.count({ userId: user.id });
      for (const achievement of individualAchievements) {
        if (achievement.startDate && achievement.startDate > Date.now() ||
          achievement.endDate && achievement.endDate < Date.now()) {
          continue;
        }
        
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
          let attendanceOnEventType = 0;
          for (const event of events.getEntities()) {
            if (
              event.type === achievement.eventType &&
              await attendanceService.findOne({
                eventId: event.id,
                userId: user.id,
              })
            ) {
             attendanceOnEventType++;
            }
          }

          if (attendanceOnEventType > 0 && attendanceOnEventType >= achievement.numberOfPresences) {
            const newUserAchievement: UserAchievement = {
              achievementId: achievement.id,
              userId: user.id,
            };
            await userAchievementService.create(newUserAchievement);
          }
        }

        // Número de Conquistas
        if (achievement.category === AchievementCategories.NUMERO_DE_CONQUISTAS) {
          if (userAchievementCount > 0 && userAchievementCount >= achievement.numberOfAchievements) {
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

  public async stats(): Promise<UserStats[]> {
    // Para cada usuario, calcular a porcentagem de horas de eventos que ele participou
    // as horas serao o total de horas em TOODS os eventos que participou (palestras, minicursos, etc).
    // A porcentagem contara apenas os eventos do tipo palestra
    const users = await this.find({ pagination: new PaginationRequest(1, 9999) });

    // pegando quase todos os eventos (menos coffee)
    const events = await eventService.find({
      filters: {
        type: [
          EventTypes.PALESTRA,
          EventTypes.RODA,
          EventTypes.CULTURAL,
          EventTypes.CONCURSO,
          EventTypes.FEIRA
        ]
      },
      pagination: new PaginationRequest(1, 9999),
    });

    // pegando a duracao apenas dos eventos do tipo palestra
    let allPalestrasDurationInMilliseconds = events.getEntities().reduce(
      (previousDuration, event) => {
        if (event.type !== EventTypes.PALESTRA) {
          return previousDuration;
        }
        const eventDuration = event.endDate - event.startDate;
        return previousDuration + eventDuration;
      },
      0,
    );

    const allAttendances = await attendanceService.find();
    const entities: UserStats[] = [];
    for (const user of users.getEntities()) {
      const userStats = {
        name: user.name,
        email: user.email,
        course: user.course,
        hours: 0,
        percentage: 0,
      };

      const userAttended = allAttendances.filter((attendance) => attendance.userId === user.id);

      // pegando a duracao dos eventos do tipo palestra que o usuario participou
      // e a duracao de todos os eventos que o usuario participou
      let palestraUserAttendedDurationInMilliseconds = 0;
      let eventsUserAttendedDurationInMilliseconds = 0;
      for (const attendedEvent of userAttended) {
        const event = events.getEntities().find((event) => event.id === attendedEvent.eventId);
        if (!event) {
          continue;
        }

        const eventDuration = event.endDate - event.startDate;

        if (event.type === EventTypes.PALESTRA) {
          palestraUserAttendedDurationInMilliseconds += eventDuration;
        }
        eventsUserAttendedDurationInMilliseconds += eventDuration;
      }

      userStats.hours = Math.round(eventsUserAttendedDurationInMilliseconds / (60 * 60 * 1000) * 100) / 100;
      userStats.percentage = Math.ceil(
        palestraUserAttendedDurationInMilliseconds / allPalestrasDurationInMilliseconds * 100 * 100
      ) / 100;

      entities.push(userStats);
    }

    return entities;
  }

  private mapEntity(entity: Model<User> & User): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      password: entity.password,
      course: entity.course,
      discord: entity.discord,
      telegram: entity.telegram,
      permission: entity.permission,
      resetPasswordCode: entity.resetPasswordCode,
      wantNameTag: entity.wantNameTag,
      paid: entity.paid,
      gotKit: entity.gotKit,
      gotTagName: entity.gotTagName,
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
