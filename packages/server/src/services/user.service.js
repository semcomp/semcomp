const createError = require("http-errors");
const ObjectId = require("mongodb").ObjectID;

const AchievementModel = require("../models/achievement");
const EventModel = require("../models/event");
const UserModel = require("../models/user");
const RiddleGroupModel = require("../models/riddle-group");
const HouseModel = require("../models/house");

const userService = {
  getUserHouse: async (userId) => {
    const userHouse = await HouseModel.findOne({ members: userId });

    return userHouse;
  },
  get: async () => {
    const users = await UserModel.find();

    return users;
  },
  getOne: async (id) => {
    const user = await UserModel.findById(id);

    if (!user) {
      throw new createError.NotFound(
        `Não foi encontrado usuário com o id ${id}`
      );
    }

    return user;
  },
  create: async (nusp, name, course, userTelegram, permission) => {
    const newUser = new UserModel();

    newUser._id = new ObjectId();
    newUser.nusp = nusp;
    newUser.name = name;
    newUser.course = course;
    newUser.userTelegram = userTelegram;
    newUser.permission = permission;

    await newUser.save();

    return newUser;
  },
  update: async (id, nusp, name, course, userTelegram, permission) => {
    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        nusp,
        name,
        course,
        userTelegram,
        permission,
      },
      { new: true }
    );

    return updatedUser;
  },
  delete: async (id) => {
    const deletedUser = await UserModel.findByIdAndDelete(id);

    return deletedUser;
  },
  checkAchievements: async () => {
    const users = await UserModel.find();
    const events = await EventModel.find();
    const riddleGroups = await RiddleGroupModel.find();
    const userAchievements = await AchievementModel.find({
      type: "Individual",
    }).populate("event");

    for (const user of users) {
      for (const achievement of userAchievements) {
        if (user.achievements.includes(achievement._id)) {
          continue;
        }

        // Presença em Evento
        if (achievement.category === "Presença em Evento") {
          if (achievement.event.presentUsers.includes(user._id)) {
            user.achievements.push(achievement);
          }
          if (achievement.title === "Então você gosta de enigmas?") {
            for (const group of riddleGroups) {
              if (group.members.includes(user._id)) {
                user.achievements.push(achievement);
              }
            }
          }
        }

        // Presença em Tipo de Evento
        if (achievement.category === "Presença em Tipo de Evento") {
          let i = 0;
          for (const event of events) {
            if (
              event.type === achievement.eventType &&
              event.presentUsers.includes(user._id)
            ) {
              i++;
            }
          }

          if (i >= achievement.numberOfPresences) {
            user.achievements.push(achievement);
          }
        }

        // Número de Conquistas
        if (achievement.category === "Número de Conquistas") {
          if (user.achievements.length >= achievement.numberOfAchievements) {
            user.achievements.push(achievement);
          }
        }
      }
      await user.save();
    }
  },
};

module.exports = userService;
