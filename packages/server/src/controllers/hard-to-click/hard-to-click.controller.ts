import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
// import {addHousePoints} from '../../lib/add-house-points';
import { handleSocketError } from "../../lib/handle-socket-error";
import hardToClickGroupService from "../../services/hard-to-click-group.service";
import hardToClickQuestionService from "../../services/hard-to-click-question.service";
import hardToClickGroupCompletedQuestionService from "../../services/hard-to-click-group-completed-question.service";
import HardToClickGroupCompletedQuestion from "../../models/hard-to-click-group-completed-question";

const EVENTS_PREFIX = "hard-to-click-";

export default class HardToClickController {
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

    const group = await hardToClickGroupService.findUserGroupWithMembers(decoded.id);
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

      const question = await hardToClickQuestionService.findOne({ index });
      if (!question) {
        throw new SocketError("Pergunta não encontrada");
      }
      const groupCompletedQuestions = await hardToClickGroupCompletedQuestionService.find({
        hardToClickGroupId: group.id,
      });
      const completedQuestions = await hardToClickQuestionService.find({
        id: groupCompletedQuestions.map(
          (groupCompletedQuestion) => groupCompletedQuestion.hardToClickQuestionId
        ),
      });

      const isFirstQuestion = index === 0;
      const currentQuestionIndex = completedQuestions.length > 0 ? (completedQuestions.reduce((a, b) =>
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

        const hardToClickGroupCompletedQuestion: HardToClickGroupCompletedQuestion = {
          hardToClickGroupId: group.id,
          hardToClickQuestionId: question.id,
        };
        await hardToClickGroupCompletedQuestionService.create(hardToClickGroupCompletedQuestion);
        // await addHousePoints(user.house && user.house._id, 5);
      } else {
        socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
      }
    } catch (error) {
      return handleSocketError(error, socket, EVENTS_PREFIX);
    }
  }
}
