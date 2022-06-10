import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
// import {addHousePoints} from '../../lib/add-house-points';
import { handleSocketError } from "../../lib/handle-socket-error";
import riddlethonGroupService from "../../services/riddlethon-group.service";
import riddlethonQuestionService from "../../services/riddlethon-question.service";
import riddlethonGroupCompletedQuestionService from "../../services/riddlethon-group-completed-question.service";
import RiddlethonGroupCompletedQuestion from "../../models/riddlethon-group-completed-question";

const EVENTS_PREFIX = "riddlethon-";

export default class RiddlethonController {
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

    const group = await riddlethonGroupService.findUserGroupWithMembers(decoded.id);
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
      const { group } = await this.getUserAndGroup(socket, token);
      const groupId = group.id;
      socket.join(groupId);

      const question = await riddlethonQuestionService.findOne({ index });
      if (!question) {
        throw new SocketError("Pergunta não encontrada");
      }
      const groupCompletedQuestions = await riddlethonGroupCompletedQuestionService.find({
        riddlethonGroupId: group.id,
      });
      const completedQuestions = await riddlethonQuestionService.find({
        id: groupCompletedQuestions.map(
          (groupCompletedQuestion) => groupCompletedQuestion.riddlethonQuestionId
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

        const riddlethonGroupCompletedQuestion: RiddlethonGroupCompletedQuestion = {
          riddlethonGroupId: group.id,
          riddlethonQuestionId: question.id,
        };
        await riddlethonGroupCompletedQuestionService.create(riddlethonGroupCompletedQuestion);
        // await addHousePoints(user.house && user.house._id, 5);
      } else {
        socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
      }
    } catch (error) {
      return handleSocketError(error, socket, EVENTS_PREFIX);
    }
  }
}
