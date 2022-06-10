import { Model } from "mongoose";

import HardToClickGroupMember, { HardToClickGroupMemberModel } from "../models/hard-to-click-group-member";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  hardToClickGroupId: string | string[];
  userId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class HardToClickGroupMemberService {
  public async find(filters?: Partial<Filters>): Promise<HardToClickGroupMember[]> {
    const hardToClickGroupMembers = await HardToClickGroupMemberModel.find(filters);

    const entities: HardToClickGroupMember[] = [];
    for (const hardToClickGroupMember of hardToClickGroupMembers) {
      entities.push(this.mapEntity(hardToClickGroupMember));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickGroupMember> {
    const entity = await HardToClickGroupMemberModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HardToClickGroupMember>): Promise<HardToClickGroupMember> {
    const entity = await HardToClickGroupMemberModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await HardToClickGroupMemberModel.count(filters);

    return count;
  }

  public async create(hardToClickGroupMember: HardToClickGroupMember): Promise<HardToClickGroupMember> {
    hardToClickGroupMember.id = await idService.create();
    const entity = await HardToClickGroupMemberModel.create(hardToClickGroupMember);

    return this.findById(entity.id);
  }

  public async update(hardToClickGroupMember: HardToClickGroupMember): Promise<HardToClickGroupMember> {
    const entity = await HardToClickGroupMemberModel.findOneAndUpdate({ id: hardToClickGroupMember.id }, hardToClickGroupMember);

    return this.findById(entity.id);
  }

  public async delete(hardToClickGroupMember: HardToClickGroupMember): Promise<HardToClickGroupMember> {
    const entity = await HardToClickGroupMemberModel.findOneAndDelete({ id: hardToClickGroupMember.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<HardToClickGroupMember> & HardToClickGroupMember): HardToClickGroupMember {
    return {
      id: entity.id,
      hardToClickGroupId: entity.hardToClickGroupId,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HardToClickGroupMemberService();
