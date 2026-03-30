import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import { Server, Socket } from "socket.io";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
import { handleSocketError } from "../../lib/handle-socket-error";
import gameGroupService from "../../services/game-group.service";
import gameQuestionService from "../../services/game-question.service";
import gameGroupCompletedQuestionService from "../../services/game-group-completed-question.service";
import GameGroupCompletedQuestion from "../../models/game-group-completed-question";
import { PaginationRequest } from "../../lib/pagination";
import Game from "../../lib/constants/game-enum";
import GameQuestion from "../../models/game-question";
import cacheManagerService from "../../services/cache-manager.service";
import ConfigService from "../../services/config.service";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface IMember {
  id: any;
  [key: string]: any;
}

interface IGroupWithMembers {
  members: IMember[];
  [key: string]: any;
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 30000; // 30 segundos

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export default class GameController {
  private game: Game;
  private cache = new SimpleCache();

  constructor(ioServer: Server, game: Game) {
    this.game = game;

    ioServer.on("connection", (socket) => {
      socket.on("disconnect", () => {
        this.cleanupSocketCache(socket);
      });

      socket.on(`${this.game}-join-group-room`, async ({ token }) => {
        await this.broadcastUserInfo(ioServer, socket, token);
      });

      socket.on(`${this.game}-create-group`, async ({ token, name }) => {
        await this.createGroup(ioServer, socket, token, name);
      });

      socket.on(`${this.game}-broadcast-user-info`, async (token) => {
        await this.broadcastUserInfo(ioServer, socket, token);
      });

      socket.on(`${this.game}-try-answer`, async ({ token, index, answer }) => {
        await this.tryAnswer(ioServer, socket, token, index, answer);
      });

      socket.on(`${this.game}-use-clue`, async ({ token }) => {
        await this.useClue(ioServer, socket, token);
      });
    });
  }

  private cleanupSocketCache(socket: Socket) {
  }

  private validateToken(token: any): string {
    if (!token || typeof token !== 'string') {
      throw new SocketError("Token inválido");
    }
    return token;
  }

  private getUserGroupCacheKey(userId: string): string {
    return `user-group-${this.game}-${userId}`;
  }

  private getQuestionCacheKey(index: number): string {
    return `question-${this.game}-${index}`;
  }

  private async getUserAndGroup(socket: Socket, token: string) {
    const validatedToken = this.validateToken(token);
    
    const decoded = jwt.verify(
      validatedToken.replace("Bearer ", ""),
      process.env.JWT_PRIVATE_KEY
    ).data;


    const cacheKey = this.getUserGroupCacheKey(decoded.id);
    const cachedGroup = this.cache.get(cacheKey);
    if (cachedGroup) {
      const group = cachedGroup as IGroupWithMembers;
      
      
      // Verificar se o grupo pertence ao jogo correto
      if (group.game !== this.game) {
        // Se não pertence, limpar o cache e buscar novamente
        this.cache.delete(cacheKey);
      } else {
        const user = group.members.find(
          (member) => member.id === decoded.id
        );
        return { user, group };
      }
    }

    const group = await gameGroupService.findUserGroupWithMembers(decoded.id, this.game);
    
    
    if (!group) {
      socket.emit(`${this.game}-group-info`, null);
      throw new SocketError("Você não tem um grupo");
    }

    // Cachear o grupo por 1 minuto
    this.cache.set(cacheKey, group, 60 * 1000);

    const user = group.members.find(
      (member) => member.id === decoded.id
    );

    return { user, group };
  }

  private async broadcastUserInfo(ioServer: Server, socket: Socket, token: string) {
    try {
      const validatedToken = this.validateToken(token);
      const { group } = await this.getUserAndGroup(socket, validatedToken);
      const groupId = group.id;
      socket.join(groupId);

      ioServer.to(groupId).emit(`${this.game}-group-info`, group);
    } catch (error) {
      return handleSocketError(error, socket, this.game);
    }
  }

  private async createGroup(ioServer: Server, socket: Socket, token: string, name: string) {
    try {
      const validatedToken = this.validateToken(token);
      const decoded = jwt.verify(
        validatedToken.replace("Bearer ", ""),
        process.env.JWT_PRIVATE_KEY
      ).data;

      const group = await gameGroupService.findUserGroupWithMembers(decoded.id, this.game);
      if (group) {
        socket.emit(`${this.game}-group-info`, null);
        throw new SocketError("Você já tem um grupo");
      }
      
      const createdGroup = await gameGroupService.create({
        name, game: this.game
      });
      await gameGroupService.join(
        decoded.id,
        createdGroup.id,
      );
      
      this.cache.delete(this.getUserGroupCacheKey(decoded.id));
      socket.emit(`${this.game}-group-created`, createdGroup);
    } catch (error) {
      return handleSocketError(error, socket, this.game);
    }
  }

  private async tryAnswer(
    ioServer: Server,
    socket: Socket,
    token: string,
    index: number,
    answer: string,
  ) {
    try {
      const config = await ConfigService.getOne();

      if (!config || !config.openGames) {
        throw new SocketError("O jogo está bloqueado");
      }

      const validatedToken = this.validateToken(token);
      const { group } = await this.getUserAndGroup(socket, validatedToken);
      const groupId = group.id;
      socket.join(groupId);

      const questionCacheKey = this.getQuestionCacheKey(index);
      let question = this.cache.get(questionCacheKey) as GameQuestion;
      
      if (!question) {
        question = await gameQuestionService.findOne({ index, game: this.game });
        if (!question) {
          throw new SocketError("Pergunta não encontrada");
        }
        // Cachear pergunta por 5 minutos
        this.cache.set(questionCacheKey, question, 5 * 60 * 1000);
      }

      const groupCompletedQuestions = await gameGroupCompletedQuestionService.find({
        gameGroupId: group.id,
      });

      const completedQuestionIds = groupCompletedQuestions.map(gcq => gcq.gameQuestionId);
      const completedQuestions = await gameQuestionService.find({
        pagination: new PaginationRequest(1, 200),
        filters: {
          id: completedQuestionIds
        }
      });

      const isFirstQuestion = index === 0;
      const currentQuestionIndex = completedQuestions.getEntities().length > 0 ? 
        (completedQuestions.getEntities().reduce((a, b) =>
          a.index > b.index ? a : b
        ).index + 1) : 1;
      
      const isQuestionCompleted = currentQuestionIndex > index;
      const isQuestionInProgress = currentQuestionIndex === index;
      
      if (isQuestionCompleted && !isFirstQuestion) {
        throw new SocketError("A pergunta já foi respondida");
      }
      
      if (!isQuestionInProgress && !isFirstQuestion) {
        throw new SocketError("Um erro ocorreu");
      }

      if (
        stringSimilarity.compareTwoStrings(
          normalizeString(answer),
          normalizeString(question.answer)
        ) > 0.9
      ) {

        const gameGroupCompletedQuestion: GameGroupCompletedQuestion = {
          gameGroupId: group.id,
          gameQuestionId: question.id,
          createdAt: (new Date()).getTime(),
        };
        await gameGroupCompletedQuestionService.create(gameGroupCompletedQuestion);

        // Limpar cache de todos os membros do grupo
        group.members.forEach(member => {
          this.cache.delete(this.getUserGroupCacheKey(member.id));
        });

        const { group: updatedGroup } = await this.getUserAndGroup(socket, validatedToken);
        socket.emit(`${this.game}-try-answer-result`, { 
          index, 
          isCorrect: true, 
          group: updatedGroup 
        });

        // Notificar outros membros do grupo sobre a atualização
        ioServer.to(groupId).emit(`${this.game}-group-update`, {
          type: 'question-completed',
          data: {
            questionIndex: index,
            completedAt: Date.now(),
            group: updatedGroup
          }
        });
      } else {
        socket.emit(`${this.game}-try-answer-result`, { 
          index, 
          isCorrect: false 
        });
      }
    } catch (error) {
      return handleSocketError(error, socket, this.game);
    }
  }

  private async useClue(ioServer: Server, socket: Socket, token: string) {
    try {
      const validatedToken = this.validateToken(token);
      const { user, group } = await this.getUserAndGroup(socket, validatedToken);
      
      const result = await gameGroupService.useClue(user.id, this.game);
      cacheManagerService.clearUserCache(user.id);
      
      // Notifica todos os membros do grupo sobre o uso da dica
      ioServer.to(group.id).emit(`${this.game}-group-update`, {
        type: 'clue-used',
        data: { 
          group: result,
          usedBy: user.name,
          availableClues: result.availableClues
        }
      });
      
    } catch (error) {
      return handleSocketError(error, socket, this.game);
    }
  }

  public clearUserCache(userId: string): void {
    const cacheKey = this.getUserGroupCacheKey(userId);
    this.cache.delete(cacheKey);
  }
}
