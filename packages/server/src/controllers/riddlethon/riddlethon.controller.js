const jwt = require("jsonwebtoken");
const stringSimilarity = require("string-similarity");

const RiddlethonGroupModel = require("../../models/riddlethon-group");
const RiddlethonQuestionModel = require("../../models/riddlethon-question");

const { SocketError } = require("../../lib/socket-error");
const { normalizeString } = require("../../lib/normalize-string");
// const {addHousePoints} = require('../../lib/add-house-points');
const { handleSocketError } = require("../../lib/handle-socket-error");

const EVENTS_PREFIX = "riddlethon-";

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
  const group = await RiddlethonGroupModel.findOne({
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

    const questionFound = await RiddlethonQuestionModel.findOne({ index });
    if (!questionFound) {
      throw new SocketError("Pergunta não encontrada");
    }
    const completedQuestionsIndexes = group.completedQuestionsIndexes;

    const isFirstQuestion = index === 0;
    const currentQuestionIndex = completedQuestionsIndexes.reduce((a, b) =>
      a.index > b.index ? a : b
    ).index;
    const isQuestionCompleted = currentQuestionIndex >= index;
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
        normalizeString(questionFound.answer)
      ) > 0.5
    ) {
      ioServer.to(groupId).emit(`${EVENTS_PREFIX}correct-answer`, {
        index,
        correct: true,
        group,
      });
      await RiddlethonGroupModel.findByIdAndUpdate(group._id, {
        $push: { completedQuestionsIndexes: { index, createdAt: Date.now() } },
      });
      // await addHousePoints(user.house && user.house._id, 5);
    } else {
      socket.emit(`${EVENTS_PREFIX}correct-answer`, { index, correct: false });
    }
  } catch (error) {
    return handleSocketError(error, socket, EVENTS_PREFIX);
  }
}

module.exports.riddlethonController = (ioServer) => {
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
  });
  return ioServer;
};
