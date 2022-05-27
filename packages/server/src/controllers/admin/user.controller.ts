import AchievementModel from "../../models/achievement";
import UserModel from "../../models/user";
import HouseModel from "../../models/house";
import AdminLog from "../../models/admin-log";

import HttpError from "../../lib/http-error";
import eventService from "../../services/event.service";
import attendanceService from "../../services/attendance.service";

export const list = async (req, res) => {
  const usersFound = await UserModel.find({}, "-password").populate(
    "achievements"
  );
  const housesFound = await HouseModel.find();

  const users = [];
  for (const user of usersFound) {
    let userHouse = "Não possui";
    for (const house of housesFound) {
      if (house.members.includes(user._id.toString())) {
        userHouse = house.name;
      }
    }
    users.push({
      ...user._doc,
      house: {
        name: userHouse,
      },
    });
  }

  return res.status(200).json({
    users,
  });
};

export const listForEnterprise = async (req, res) => {
  const usersFound = await UserModel.find(
    { permission: true },
    "-_id name email course userTelegram"
  );

  return res.status(200).json(usersFound);
};

export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const userFound = await UserModel.findById(id);
    if (!userFound) {
      throw new HttpError(404, ["Usuário não encontrado."]);
    }

    return res.status(200).json(userFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const getAttendance = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await UserModel.findById(
      userId,
      "name email nusp course userTelegram"
    );
    if (!user) {
      throw new HttpError(404, ["Usuário não encontrado."]);
    }

    const attendedEvents = await attendanceService.find(
      {
        userId,
      }
    );

    console.log(attendedEvents);

    const totalNumEvents = await eventService.count();
    let attendancePercent = 100 * (attendedEvents.length / totalNumEvents);
    attendancePercent = Math.round(attendancePercent * 100) / 100; // truncate to precision 2

    return res.status(200).json({ attendancePercent, attendedEvents, user });
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const addUserAchievement = async (req, res) => {
  try {
    const { userId, achievementId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new HttpError(404, ["Usuário não encontrado."]);
    }
    const achievement = await AchievementModel.findOne({
      _id: achievementId,
      type: "Individual",
    });
    if (!achievement) {
      throw new HttpError(404, ["Conquista não encontrado."]);
    }

    if (user.achievements.includes(achievement._id)) {
      throw new HttpError(400, ["Conquista já completa."]);
    }

    user.achievements.push(achievement);

    await user.save();

    return res.status(200).send(user);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

    // self-invoking anonymous function. Returns the object it receives as argument
    const filteredBody = (({ nusp, email, name, password, course }) => ({
      nusp,
      email,
      name,
      password,
      course,
    }))(req.body);

    const newInfo = Object.keys(filteredBody).reduce((acc, key) => {
      const obj = acc;
      if (filteredBody[key] !== undefined) {
        obj[key] = filteredBody[key];
      }
      return obj;
    }, {});

    const updatedUser = await UserModel.findByIdAndUpdate(id, {
      $set: newInfo,
    });

    await (new AdminLog({
      user: req.adminUser,
      type: "update",
      collectionName: "user",
      objectAfter: JSON.stringify(updatedUser),
    })).save();

    return res.status(200).send(updatedUser);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const userFound = await UserModel.findById(id);
    if (!userFound) {
      throw new HttpError(404, ["Usuário não encontrado."]);
    }

    await UserModel.findByIdAndDelete(id);

    await (new AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "user",
      objectBefore: JSON.stringify(userFound),
    })).save();

    return res.status(200).send(userFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
