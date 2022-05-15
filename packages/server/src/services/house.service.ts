import createError from "http-errors";
import { ObjectId } from "mongodb";

import AchievementModel from "../models/achievement";
import HouseModel from "../models/house";

const houseService = {
  get: async () => {
    const houses = await HouseModel.find();

    return houses;
  },
  getOne: async (id) => {
    const house = await HouseModel.findById(id);

    if (!house) {
      throw new createError.NotFound(`Não foi encontrada casa com o id ${id}`);
    }

    return house;
  },
  create: async (name, description) => {
    const newHouse = new HouseModel() as any;

    newHouse._id = new ObjectId();
    newHouse.name = name;
    newHouse.description = description;
    newHouse.score = 0;

    await newHouse.save();

    return newHouse;
  },
  update: async (id, name, description, score) => {
    const updatedHouse = await HouseModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        score,
      },
      { new: true }
    );

    return updatedHouse;
  },
  delete: async (id) => {
    const deletedHouse = await HouseModel.findByIdAndDelete(id);

    return deletedHouse;
  },
  checkAchievements: async () => {
    const houses = await HouseModel.find();
    const houseAchievements = await AchievementModel.find({
      type: "Casa",
    }).populate("event");

    for (const house of houses) {
      for (const achievement of houseAchievements) {
        if (house.achievements.includes(achievement._id)) {
          continue;
        }

        // Presença em Evento
        if (achievement.category === "Presença em Evento") {
          let i = 0;
          for (const user of achievement.event.presentUsers) {
            if (house.members.includes(user)) {
              i++;
            }
          }
          if (i > house.members.length * (achievement.minPercentage / 100)) {
            house.achievements.push(achievement);
          }
        }

        // Número de Conquistas
        if (achievement.category === "Número de Conquistas") {
          if (house.achievements.length >= achievement.numberOfAchievements) {
            house.achievements.push(achievement);
          }
        }
      }
      await house.save();
    }
  },
};

export default houseService;
