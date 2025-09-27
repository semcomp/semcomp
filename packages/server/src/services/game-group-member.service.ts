import { Model } from "mongoose";

import GameGroupMember, { GameGroupMemberModel } from "../models/game-group-member";
import IdServiceImpl from "./id-impl.service";
import HttpError from "../lib/http-error";
import GameGroupService from "./game-group.service";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  gameGroupId: string | string[];
  userId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class GameGroupMemberService {
  public async find(filters?: Partial<Filters>): Promise<GameGroupMember[]> {
    const gameGroupMembers = await GameGroupMemberModel.find(filters);

    const entities: GameGroupMember[] = [];
    for (const gameGroupMember of gameGroupMembers) {
      entities.push(this.mapEntity(gameGroupMember));
    }

    return entities;
  }

  public async findById(id: string): Promise<GameGroupMember> {
    const entity = await GameGroupMemberModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroupMember>): Promise<GameGroupMember> {
    const entity = await GameGroupMemberModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await GameGroupMemberModel.countDocuments(filters);

    return count;
  }

  public async create(gameGroupMember: GameGroupMember): Promise<GameGroupMember> {
    try {
      const existingMembership = await this.findUserMembershipInGame(
        gameGroupMember.userId, 
        gameGroupMember.gameGroupId
      );
      
      if (existingMembership) {
        throw new HttpError(400, ["Você já está em um grupo neste jogo"]);
      }

      gameGroupMember.id = await idService.create();
      gameGroupMember.createdAt = Date.now();
      gameGroupMember.updatedAt = Date.now();
      const entity = await GameGroupMemberModel.create(gameGroupMember);

      return this.mapEntity(entity as any);
    } catch (error) {
      if (error.code === 11000) {
        throw new HttpError(400, ["Você já está em um grupo neste jogo"]);
      }
      
      throw error;
    }
  }

  public async update(gameGroupMember: GameGroupMember): Promise<GameGroupMember> {
    gameGroupMember.updatedAt = Date.now();
    const entity = await GameGroupMemberModel.findOneAndUpdate({ id: gameGroupMember.id }, gameGroupMember);

    return this.findById(entity.id);
  }

  public async delete(gameGroupMember: GameGroupMember): Promise<GameGroupMember> {
    const entity = await GameGroupMemberModel.findOneAndDelete({ id: gameGroupMember.id });

    return entity && this.mapEntity(entity);
  }

  private mapEntity(entity: Model<GameGroupMember> & GameGroupMember): GameGroupMember {
    return {
      id: entity.id,
      gameGroupId: entity.gameGroupId,
      userId: entity.userId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  private async findUserMembershipInGame(userId: string, gameGroupId: string): Promise<GameGroupMember> {
    const targetGroup = await GameGroupService.findOne({ id: gameGroupId });
    if (!targetGroup) {
      return null;
    }

    const result = await GameGroupMemberModel.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'game-group',
          localField: 'gameGroupId',
          foreignField: 'id',
          as: 'group'
        }
      },
      { $unwind: '$group' },
      { $match: { 'group.game': targetGroup.game } },
      { $limit: 1 }
    ]);

    return result.length > 0 ? this.mapEntity(result[0] as any) : null;
  }
};

export default new GameGroupMemberService();
