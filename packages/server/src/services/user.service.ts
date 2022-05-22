import createError from "http-errors";
import { ObjectId } from "mongodb";

import AchievementModel from "../models/achievement";
import EventModel from "../models/event";
import UserModel from "../models/user";
import RiddleGroupModel from "../models/riddle-group";
import HouseModel from "../models/house";

export interface UserService {
  findByStringId(id: string): Promise<any>;
  pay(id: string): Promise<void>;
}

export class User {
  public id: string;
  public email: string;

  constructor(id: string, email: string) {
    this.id = id;
    this.email = email;
  }
}

class UserServiceImpl implements UserService {
  async getUserHouse(userId) {
    const userHouse = await HouseModel.findOne({ members: userId });

    return userHouse;
  }

  async get() {
    const users = await UserModel.find();

    return users;
  }

  async getOne(id) {
    const user = await UserModel.findById(id);

    if (!user) {
      throw new createError.NotFound(
        `Não foi encontrado usuário com o id ${id}`
      );
    }

    return user;
  }

  async create(nusp, name, course, userTelegram, permission) {
    const newUser = new UserModel() as any;

    newUser._id = new ObjectId();
    newUser.nusp = nusp;
    newUser.name = name;
    newUser.course = course;
    newUser.userTelegram = userTelegram;
    newUser.permission = permission;

    await newUser.save();

    return newUser;
  }

  async update(id, nusp, name, course, userTelegram, permission) {
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
  }

  async delete(id) {
    const deletedUser = await UserModel.findByIdAndDelete(id);

    return deletedUser;
  }

  async checkAchievements() {
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
  }

  async findByStringId(id: string): Promise<any> {
    const user = await UserModel.findOne({ _id: new ObjectId(id) });

    return new User(user.id.toString(), user.email);
  }

  async pay(id: string): Promise<void> {
    await UserModel.findByIdAndUpdate(new ObjectId(id), {
      paid: true,
    })
  }
};

export default new UserServiceImpl();
