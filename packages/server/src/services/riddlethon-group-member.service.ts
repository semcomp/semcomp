import { Model } from "mongoose";

import RiddlethonGroupMember, { RiddlethonGroupMemberModel } from "../models/riddlethon-group-member";
import IdServiceImpl from "./id-impl.service";

const idService = new IdServiceImpl();

class RiddlethonGroupMemberService {
  public async find(filters?: Partial<RiddlethonGroupMember>): Promise<RiddlethonGroupMember[]> {
    const riddlethonGroupMembers = await RiddlethonGroupMemberModel.find(filters);

    const entities: RiddlethonGroupMember[] = [];
    for (const riddlethonGroupMember of riddlethonGroupMembers) {
      entities.push(this.mapEntity(riddlethonGroupMember));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonGroupMember> {
    const entity = await RiddlethonGroupMemberModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<RiddlethonGroupMember>): Promise<RiddlethonGroupMember> {
    const entity = await RiddlethonGroupMemberModel.findOne(filters);

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<RiddlethonGroupMember>): Promise<number> {
    const count = await RiddlethonGroupMemberModel.count(filters);

    return count;
  }

  public async create(riddlethonGroupMember: RiddlethonGroupMember): Promise<RiddlethonGroupMember> {
    riddlethonGroupMember.id = await idService.create();
    const entity = await RiddlethonGroupMemberModel.create(riddlethonGroupMember);

    return this.findById(entity.id);
  }

  public async update(riddlethonGroupMember: RiddlethonGroupMember): Promise<RiddlethonGroupMember> {
    const entity = await RiddlethonGroupMemberModel.findOneAndUpdate({ id: riddlethonGroupMember.id }, riddlethonGroupMember);

    return this.findById(entity.id);
  }

  public async delete(riddlethonGroupMember: RiddlethonGroupMember): Promise<RiddlethonGroupMember> {
    const entity = await RiddlethonGroupMemberModel.findOneAndDelete({ id: riddlethonGroupMember.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<RiddlethonGroupMember> & RiddlethonGroupMember): RiddlethonGroupMember {
    return {
      id: entity.id,
      riddlethonGroupId: entity.riddlethonGroupId,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonGroupMemberService();
