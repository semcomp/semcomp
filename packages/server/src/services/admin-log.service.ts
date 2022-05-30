import { Model } from "mongoose";

import AdminLog, { AdminLogModel } from "../models/admin-log";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class AdminLogService {
  public async find(filters?: Partial<AdminLog>): Promise<AdminLog[]> {
    const houseAchievements = await AdminLogModel.find(filters);

    const entities: AdminLog[] = [];
    for (const houseAchievement of houseAchievements) {
      entities.push(this.mapEntity(houseAchievement));
    }

    return entities;
  }

  public async findById(id: string): Promise<AdminLog> {
    const entity = await AdminLogModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<AdminLog>): Promise<number> {
    const count = await AdminLogModel.count(filters);

    return count;
  }

  public async create(houseAchievement: AdminLog): Promise<AdminLog> {
    houseAchievement.id = await idService.create();
    const entity = await AdminLogModel.create(houseAchievement);

    return this.findById(entity.id);
  }

  public async update(houseAchievement: AdminLog): Promise<AdminLog> {
    const entity = await AdminLogModel.findOneAndUpdate({ id: houseAchievement.id }, houseAchievement);

    return this.findById(entity.id);
  }

  public async delete(houseAchievement: AdminLog): Promise<AdminLog> {
    const entity = await AdminLogModel.findOneAndDelete({ id: houseAchievement.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<AdminLog> & AdminLog): AdminLog {
    return {
      id: entity.id,
      adminId: entity.adminId,
      type: entity.type,
      collectionName: entity.collectionName,
      objectBefore: entity.objectBefore,
      objectAfter: entity.objectAfter,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new AdminLogService();
