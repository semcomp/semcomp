import { Model } from "mongoose";
import HttpError from "../lib/http-error";

import HardToClickGroup, { HardToClickGroupModel } from "../models/hard-to-click-group";
import HardToClickGroupMember from "../models/hard-to-click-group-member";
import User from "../models/user";
import IdServiceImpl from "./id-impl.service";
import hardToClickGroupCompletedQuestionService from "./hard-to-click-group-completed-question.service";
import hardToClickGroupMemberService from "./hard-to-click-group-member.service";
import hardToClickQuestionService from "./hard-to-click-question.service";
import userService from "./user.service";

const idService = new IdServiceImpl();

const MAX_MEMBERS_IN_GROUP = 3;
const MAX_MEMBERS = 60;

type HardToClickGroupWithInfo = HardToClickGroup & {
  members: Partial<User>[],
  completedQuestions: {
    index: number;
    createdAt: number;
  }[],
};

class HardToClickGroupService {
  public async find(filters?: Partial<HardToClickGroup>): Promise<HardToClickGroup[]> {
    const hardToClickGroups = await HardToClickGroupModel.find(filters);

    const entities: HardToClickGroup[] = [];
    for (const hardToClickGroup of hardToClickGroups) {
      entities.push(this.mapEntity(hardToClickGroup));
    }

    return entities;
  }

  public async findById(id: string): Promise<HardToClickGroup> {
    const entity = await HardToClickGroupModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<HardToClickGroup>): Promise<HardToClickGroup> {
    const entity = await HardToClickGroupModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<HardToClickGroup>): Promise<number> {
    const count = await HardToClickGroupModel.count(filters);

    return count;
  }

  public async create(hardToClickGroup: HardToClickGroup): Promise<HardToClickGroup> {
    await this.verifyMaxMembers();
    const groupFound = await HardToClickGroupModel.findOne({ name: hardToClickGroup.id });
    if (groupFound) {
      throw new HttpError(400, []);
    }

    hardToClickGroup.id = await idService.create();
    hardToClickGroup.createdAt = Date.now();
    hardToClickGroup.updatedAt = Date.now();
    await HardToClickGroupModel.create(hardToClickGroup);

    return await this.findGroupWithInfo(hardToClickGroup.id);
  }

  public async update(hardToClickGroup: HardToClickGroup): Promise<HardToClickGroup> {
    hardToClickGroup.updatedAt = Date.now();
    const entity = await HardToClickGroupModel.findOneAndUpdate({ id: hardToClickGroup.id }, hardToClickGroup);

    return this.findById(entity.id);
  }

  public async delete(hardToClickGroup: HardToClickGroup): Promise<HardToClickGroup> {
    const entity = await HardToClickGroupModel.findOneAndDelete({ id: hardToClickGroup.id });

    return entity && this.mapEntity(entity);
  }

  public async findUserGroup(userId: string): Promise<HardToClickGroup> {
    const userMembership = await hardToClickGroupMemberService.findOne({ userId });
    if (!userMembership) {
      throw new HttpError(404, []);
    }

    const group = await this.findOne({ id: userMembership.hardToClickGroupId });
    if (!group) {
      throw new HttpError(404, []);
    }

    return group;
  }

  public async findUserGroupWithMembers(userId: string): Promise<HardToClickGroupWithInfo> {
    const userMembership = await hardToClickGroupMemberService.findOne({ userId });
    if (!userMembership) {
      return null;
    }

    return await this.findGroupWithInfo(userMembership.hardToClickGroupId);
  }

  public async join(userId: string, hardToClickGroupId: string): Promise<HardToClickGroupWithInfo> {
    await this.verifyMaxMembers();

    const groupMembers = await hardToClickGroupMemberService.find({ hardToClickGroupId });
    if (
      groupMembers.find((groupMember) => groupMember.id === userId) ||
      groupMembers.length >= MAX_MEMBERS_IN_GROUP
    ) {
      throw new HttpError(400, []);
    }

    const hardToClickGroupMember: HardToClickGroupMember = {
      hardToClickGroupId,
      userId,
    };
    await hardToClickGroupMemberService.create(hardToClickGroupMember);

    return await this.findGroupWithInfo(hardToClickGroupId);
  }

  public async leave(userId: string): Promise<HardToClickGroupMember> {
    const groupMembership = await hardToClickGroupMemberService.findOne({ userId });
    if (!groupMembership) {
      throw new HttpError(404, []);
    }

    await hardToClickGroupMemberService.delete(groupMembership);

    const groupMembershipCount = await hardToClickGroupMemberService.count({ hardToClickGroupId: groupMembership.hardToClickGroupId });
    if (groupMembershipCount === 0) {
      await this.delete(await this.findById(groupMembership.hardToClickGroupId));
    }

    return groupMembership;
  }

  private async verifyMaxMembers(): Promise<void> {
    const membershipCount = await hardToClickGroupMemberService.count();
    if (membershipCount >= MAX_MEMBERS) {
      throw new HttpError(418, []);
    }
  }

  private async findGroupWithInfo(hardToClickGroupId: string): Promise<HardToClickGroupWithInfo> {
    const group = await this.findOne({ id: hardToClickGroupId });
    if (!group) {
      return null;
    }

    const groupMemberships = await hardToClickGroupMemberService.find({ hardToClickGroupId: group.id });
    const members = await userService.find({
      id: groupMemberships.map((groupMembership) => groupMembership.userId),
    });


    const completedQuestions = await hardToClickGroupCompletedQuestionService.find({ hardToClickGroupId: group.id });
    const questions = await hardToClickQuestionService.find({
      id: completedQuestions.map((question) => question.hardToClickQuestionId)
    });
    const groupCompletedQuestionsInfo = completedQuestions.map((completedQuestion) => {
      const question = questions.find(
        (question) => question.id === completedQuestion.hardToClickQuestionId
      );

      return {
        index: question.index,
        createdAt: completedQuestion.createdAt,
      };
    });


    return {
      ...group,
      members: members.map((member) => userService.minimalMapEntity(member)),
      completedQuestions: groupCompletedQuestionsInfo,
    };
  }

  public async findWithInfo(): Promise<HardToClickGroupWithInfo[]> {
    const groups = await this.find();
    const groupIds = groups.map((group) => group.id);
    const completedQuestions = await hardToClickGroupCompletedQuestionService.find({ hardToClickGroupId: groupIds });
    const questions = await hardToClickQuestionService.find();
    const memberships = await hardToClickGroupMemberService.find({ hardToClickGroupId: groupIds });
    const membershipsUserIds = memberships.map((membership) => membership.userId);
    const users = await userService.minimalFind({ id: membershipsUserIds });

    const entities: HardToClickGroupWithInfo[] = [];
    for (const group of groups) {
      const groupMemberships = memberships.filter((membership) => membership.hardToClickGroupId === group.id);
      const groupMembers = groupMemberships.map(
        (groupMembership) => users.find((user) => user.id === groupMembership.userId)
      );

      const groupCompletedQuestions = completedQuestions.filter(
        (completedQuestion) => completedQuestion.hardToClickGroupId === group.id
      );
      const groupCompletedQuestionsInfo = groupCompletedQuestions.map((groupCompletedQuestion) => {
        const question = questions.find(
          (item) => item.id === groupCompletedQuestion.hardToClickQuestionId
        );

        return {
          index: question.index,
          createdAt: groupCompletedQuestion.createdAt,
        };
      });

      entities.push({
        ...group,
        members: groupMembers,
        completedQuestions: groupCompletedQuestionsInfo,
      });
    }

    return entities;
  }

  private mapEntity(entity: Model<HardToClickGroup> & HardToClickGroup): HardToClickGroup {
    return {
      id: entity.id,
      name: entity.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new HardToClickGroupService();
