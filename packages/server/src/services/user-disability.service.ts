import { Model } from "mongoose";

import UserDisability, { UserDisabilityModel } from "../models/user-disability";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class UserDisabilityService {
  public async find(filters?: Partial<UserDisability>): Promise<UserDisability[]> {
    const userDisabilitys = await UserDisabilityModel.find(filters);

    const entities: UserDisability[] = [];
    for (const userDisability of userDisabilitys) {
      entities.push(this.mapEntity(userDisability));
    }

    return entities;
  }

  public async findById(id: string): Promise<UserDisability> {
    const entity = await UserDisabilityModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<UserDisability>): Promise<number> {
    const count = await UserDisabilityModel.count(filters);

    return count;
  }

  public async create(userDisability: UserDisability): Promise<UserDisability> {
    userDisability.id = await idService.create();
    userDisability.createdAt = Date.now();
    userDisability.updatedAt = Date.now();
    const entity = await UserDisabilityModel.create(userDisability);

    return this.findById(entity.id);
  }

  public async update(userDisability: UserDisability): Promise<UserDisability> {
    userDisability.updatedAt = Date.now();
    const entity = await UserDisabilityModel.findOneAndUpdate({ id: userDisability.id }, userDisability);

    return this.findById(entity.id);
  }

  public async delete(userDisability: UserDisability): Promise<UserDisability> {
    const entity = await UserDisabilityModel.findOneAndDelete({ id: userDisability.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<UserDisability> & UserDisability): UserDisability {
    return {
      id: entity.id,
      userId: entity.userId,
      disability: entity.disability,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new UserDisabilityService();
