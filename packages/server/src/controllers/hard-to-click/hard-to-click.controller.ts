import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import HardToClickGroupModel from "../../models/hard-to-click-group";
import HardToClickQuestionModel from "../../models/hard-to-click-question";
import MessageModel from "../../models/message";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
import { addHousePoints } from "../../lib/add-house-points";

const EVENTS_PREFIX = "hard-to-click-";
const END_DATE = new Date("2021-06-19 15:00");

const getUserAndGroup = async (token, socket) => {
  const decoded = jwt.verify(
    token.replace("Bearer ", ""),
    process.env.JWT_PRIVATE_KEY
  ).data;
  const group = await HardToClickGroupModel.findOne({ members: decoded.id })
    .populate("members")
    .populate("members.house");
  if (!group) {
    socket.emit(`${EVENTS_PREFIX}group-info`, null);
    throw new SocketError("Você não tem um grupo");
  }
  const user = group.members.find(
    (member) => member._id.toString() === decoded.id
  );

  return { user, group };
};

/**
 * joinGroupRoom
 *
 * @param {object} socket
 * @param {object} ioServer
 * @param {string} token
 *
 * @return {object}
 */
async function joinGroupRoom(socket, ioServer, token) {
  try {
    const { user, group } = await getUserAndGroup(token, socket);
    const groupId = group._id.toString();
    socket.join(groupId);

    socket.emit(
      `${EVENTS_PREFIX}message`,
      `Você entrou na sala do grupo ${group.name}`
    );

    socket.broadcast
      .to(groupId)
      .emit(`${EVENTS_PREFIX}message`, `${user.name} entrou na sala`);

    ioServer.to(groupId).emit(`${EVENTS_PREFIX}group-info`, group);
  } catch (e) {
    if (e.message) {
      return socket.emit(`${EVENTS_PREFIX}error-message`, e.message);
    }
    return socket.emit(`${EVENTS_PREFIX}error-message`, "Erro de conexão");
  }
}

/**
 * broadcastUserInfo
 *
 * @param {object} socket
 * @param {object} ioServer
 * @param {string} token
 *
 * @return {object}
 */
async function broadcastUserInfo(socket, ioServer, token) {
  try {
    const { user, group } = await getUserAndGroup(token, socket);
    const groupId = group._id.toString();
    socket.join(groupId);

    socket.broadcast.emit(
      `${EVENTS_PREFIX}message`,
      `${user.name} entrou na sala`
    );

    ioServer.to(groupId).emit(`${EVENTS_PREFIX}group-info`, group);
  } catch (e) {
    if (e.message) {
      return socket.emit(`${EVENTS_PREFIX}error-message`, e.message);
    }
    return socket.emit(`${EVENTS_PREFIX}error-message`, "Erro de conexão");
  }
}

/**
 * chatMessage
 *
 * @param {object} socket
 * @param {object} ioServer
 * @param {string} token
 * @param {string} text
 *
 * @return {object}
 */
async function chatMessage(socket, ioServer, token, text) {
  try {
    const { user, group } = await getUserAndGroup(token, socket);
    const groupId = group._id.toString();
    socket.join(groupId);

    const message = {
      text,
      user: user._id,
      group: group._id,
    };
    const createdMessage = new MessageModel(message) as any;
    createdMessage.save();

    ioServer
      .to(groupId)
      .emit(`${EVENTS_PREFIX}chat-message`, { ...createdMessage._doc, user });
  } catch (e) {
    if (e.message) {
      return socket.emit(`${EVENTS_PREFIX}error-message`, e.message);
    }
    return socket.emit(`${EVENTS_PREFIX}error-message`, "Erro de conexão");
  }
}

/**
 * tryAnswer
 *
 * @param {object} socket
 * @param {object} ioServer
 * @param {string} token
 * @param {number} index
 * @param {string} answer
 *
 * @return {object}
 */
async function tryAnswer(socket, ioServer, token, index, answer) {
  try {
    const { user, group } = await getUserAndGroup(token, socket);
    const groupId = group._id.toString();
    socket.join(groupId);

    const questionFound = await HardToClickQuestionModel.findOne({ index });
    if (!questionFound) {
      throw new SocketError("Pergunta não encontrada");
    }
    const completedQuestions = group.completedQuestionsIndexes;

    const isFirstQuestion = +index === 0 && completedQuestions.length === 0;
    const actualQuestion = completedQuestions.length;
    const isQuestionCompleted = actualQuestion > +index;
    const isQuestionInProgress = actualQuestion === +index;
    if (isQuestionCompleted && !isFirstQuestion) {
      throw new SocketError("A pergunta já foi respondida");
    }
    if (
      (!isQuestionInProgress && !isFirstQuestion) ||
      group.completedQuestionsIndexes.find(
        (question) => question.index === index
      )
    ) {
      throw new SocketError("Um erro ocorreu");
    }
    if (new Date() > END_DATE) {
      throw new SocketError("O evento terminou");
    }

    if (
      stringSimilarity.compareTwoStrings(
        normalizeString(answer),
        normalizeString(questionFound.answer)
      ) > 0.5
    ) {
      ioServer.to(groupId).emit(`${EVENTS_PREFIX}correct-answer`, {
        index,
        correct: true,
        group,
      });
      await HardToClickGroupModel.findByIdAndUpdate(group._id, {
        $push: { completedQuestionsIndexes: { index, createdAt: Date.now() } },
      });
      await addHousePoints(user.house && user.house._id, 5);
    } else {
      socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
    }
  } catch (e) {
    if (e.message) {
      return socket.emit(`${EVENTS_PREFIX}error-message`, e.message);
    }
    return socket.emit(`${EVENTS_PREFIX}error-message`, "Erro de conexão");
  }
}

export const hardToClickController = (ioServer) => {
  ioServer.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    socket.on(`${EVENTS_PREFIX}join-group-room`, async (token) => {
      await joinGroupRoom(socket, ioServer, token);
    });

    socket.on(`${EVENTS_PREFIX}broadcast-user-info`, async (token) => {
      await broadcastUserInfo(socket, ioServer, token);
    });

    socket.on(`${EVENTS_PREFIX}chat-message`, async (token, text) => {
      await chatMessage(socket, ioServer, token, text);
    });

    socket.on(`${EVENTS_PREFIX}try-answer`, async (token, index, answer) => {
      await tryAnswer(socket, ioServer, token, index, answer);
    });
  });
  return ioServer;
};
