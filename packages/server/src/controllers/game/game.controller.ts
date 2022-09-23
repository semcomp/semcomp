import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
// import {addHousePoints} from '../../lib/add-house-points';
import { handleSocketError } from "../../lib/handle-socket-error";
import gameGroupService from "../../services/game-group.service";
import gameQuestionService from "../../services/game-question.service";
import gameGroupCompletedQuestionService from "../../services/game-group-completed-question.service";
import GameGroupCompletedQuestion from "../../models/game-group-completed-question";
import { PaginationRequest } from "../../lib/pagination";

const EVENTS_PREFIX = "game-";

export default class GameController {
  constructor(ioServer: any) {
    ioServer.on("connection", (socket) => {
      console.log(`${socket.id} connected`);
      socket.on("disconnect", () => {
        console.log(`${socket.id} disconnected`);
      });

      socket.on(`${EVENTS_PREFIX}join-group-room`, async (token) => {
        await this.broadcastUserInfo(ioServer, socket, token);
      });

      socket.on(`${EVENTS_PREFIX}broadcast-user-info`, async (token) => {
        await this.broadcastUserInfo(ioServer, socket, token);
      });

      socket.on(`${EVENTS_PREFIX}try-answer`, async (token, index, answer) => {
        await this.tryAnswer(ioServer, socket, token, index, answer);
      });
    });
    return ioServer;
  }

  private async getUserAndGroup(socket: any, token: string) {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_PRIVATE_KEY
    ).data;

    const group = await gameGroupService.findUserGroupWithMembers(decoded.id);
    if (!group) {
      socket.emit(`${EVENTS_PREFIX}group-info`, null);
      throw new SocketError("Você não tem um grupo");
    }

    const user = group.members.find(
      (member) => member.id === decoded.id
    );

    return { user, group };
  };

  private async broadcastUserInfo(ioServer: any, socket: any, token: string) {
    try {
      const { group } = await this.getUserAndGroup(socket, token);
      const groupId = group.id;
      socket.join(groupId);

      ioServer.to(groupId).emit(`${EVENTS_PREFIX}group-info`, group);
    } catch (error) {
      return handleSocketError(error, socket, EVENTS_PREFIX);
    }
  }

  private async tryAnswer(
    ioServer: any,
    socket: any,
    token: string,
    index: number,
    answer: string,
  ) {
    try {
      throw new SocketError("O concurso acabou :(");
      const { group } = await this.getUserAndGroup(socket, token);
      const groupId = group.id;
      socket.join(groupId);

      const question = await gameQuestionService.findOne({ index });
      if (!question) {
        throw new SocketError("Pergunta não encontrada");
      }
      const groupCompletedQuestions = await gameGroupCompletedQuestionService.find({
        gameGroupId: group.id,
      });
      const completedQuestions = await gameQuestionService.find({
        pagination: new PaginationRequest(1, 9999),
        filters: {
          id: groupCompletedQuestions.map(
            (groupCompletedQuestion) => groupCompletedQuestion.gameQuestionId
          ),
        }
      });

      const isFirstQuestion = index === 0;
      const currentQuestionIndex = completedQuestions.getEntities().length > 0 ? (completedQuestions.getEntities().reduce((a, b) =>
        a.index > b.index ? a : b
      ).index + 1) : 0;
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
        ) > 0.5
      ) {
        ioServer.to(groupId).emit(`${EVENTS_PREFIX}correct-answer`, {
          index,
          correct: true,
          group,
        });

        const gameGroupCompletedQuestion: GameGroupCompletedQuestion = {
          gameGroupId: group.id,
          gameQuestionId: question.id,
          createdAt: (new Date()).getTime(),
        };
        await gameGroupCompletedQuestionService.create(gameGroupCompletedQuestion);
        // await addHousePoints(user.house && user.house._id, 5);
      } else {
        socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
      }
    } catch (error) {
      return handleSocketError(error, socket, EVENTS_PREFIX);
    }
  }
}
