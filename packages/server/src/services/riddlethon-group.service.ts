import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import RiddlethonGroup, { RiddlethonGroupModel } from "../models/riddlethon-group";
import RiddlethonGroupMember from "../models/riddlethon-group-member";
import User from "../models/user";
import IdServiceImpl from "./id-impl.service";
import riddlethonGroupCompletedQuestionService from "./riddlethon-group-completed-question.service";
import riddlethonGroupMemberService from "./riddlethon-group-member.service";
import riddlethonQuestionService from "./riddlethon-question.service";
import userService from "./user.service";

const idService = new IdServiceImpl();

const MAX_MEMBERS_IN_GROUP = 3;
const MAX_MEMBERS = 60;

type RiddlethonGroupWithInfo = RiddlethonGroup & { members: Partial<User>[], completedQuestionsIndexes: number[] };

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

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<RiddlethonGroup>): Promise<number> {
    const count = await RiddlethonGroupModel.count(filters);

    return count;
  }

  public async create(riddlethonGroup: RiddlethonGroup): Promise<RiddlethonGroup> {
    await this.verifyMaxMembers();
    const groupFound = await RiddlethonGroupModel.findOne({ name: riddlethonGroup.id });
    if (groupFound) {
      throw new HttpError(400, []);
    }

    riddlethonGroup.id = await idService.create();
    riddlethonGroup.availableClues = 0;
    riddlethonGroup.availableSkips = 0;
    await RiddlethonGroupModel.create(riddlethonGroup);

    return await this.findGroupWithInfo(riddlethonGroup.id);
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

  public async findUserGroupWithMembers(userId: string): Promise<RiddlethonGroupWithInfo> {
    const userMembership = await riddlethonGroupMemberService.findOne({ userId });
    if (!userMembership) {
      return null;
    }

    return await this.findGroupWithInfo(userMembership.riddlethonGroupId);
  }

  public async join(userId: string, riddlethonGroupId: string): Promise<RiddlethonGroupWithInfo> {
    await this.verifyMaxMembers();

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
    await riddlethonGroupMemberService.create(riddlethonGroupMember);

    return await this.findGroupWithInfo(riddlethonGroupId);
  }

  public async leave(userId: string): Promise<RiddlethonGroupMember> {
    const groupMembership = await riddlethonGroupMemberService.findOne({ userId });
    if (!groupMembership) {
      throw new HttpError(404, []);
    }

    await riddlethonGroupMemberService.delete(groupMembership);

    return groupMembership;
  }

  private async verifyMaxMembers(): Promise<void> {
    const membershipCount = await riddlethonGroupMemberService.count();
    if (membershipCount >= MAX_MEMBERS) {
      throw new HttpError(418, []);
    }
  }

  private async findGroupWithInfo(riddlethonGroupId: string): Promise<RiddlethonGroupWithInfo> {
    const group = await this.findOne({ id: riddlethonGroupId });
    if (!group) {
      return null;
    }

    const groupMemberships = await riddlethonGroupMemberService.find({ riddlethonGroupId: group.id });
    const members = await userService.find({
      id: groupMemberships.map((groupMembership) => groupMembership.userId),
    });

    const completedQuestions = await riddlethonGroupCompletedQuestionService.find({ riddlethonGroupId: group.id });
    const completedQuestionss = await riddlethonQuestionService.find({
      id: completedQuestions.map((question) => question.riddlethonQuestionId)
    });

    return {
      ...group,
      members: members.map((member) => userService.minimalMapEntity(member)),
      completedQuestionsIndexes: completedQuestionss.map((question) => question.index),
    };
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
