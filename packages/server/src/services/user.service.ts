
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
import configService from "./config.service";
import crypto from "crypto";
import PaymentStatus from "../lib/constants/payment-status-enum";
import TShirtSize from "../lib/constants/t-shirt-size-enum";
import FoodOption from "../lib/constants/food-option-enum";

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
  verificationCode: string[];
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

  public async filteredFindBackoffice({
    filters,
    pagination,
  }: {
    filters?: any;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<User>> {

    const filtersObj = typeof filters === 'string' ? JSON.parse(filters) : filters;
    const { sortConfig, searchQuery } = filtersObj || {};
    const searchFields = ['course', 'name', 'email', 'telegram'];

    // Definição da chave e direção de ordenação
    let sortKey = sortConfig?.key || 'createdAt';
    const sortDirection = sortConfig?.direction === 'desc' ? -1 : 1;
    const sortStage: any = { [sortKey]: sortDirection };

    // Filtro de Busca
    let query: any = {};
    if (searchQuery && searchQuery.trim() !== '') {
      query = {
        $or: searchFields.map(field => ({
          [field]: { $regex: searchQuery, $options: 'i' }
        })),
      };
    }

    const basePipeline = [
        // Match inicial para query de busca
        { $match: query }, 
        
        {
          $lookup: {
            from: 'house-member',
            localField: 'id',
            foreignField: 'userId',
            as: 'houseMember',
            pipeline: [{ $limit: 1 }]
          }
        },
        { $unwind: { path: '$houseMember', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'house',
            localField: 'houseMember.houseId',
            foreignField: 'id',
            as: 'houseDetails',
            pipeline: [{ $project: { name: 1, _id: 0 } }, { $limit: 1 }]
          }
        },
        { $unwind: { path: '$houseDetails', preserveNullAndEmptyArrays: true } },

        {
          $lookup: {
            from: 'payment',
            localField: 'id',
            foreignField: 'userId',
            as: 'rawPayments',
          }
        },
        {
          $addFields: {
            activePayments: {
              $filter: {
                input: '$rawPayments',
                as: 'p',
                cond: { $ne: ['$$p.status', PaymentStatus.CANCELED] } 
              }
            }
          }
        },

        {
          $lookup: {
            from: 'user-disability',
            localField: '_id',
            foreignField: 'userId',
            as: 'userDisabilities',
          }
        },
        
        { 
            $project: {
                id: '$id',
                name: '$name',
                email: '$email',
                course: '$course',
                telegram: '$telegram',
                gotKit: { $ifNull: ['$gotKit', false] },
                gotTagName: { $ifNull: ['$gotTagName', false] },
                wantNameTag: { $ifNull: ['$wantNameTag', false] },
                permission: { $ifNull: ['$permission', false] },
                createdAt: '$createdAt',
                updatedAt: '$updatedAt',

                house: {
                    name: { $ifNull: ['$houseDetails.name', 'Não possui'] },
                },

                payment: {
                    status: '$activePayments.status',
                    saleOption: '$activePayments.salesOption',
                    
                    tShirtSize: {
                        $reduce: {
                            input: '$activePayments',
                            initialValue: TShirtSize.NONE,
                            in: { $cond: [{ $ne: ['$$this.tShirtSize', TShirtSize.NONE] }, '$$this.tShirtSize', '$$value'] }
                        }
                    },
                    foodOption: {
                        $reduce: {
                            input: '$activePayments',
                            initialValue: FoodOption.NONE,
                            in: { $cond: [{ $ne: ['$$this.foodOption', FoodOption.NONE] }, '$$this.foodOption', '$$value'] }
                        }
                    }
                },
                disabilities: '$userDisabilities.disability',
            }
        }
    ];
    
    const aggregationResult = await UserModel.aggregate([
        ...basePipeline,
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [
                    { $sort: sortStage }, 
                    { $skip: pagination.getSkip() },
                    { $limit: pagination.getItems() }
                ]
            }
        }
    ]).exec();

    const [results] = aggregationResult;
    const total = results.metadata[0]?.total || 0;
    const users: User[] = results.data;

    return new PaginationResponse<User>(users, total);
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
    const count = await UserModel.countDocuments(filters);

    return count;
  }

  public async create(user: User): Promise<User> {
    user.id = await idService.create();
    user.createdAt = Date.now();
    user.updatedAt = Date.now();
    user.password = bcrypt.hashSync(user.password, bcrypt.genSaltSync(10));
    user.verificationCode = crypto.randomBytes(6).toString("hex");
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

  public async deleteAllCron() {
    //If user.verified is false and 30minutes has passed since the account has been created then
    //delete that account
    const now = new Date();
    const formattedNow = now.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    console.log(`[CRON] (${formattedNow}) Removendo contas...`);

    const users = await UserModel.find({
      verified: false,
      createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) }
    });

    users.forEach((user: User) => {
      console.log("Usuário excluído: ", user.email)
      this.delete(user);
    })

    console.log("[CRON] Fluxo finalizado");
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
      verified: entity.verified,
      resetPasswordCode: entity.resetPasswordCode,
      verificationCode: entity.verificationCode,
      wantNameTag: entity.wantNameTag,
      paid: entity.paid,
      gotKit: entity.gotKit,
      gotTagName: entity.gotTagName,
      additionalInfos: entity.additionalInfos,
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
