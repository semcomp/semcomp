import bcrypt from "bcryptjs";
import { Model } from "mongoose";

import AdminUser, { AdminUserModel } from "../models/admin-user";
import IdServiceImpl from "./id-impl.service";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

const idService = new IdServiceImpl();

class AdminUserService {
  public async find({
    filters,
    pagination,
  } : {
    filters?: Partial<AdminUser>,
    pagination?: PaginationRequest
  }):  Promise<PaginationResponse<AdminUser>>
  {
    const adminUsers = await AdminUserModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());;

    const count = await this.count(filters);
      
    const entities: AdminUser[] = [];
    for (const adminUser of adminUsers) {
      entities.push(this.mapEntity(adminUser));
    }

    const paginatedResponse = new PaginationResponse(entities, count);
    return paginatedResponse;
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
    const count = await AdminUserModel.countDocuments(filters);

    return count;
  }

  public async create(adminUser: AdminUser): Promise<AdminUser> {
    adminUser.id = await idService.create();
    adminUser.createdAt = Date.now();
    adminUser.updatedAt = Date.now();
    adminUser.password = bcrypt.hashSync(adminUser.password, bcrypt.genSaltSync(10));
    const entity = await AdminUserModel.create(adminUser);

    return this.findById(entity.id);
  }

  public async update(adminUser: AdminUser): Promise<AdminUser> {
    adminUser.updatedAt = Date.now();
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
