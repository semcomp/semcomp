import { Model } from "mongoose";
import HttpError from "../lib/http-error";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";

import GameGroup, { GameGroupModel } from "../models/game-group";
import GameGroupMember from "../models/game-group-member";
import User from "../models/user";
import IdServiceImpl from "./id-impl.service";
import gameGroupCompletedQuestionService from "./game-group-completed-question.service";
import gameGroupMemberService from "./game-group-member.service";
import gameQuestionService from "./game-question.service";
import userService from "./user.service";
import Game from "../lib/constants/game-enum";

const idService = new IdServiceImpl();

const MAX_MEMBERS_IN_GROUP = {
  [Game.HARD_TO_CLICK]: 3,
  [Game.RIDDLE]: 3,
  [Game.RIDDLETHON]: 3,
};
const MAX_MEMBERS = {
  [Game.HARD_TO_CLICK]: 60,
  [Game.RIDDLE]: 700,
  [Game.RIDDLETHON]: 30,
};

const createEmptyGameGroupWithInfo = (enumGame: Game): GameGroupWithInfo => {
  return {
    id: '',
    game: enumGame,
    name: 'Sem ganhador até o momento',
    availableClues: 0,
    availableSkips: 0,
    createdAt: 0,
    updatedAt: 0,
    members: [],
    completedQuestions: []
  };
};

type GameGroupWithInfo = GameGroup & {
  members: Partial<User>[],
  completedQuestions: {
    index: number;
    createdAt: number;
  }[],
};

class GameGroupService {
  public async find({
    filters,
    pagination,
  }: {
    filters?: Partial<GameGroup>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<GameGroup>> {
    const users = await GameGroupModel
      .find(filters)
      .skip(pagination.getSkip())
      .limit(pagination.getItems());
    const count = await this.count(filters);

    const entities: GameGroup[] = [];
    for (const user of users) {
      entities.push(this.mapEntity(user));
    }

    const paginatedResponse = new PaginationResponse(entities, count)

    return paginatedResponse;
  }

  public async findById(id: string): Promise<GameGroup> {
    const entity = await GameGroupModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroup>): Promise<GameGroup> {
    const entity = await GameGroupModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<GameGroup>): Promise<number> {
    const count = await GameGroupModel.countDocuments(filters);

    return count;
  }

  public async create(gameGroup: GameGroup): Promise<GameGroup> {
    await this.verifyMaxMembers(gameGroup.game);
    const groupFound = await GameGroupModel.findOne({ name: gameGroup.id });
    if (groupFound) {
      throw new HttpError(400, []);
    }

    gameGroup.id = await idService.create();
    gameGroup.createdAt = Date.now();
    gameGroup.updatedAt = Date.now();
    gameGroup.availableClues = 0;
    gameGroup.availableSkips = 0;
    await GameGroupModel.create(gameGroup);

    return await this.findGroupWithInfo(gameGroup.id);
  }

  public async update(gameGroup: GameGroup): Promise<GameGroup> {
    gameGroup.updatedAt = Date.now();
    const entity = await GameGroupModel.findOneAndUpdate({ id: gameGroup.id }, gameGroup);

    return this.findById(entity.id);
  }

  public async delete(gameGroup: GameGroup): Promise<GameGroup> {
    const entity = await GameGroupModel.findOneAndDelete({ id: gameGroup.id });

    return entity && this.mapEntity(entity);
  }

  public async findUserGroup(userId: string): Promise<GameGroup> {
    const userMembership = await gameGroupMemberService.findOne({ userId });
    if (!userMembership) {
      throw new HttpError(404, []);
    }

    const group = await this.findOne({ id: userMembership.gameGroupId });
    if (!group) {
      throw new HttpError(404, []);
    }

    return group;
  }

  public async findUserGroupWithMembers(userId: string): Promise<GameGroupWithInfo> {
    const userMembership = await gameGroupMemberService.findOne({ userId });
    if (!userMembership) {
      return null;
    }

    return await this.findGroupWithInfo(userMembership.gameGroupId);
  }

  public async join(userId: string, gameGroupId: string): Promise<GameGroupWithInfo> {
    const group = await this.findOne({ id: gameGroupId });
    await this.verifyMaxMembers(group.game);

    const groupMembers = await gameGroupMemberService.find({ gameGroupId });
    
    if(groupMembers.length >= MAX_MEMBERS_IN_GROUP[group.game]){
      throw new HttpError(418, []);
    }

    if (groupMembers.find((groupMember) => groupMember.id === userId)) {
      throw new HttpError(400, []);
    }
    

    const gameGroupMember: GameGroupMember = {
      gameGroupId,
      userId,
    };
    await gameGroupMemberService.create(gameGroupMember);

    return await this.findGroupWithInfo(gameGroupId);
  }

  public async leave(userId: string): Promise<GameGroupMember> {
    const groupMembership = await gameGroupMemberService.findOne({ userId });
    if (!groupMembership) {
      throw new HttpError(404, []);
    }

    await gameGroupMemberService.delete(groupMembership);

    const groupMembershipCount = await gameGroupMemberService.count({ gameGroupId: groupMembership.gameGroupId });
    if (groupMembershipCount === 0) {
      await this.delete(await this.findById(groupMembership.gameGroupId));
    }

    return groupMembership;
  }

  private async verifyMaxMembers(game: Game): Promise<void> {
    const thisGameGroups = await this.find({ filters: { game }, pagination: new PaginationRequest(1, 9999) });
    const membershipCount = await gameGroupMemberService.count({ gameGroupId: thisGameGroups.getEntities().map(group => group.id) });
    if (membershipCount >= MAX_MEMBERS[game]) {
      throw new HttpError(418, []);
    }
  }

  private async findGroupWithInfo(gameGroupId: string): Promise<GameGroupWithInfo> {
    const group = await this.findOne({ id: gameGroupId });
    if (!group) {
      return null;
    }

    const groupMemberships = await gameGroupMemberService.find({ gameGroupId: group.id });
    const members = await userService.find({
      filters: {
        id: groupMemberships.map((groupMembership) => groupMembership.userId),
      },
      pagination: new PaginationRequest(),
    });


    const completedQuestions = await gameGroupCompletedQuestionService.find({ gameGroupId: group.id });
    const questions = await gameQuestionService.find({
      pagination: new PaginationRequest(1, 9999),
      filters: {
        id: completedQuestions.map((question) => question.gameQuestionId),
      }
    });
    const groupCompletedQuestionsInfo = completedQuestions.map((completedQuestion) => {
      const question = questions.getEntities().find(
        (question) => question.id === completedQuestion.gameQuestionId
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

  public async findBestGroupForEachGame(response: PaginationResponse<GameGroupWithInfo>){
    const entities  = response.getEntities();

    // Organiza estities em games
    const games: Record<string, GameGroupWithInfo[]> = {};

    for (const entity of entities) {
      if (!games[entity.game]) {
        games[entity.game] = [];
      }
      games[entity.game].push(entity);
    }

    const bestGroups: Record<string, GameGroupWithInfo> = {};

    for (const game in games) {
      const groups = games[game];
      
      // Encontra o grupo com mais completedQuestions
      groups.sort((a, b) => {
        const diff = b.completedQuestions.length - a.completedQuestions.length;
        if (diff !== 0) return diff;

        // Em caso de empate, sort por createdAt da ultima questao completa.
        const lastQuestionA = a.completedQuestions[a.completedQuestions.length - 1]?.createdAt || 0;
        const lastQuestionB = b.completedQuestions[b.completedQuestions.length - 1]?.createdAt || 0;
        return lastQuestionA - lastQuestionB;
      });


      if(groups[0].completedQuestions.length !== 0){
        bestGroups[game] = groups[0];
      }else{ // Em caso de ninguem ter feito uma questao ainda
        let enumGame: Game;
        switch (game){
          case Game.RIDDLE:
            enumGame = Game.RIDDLE;
            break;
          case Game.RIDDLETHON:
            enumGame = Game.RIDDLETHON;
            break;
          case Game.HARD_TO_CLICK:
            enumGame = Game.HARD_TO_CLICK;
            break;
        }
      
        bestGroups[game] = createEmptyGameGroupWithInfo(enumGame);
      }
    }

    return bestGroups;
  }

  public async findWithInfo({
    pagination,
  }: {
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<GameGroupWithInfo>> {
    const groups = await this.find({ pagination });
    const groupIds = groups.getEntities().map((group) => group.id);
    const completedQuestions = await gameGroupCompletedQuestionService.find({ gameGroupId: groupIds });
    const questions = await gameQuestionService.find({ pagination: new PaginationRequest(1, 9999) });
    const memberships = await gameGroupMemberService.find({ gameGroupId: groupIds });
    const membershipsUserIds = memberships.map((membership) => membership.userId);
    const users = await userService.minimalFind({ id: membershipsUserIds });


    const entities: GameGroupWithInfo[] = [];
    for (const group of groups.getEntities()) {
      const groupMemberships = memberships.filter((membership) => membership.gameGroupId === group.id);
      const groupMembers = groupMemberships.map(
        (groupMembership) => users.find((user) => user.id === groupMembership.userId)
      );

      const groupCompletedQuestions = completedQuestions.filter(
        (completedQuestion) => completedQuestion.gameGroupId === group.id
      );
      const groupCompletedQuestionsInfo = groupCompletedQuestions.map((groupCompletedQuestion) => {
        const question = questions.getEntities().find(
          (question) => question.id === groupCompletedQuestion.gameQuestionId
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

    const paginatedResponse = new PaginationResponse(entities, groups.getTotalNumberOfItems())
    return paginatedResponse;
  }

  private mapEntity(entity: Model<GameGroup> & GameGroup): GameGroup {
    return {
      id: entity.id,
      game: entity.game,
      name: entity.name,
      availableClues: entity.availableClues,
      availableSkips: entity.availableSkips,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};



export default new GameGroupService();
