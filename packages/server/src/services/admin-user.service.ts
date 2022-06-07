import bcrypt from "bcryptjs";
import { Model } from "mongoose";

import AdminUser, { AdminUserModel } from "../models/admin-user";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class AdminUserService {
  public async find(filters?: Partial<AdminUser>): Promise<AdminUser[]> {
    const adminUsers = await AdminUserModel.find(filters);

    const entities: AdminUser[] = [];
    for (const adminUser of adminUsers) {
      entities.push(this.mapEntity(adminUser));
    }

    return entities;
  }

  public async findById(id: string): Promise<AdminUser> {
    const entity = await AdminUserModel.findOne({ id });

    return entity && this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<AdminUser>): Promise<AdminUser> {
    const entity = await AdminUserModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<AdminUser>): Promise<number> {
    const count = await AdminUserModel.count(filters);

    return count;
  }

  public async create(adminUser: AdminUser): Promise<AdminUser> {
    adminUser.id = await idService.create();
    adminUser.password = bcrypt.hashSync(adminUser.password, bcrypt.genSaltSync(10));
    const entity = await AdminUserModel.create(adminUser);

    return this.findById(entity.id);
  }

  public async update(adminUser: AdminUser): Promise<AdminUser> {
    const entity = await AdminUserModel.findOneAndUpdate({ id: adminUser.id }, adminUser);

    return this.findById(entity.id);
  }

  public async delete(adminUser: AdminUser): Promise<AdminUser> {
    const entity = await AdminUserModel.findOneAndDelete({ id: adminUser.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<AdminUser> & AdminUser): AdminUser {
    return {
      id: entity.id,
      email: entity.email,
      password: entity.password,
      adminRole: entity.adminRole,
      resetPasswordCode: entity.resetPasswordCode,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new AdminUserService();
