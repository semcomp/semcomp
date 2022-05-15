import jwt from "jsonwebtoken";
import stringSimilarity from "string-similarity";

import RiddleGroupModel from "../../models/riddle-group";
import RiddleQuestionModel from "../../models/riddle-question";

import { SocketError } from "../../lib/socket-error";
import { normalizeString } from "../../lib/normalize-string";
import {
  getRiddleGroupQuestion,
} from "../../lib/get-riddle-group-question";
import { handleSocketError } from "../../lib/handle-socket-error";

const EVENTS_PREFIX = "riddle-";

/**
 * joinGroupRoom
 *
 * @param {object} socket
 * @param {string} token
 *
 * @return {object}
 */
async function getUserAndGroup(socket, token) {
  const decoded = jwt.verify(
    token.replace("Bearer ", ""),
    process.env.JWT_PRIVATE_KEY
  ).data;
  const group = await RiddleGroupModel.findOne({
    members: decoded.id,
  }).populate("members");
  if (!group) {
    socket.emit(`${EVENTS_PREFIX}group-info`, null);
    throw new SocketError("Você não tem um grupo");
  }
  const user = group.members.find(
    (member) => member._id.toString() === decoded.id
  );

  return { user, group };
}

/**
 * joinGroupRoom
 *
 * @param {object} ioServer
 * @param {object} socket
 * @param {string} token
 *
 * @return {object}
 */
async function joinGroupRoom(ioServer, socket, token) {
  try {
    const { group } = await getUserAndGroup(socket, token);
    const groupId = group._id.toString();
    socket.join(groupId);

    ioServer.to(groupId).emit(`${EVENTS_PREFIX}group-info`, group);
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

/**
 * broadcastUserInfo
 *
 * @param {object} ioServer
 * @param {object} socket
 * @param {string} token
 *
 * @return {object}
 */
async function broadcastUserInfo(ioServer, socket, token) {
  try {
    const { group } = await getUserAndGroup(socket, token);
    const groupId = group._id.toString();
    socket.join(groupId);

    ioServer.to(groupId).emit(`${EVENTS_PREFIX}group-info`, group);
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

/**
 * tryAnswer
 *
 * @param {object} ioServer
 * @param {object} socket
 * @param {string} token
 * @param {number} index
 * @param {string} answer
 *
 * @return {object}
 */
async function tryAnswer(ioServer, socket, token, index, answer) {
  try {
    const { group } = await getUserAndGroup(socket, token);
    const groupId = group._id.toString();
    socket.join(groupId);

    const questionFound = await RiddleQuestionModel.findOne({ index });
    if (!questionFound) {
      throw new SocketError("Pergunta não encontrada");
    }

    const groupQuestionInfo = getRiddleGroupQuestion(group, index);
    if (!groupQuestionInfo.isQuestionInProgress) {
      throw new SocketError("A pergunta já foi respondida");
    }

    if (
      stringSimilarity.compareTwoStrings(
        normalizeString(answer),
        normalizeString(questionFound.answer)
      ) > 0.8
    ) {
      group.completedQuestionsIndexes.push({ index, createdAt: Date.now() });
      if (questionFound.isLegendary) {
        if (Math.random() < 0.7) {
          group.availableClues = group.availableClues + 1;
        } else {
          group.availableSkips = group.availableSkips + 1;
        }
      }
      await group.save();
      await ioServer.to(groupId).emit(`${EVENTS_PREFIX}correct-answer`, {
        index,
        correct: true,
        group,
      });
    } else {
      socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
    }
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

/**
 * useClue
 *
 * @param {object} ioServer
 * @param {object} socket
 * @param {string} token
 * @param {number} index
 * @param {string} answer
 *
 * @return {object}
 */
async function useClue(ioServer, socket, token, index, answer) {
  try {
    const { group } = await getUserAndGroup(socket, token);
    const groupId = group._id.toString();
    socket.join(groupId);

    if (group.availableClues < 1) {
      throw new SocketError("Sem dicas disponíveis");
    }

    const groupQuestionInfo = getRiddleGroupQuestion(group, 0);

    const questionFound = await RiddleQuestionModel.findOne({
      index: groupQuestionInfo.currentQuestionIndex,
    });
    if (!questionFound) {
      throw new SocketError("Pergunta não encontrada");
    }
    if (questionFound.isLegendary) {
      throw new SocketError("Não é possível usar dica em pergunta lendária");
    }

    group.availableClues -= 1;
    group.usedClueIndexes.push(groupQuestionInfo.currentQuestionIndex);
    await group.save();

    await ioServer.to(groupId).emit(`${EVENTS_PREFIX}item-used`, group);
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

/**
 * useSkip
 *
 * @param {object} ioServer
 * @param {object} socket
 * @param {string} token
 * @param {number} index
 * @param {string} answer
 *
 * @return {object}
 */
async function useSkip(ioServer, socket, token, index, answer) {
  try {
    const { group } = await getUserAndGroup(socket, token);
    const groupId = group._id.toString();
    socket.join(groupId);

    const groupQuestionInfo = getRiddleGroupQuestion(group, 0);

    const questionFound = await RiddleQuestionModel.findOne({
      index: groupQuestionInfo.currentQuestionIndex,
    });
    if (!questionFound) {
      throw new SocketError("Pergunta não encontrada");
    }

    if (!questionFound.isLegendary && group.availableSkips < 1) {
      throw new SocketError("Sem pulos disponíveis");
    }

    if (!questionFound.isLegendary) {
      group.availableSkips -= 1;
    }
    group.usedSkipIndexes.push(groupQuestionInfo.currentQuestionIndex);
    group.completedQuestionsIndexes.push({
      index: groupQuestionInfo.currentQuestionIndex,
      createdAt: Date.now(),
    });
    await group.save();

    await ioServer.to(groupId).emit(`${EVENTS_PREFIX}item-used`, group);
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

export const riddleController = (ioServer) => {
  ioServer.on("connection", (socket) => {
    console.log(`${socket.id} connected`);
    socket.on("disconnect", () => {
      console.log(`${socket.id} disconnected`);
    });

    socket.on(`${EVENTS_PREFIX}join-group-room`, async (token) => {
      await joinGroupRoom(ioServer, socket, token);
    });

    socket.on(`${EVENTS_PREFIX}broadcast-user-info`, async (token) => {
      await broadcastUserInfo(ioServer, socket, token);
    });

    socket.on(`${EVENTS_PREFIX}try-answer`, async (token, index, answer) => {
      await tryAnswer(ioServer, socket, token, index, answer);
    });

    socket.on(`${EVENTS_PREFIX}use-clue`, async (token, index, answer) => {
      await useClue(ioServer, socket, token, index, answer);
    });

    socket.on(`${EVENTS_PREFIX}use-skip`, async (token, index, answer) => {
      await useSkip(ioServer, socket, token, index, answer);
    });
  });
  return ioServer;
};
