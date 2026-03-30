import { Model } from "mongoose";

import GameGroupCompletedQuestion, { GameGroupCompletedQuestionModel } from "../models/game-group-completed-question";
import IdServiceImpl from "./id-impl.service";
import { PaginationRequest, PaginationResponse } from "../lib/pagination";
import { GameGroupModel } from "../models/game-group";

const idService = new IdServiceImpl();

type Filters = {
  id: string | string[];
  gameGroupId: string | string[];
  gameQuestionId: string | string[];
  createdAt: number | number[];
  updatedAt: number | number[];
};

class GameGroupCompletedQuestionService {
  public async find(filters?: Partial<Filters>): Promise<GameGroupCompletedQuestion[]> {
    const gameGroupCompletedQuestions = await GameGroupCompletedQuestionModel.find(filters);

    const entities: GameGroupCompletedQuestion[] = [];
    for (const gameGroupCompletedQuestion of gameGroupCompletedQuestions) {
      entities.push(this.mapEntity(gameGroupCompletedQuestion));
    }

    return entities;
  }

  public async findById(id: string): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOne({ id });

    return this.mapEntity(entity);
  }

  public async findOne(filters?: Partial<GameGroupCompletedQuestion>): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOne(filters);

    return entity && this.mapEntity(entity);
  }

  public async count(filters?: Partial<Filters>): Promise<number> {
    const count = await GameGroupCompletedQuestionModel.countDocuments(filters);

    return count;
  }

  public async create(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    gameGroupCompletedQuestion.id = await idService.create();

    const now = Date.now();

    // diferença de fuso horário em milissegundos (3 horas * 60 minutos * 60 segundos * 1000 milissegundos)
    // Não estou considerando horário de verão, pois atualmente ele não está em vigor
    const timezoneOffset = 3 * 60 * 60 * 1000;

    const nowInBrazil = now - timezoneOffset;

    gameGroupCompletedQuestion.createdAt = nowInBrazil;
    gameGroupCompletedQuestion.updatedAt = nowInBrazil;
    const entity = await GameGroupCompletedQuestionModel.create(gameGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async update(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    gameGroupCompletedQuestion.updatedAt = Date.now();
    const entity = await GameGroupCompletedQuestionModel.findOneAndUpdate({ id: gameGroupCompletedQuestion.id }, gameGroupCompletedQuestion);

    return this.findById(entity.id);
  }

  public async delete(gameGroupCompletedQuestion: GameGroupCompletedQuestion): Promise<GameGroupCompletedQuestion> {
    const entity = await GameGroupCompletedQuestionModel.findOneAndDelete({ id: gameGroupCompletedQuestion.id });

    return entity && this.mapEntity(entity);
  }

  public async getLastQuestionByGroup({
    filters,
    pagination,
  }: {
    filters?: Partial<GameGroupCompletedQuestion>;
    pagination: PaginationRequest;
  }): Promise<PaginationResponse<GameGroupCompletedQuestion>> {
    
    const itemsPerPage = pagination.getItems();
    const page = pagination.getPage();
    const skip = (page - 1) * itemsPerPage;

    const aggregationPipeline = [
      {
        $match: filters || {},
      },
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: "$gameGroupId",
          mostRecentDocument: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$mostRecentDocument",
        },
      },
      {
        $lookup: {
          from: "game-question",
          localField: "gameQuestionId",
          foreignField: "id",
          as: "question",
        },
      },
      {
        $unwind: "$question",
      },
      {
        $lookup: {
          from: "game-group",
          localField: "gameGroupId",
          foreignField: "id",
          as: "group",
        },
      },
      {
        $unwind: "$group",
      },
      {
        $lookup: {
          from: "game-group-member",
          let: { groupId: "$gameGroupId" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$gameGroupId", "$$groupId"] },
              },
            },
            {
              $lookup: {
                from: "user",
                localField: "userId",
                foreignField: "id",
                as: "userDetails",
              },
            },
            {
              $unwind: "$userDetails",
            },
            {
              $project: {
                _id: 0,
                name: "$userDetails.name",
              },
            },
          ],
          as: "membersInfo",
        },
      },
      {
        $project: {
          questionIndex: "$question.index",
          groupName: "$group.name",
          game: "$group.game",
          createdAt: "$createdAt",
          members: "$membersInfo.name",
        },
      },
      {
        $sort: {
          questionIndex: -1,
          createdAt: -1,
        },
      },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip }, 
            { $limit: itemsPerPage }
          ],
        },
      },
    ];
    
    const result = await GameGroupCompletedQuestionModel.aggregate(aggregationPipeline);

    const entities = result[0]?.data || [];
    const totalItems = result[0]?.metadata[0]?.total || 0;

    const paginatedResponse: PaginationResponse<GameGroupCompletedQuestion> = new PaginationResponse(entities, totalItems);

    return paginatedResponse;
  }

  public async getWinnersByGame() {
    const entity = await GameGroupCompletedQuestionModel.aggregate([
      {
        $sort: {
          updatedAt: -1,
        },
      },
      {
        $group: {
          _id: "$gameGroupId",
          mostRecentDocument: {
            $first: "$$ROOT",
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$mostRecentDocument",
        },
      },
      {
        $lookup: {
          from: "game-question",
          localField: "gameQuestionId",
          foreignField: "id",
          as: "question",
        },
      },
      {
        $unwind: "$question",
      },
      {
        $lookup: {
          from: "game-group",
          localField: "gameGroupId",
          foreignField: "id",
          as: "group",
        },
      },
      {
        $unwind: "$group",
      },
      {
        $project: {
          questionIndex: "$question.index",
          groupName: "$group.name",
          game: "$group.game",
        },
      },
      {
        $sort: {
          questionIndex: -1,
          createdAt: -1
        },
      },
      {
        $group: {
          _id: "$game",
          maxIndexDocument: { $first: "$$ROOT" },
        },
      },
      {
        $replaceRoot: {
          newRoot: "$maxIndexDocument", 
        },
      },
      {
        $limit: 3,
      }
    ]);

    const games: Record<string, any[]> = {};
    for (const game of entity) {
      if (!games[game.game]) {
        games[game.game] = [];
      }

      games[game.game].push(game);
    }
    
    return games;
  }
  
  private mapEntity(entity: Model<GameGroupCompletedQuestion> & GameGroupCompletedQuestion): GameGroupCompletedQuestion {
    return {
      id: entity.id,
      gameGroupId: entity.gameGroupId,
      gameQuestionId: entity.gameQuestionId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
};

export default new GameGroupCompletedQuestionService();
