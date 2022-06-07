import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import RiddlethonGroup, { RiddlethonGroupModel } from "../models/riddlethon-group";
import RiddlethonGroupMember from "../models/riddlethon-group-member";
import User from "../models/user";
import IdServiceImpl from "./id-impl.service";
import riddlethonGroupMemberService from "./riddlethon-group-member.service";
import userService from "./user.service";

const idService = new IdServiceImpl();

const MAX_MEMBERS_IN_GROUP = 3;

class RiddlethonGroupService {
  public async find(filters?: Partial<RiddlethonGroup>): Promise<RiddlethonGroup[]> {
    const riddlethonGroups = await RiddlethonGroupModel.find(filters);

    const entities: RiddlethonGroup[] = [];
    for (const riddlethonGroup of riddlethonGroups) {
      entities.push(this.mapEntity(riddlethonGroup));
    }

    return entities;
  }

  public async findById(id: string): Promise<RiddlethonGroup> {
    const entity = await RiddlethonGroupModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<RiddlethonGroup>): Promise<RiddlethonGroup> {
    const entity = await RiddlethonGroupModel.findOne(filters);

    return this.mapEntity(entity);
  }

  public async count(filters?: Partial<RiddlethonGroup>): Promise<number> {
    const count = await RiddlethonGroupModel.count(filters);

    return count;
  }

  public async create(riddlethonGroup: RiddlethonGroup): Promise<RiddlethonGroup> {
    const groupFound = await RiddlethonGroupModel.findOne({ name: riddlethonGroup.id });
    if (groupFound) {
      throw new HttpError(400, []);
    }

    riddlethonGroup.id = await idService.create();
    riddlethonGroup.availableClues = 0;
    riddlethonGroup.availableSkips = 0;
    const entity = await RiddlethonGroupModel.create(riddlethonGroup);

    return this.findById(entity.id);
  }

  public async update(riddlethonGroup: RiddlethonGroup): Promise<RiddlethonGroup> {
    const entity = await RiddlethonGroupModel.findOneAndUpdate({ id: riddlethonGroup.id }, riddlethonGroup);

    return this.findById(entity.id);
  }

  public async delete(riddlethonGroup: RiddlethonGroup): Promise<RiddlethonGroup> {
    const entity = await RiddlethonGroupModel.findOneAndDelete({ id: riddlethonGroup.id });

    return entity && this.mapEntity(entity);
  }

  public async findUserGroup(userId: string): Promise<RiddlethonGroup> {
    const userMembership = await riddlethonGroupMemberService.findOne({ userId });
    if (!userMembership) {
      throw new HttpError(404, []);
    }

    const group = await this.findOne({ id: userMembership.riddlethonGroupId });
    if (!group) {
      throw new HttpError(404, []);
    }

    return group;
  }

  public async findUserGroupWithMembers(userId: string): Promise<RiddlethonGroup & { members: Partial<User>[] }> {
    const userMembership = await riddlethonGroupMemberService.findOne({ userId });
    if (!userMembership) {
      throw new HttpError(404, []);
    }

    const group = await this.findOne({ id: userMembership.riddlethonGroupId });
    if (!group) {
      throw new HttpError(404, []);
    }

    const groupMemberships = await riddlethonGroupMemberService.find({ riddlethonGroupId: group.id });
    const members = await userService.find({
      id: groupMemberships.map((groupMembership) => groupMembership.userId),
    });

    return {
      ...group,
      members: members.map((member) => userService.minimalMapEntity(member)),
    };
  }

  public async join(userId: string, riddlethonGroupId: string): Promise<RiddlethonGroupMember> {
    const groupMembers = await riddlethonGroupMemberService.find({ riddlethonGroupId });
    if (
      groupMembers.find((groupMember) => groupMember.id === userId) ||
      groupMembers.length >= MAX_MEMBERS_IN_GROUP
    ) {
      throw new HttpError(400, []);
    }

    const riddlethonGroupMember: RiddlethonGroupMember = {
      riddlethonGroupId,
      userId,
    };
    const joinedGroupMembership = await riddlethonGroupMemberService.create(riddlethonGroupMember);

    return joinedGroupMembership;
  }

  public async leave(userId: string): Promise<RiddlethonGroupMember> {
    const groupMembership = await riddlethonGroupMemberService.findOne({ userId });
    if (!groupMembership) {
      throw new HttpError(404, []);
    }

    await riddlethonGroupMemberService.delete(groupMembership);

    return groupMembership;
  }

  private mapEntity(entity: Model<RiddlethonGroup> & RiddlethonGroup): RiddlethonGroup {
    return {
      id: entity.id,
      name: entity.name,
      availableClues: entity.availableClues,
      availableSkips: entity.availableSkips,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new RiddlethonGroupService();
