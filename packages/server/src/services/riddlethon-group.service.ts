import { Model } from "mongoose";
import HttpError from "../lib/http-error";
import { PaginationRequest } from "../lib/pagination";

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

type RiddlethonGroupWithInfo = RiddlethonGroup & {
  members: Partial<User>[],
  completedQuestions: {
    index: number;
    createdAt: number;
  }[],
};

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
    riddlethonGroup.createdAt = Date.now();
    riddlethonGroup.updatedAt = Date.now();
    riddlethonGroup.availableClues = 0;
    riddlethonGroup.availableSkips = 0;
    await RiddlethonGroupModel.create(riddlethonGroup);

    return await this.findGroupWithInfo(riddlethonGroup.id);
  }

  public async update(riddlethonGroup: RiddlethonGroup): Promise<RiddlethonGroup> {
    riddlethonGroup.updatedAt = Date.now();
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

    const groupMembershipCount = await riddlethonGroupMemberService.count({ riddlethonGroupId: groupMembership.riddlethonGroupId });
    if (groupMembershipCount === 0) {
      await this.delete(await this.findById(groupMembership.riddlethonGroupId));
    }

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
      filters: {
        id: groupMemberships.map((groupMembership) => groupMembership.userId),
      },
      pagination: new PaginationRequest(),
    });


    const completedQuestions = await riddlethonGroupCompletedQuestionService.find({ riddlethonGroupId: group.id });
    const questions = await riddlethonQuestionService.find({
      id: completedQuestions.map((question) => question.riddlethonQuestionId)
    });
    const groupCompletedQuestionsInfo = completedQuestions.map((completedQuestion) => {
      const question = questions.find(
        (question) => question.id === completedQuestion.riddlethonQuestionId
      );

      return {
        index: question.index,
        createdAt: completedQuestion.createdAt,
      };
    });


    return {
      ...group,
      members: members.getEntities().map((member) => userService.minimalMapEntity(member)),
      completedQuestions: groupCompletedQuestionsInfo,
    };
  }

  public async findWithInfo(): Promise<RiddlethonGroupWithInfo[]> {
    const groups = await this.find();
    const groupIds = groups.map((group) => group.id);
    const completedQuestions = await riddlethonGroupCompletedQuestionService.find({ riddlethonGroupId: groupIds });
    const questions = await riddlethonQuestionService.find();
    const memberships = await riddlethonGroupMemberService.find({ riddlethonGroupId: groupIds });
    const membershipsUserIds = memberships.map((membership) => membership.userId);
    const users = await userService.minimalFind({ id: membershipsUserIds });


    const entities: RiddlethonGroupWithInfo[] = [];
    for (const group of groups) {
      const groupMemberships = memberships.filter((membership) => membership.riddlethonGroupId === group.id);
      const groupMembers = groupMemberships.map(
        (groupMembership) => users.find((user) => user.id === groupMembership.userId)
      );

      const groupCompletedQuestions = completedQuestions.filter(
        (completedQuestion) => completedQuestion.riddlethonGroupId === group.id
      );
      const groupCompletedQuestionsInfo = groupCompletedQuestions.map((groupCompletedQuestion) => {
        const question = questions.find(
          (question) => question.id === groupCompletedQuestion.riddlethonQuestionId
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
