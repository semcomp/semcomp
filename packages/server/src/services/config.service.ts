import createError from "http-errors";
import { ObjectId } from "mongodb";

import ConfigModel, { Config } from "../models/config";
import { set } from "mongoose";

const ConfigService = {
  get: async () => {
    const config = await ConfigModel.find();

    return config;
  },
  getOne: async () => {
    const config = await ConfigModel.findOne();
    return config;
  },
  update: async (config: Config) => {
    config.updatedAt = Date.now();
    const entity = await ConfigModel.findOneAndUpdate({ id: config.id }, config);

    return entity;
  },
  create: async (config: Config) => {
    const newConfig = new ConfigModel() as any;

    newConfig._id = new ObjectId();
    newConfig.coffeeTotal = config.coffeeTotal;
    newConfig.switchBeta = config.switchBeta;
    newConfig.showLogin = config.showLogin;

    await newConfig.save();

    return newConfig;
  },

  delete: async (id: string) => {
    const deletedConfig = await ConfigModel.findByIdAndDelete(id);

    return deletedConfig;
  },
  setSwitchBeta: async (switchBeta: boolean) => {
    const config = await ConfigModel.findOne();
    config.switchBeta = switchBeta;
    await config.save();

    return config;
  },
  setOpenSales: async (setOpenSales: boolean) => {
    const config = await ConfigModel.findOne();
    config.openSales = setOpenSales;
    await config.save();

    return config;
  },
  setOpenSignup: async (setOpenSignup: boolean) => {
    const config = await ConfigModel.findOne();
    config.openSignup = setOpenSignup;
    await config.save();

    return config;
  },
  setShowLogin: async (showLogin: boolean) => {
    const config = await ConfigModel.findOne();
    config.showLogin = showLogin;
    await config.save();

    return config;
  },
  setCoffeeTotal: async (coffeeTotal: number) => {
    const config = await ConfigModel.findOne();
    config.coffeeTotal = coffeeTotal;
    await config.save();

    return config;
  },
  setOpenAchievement: async (openAchievement: boolean) => {
    const config = await ConfigModel.findOne();
    config.openAchievement = openAchievement;
    await config.save();

    return config;
  }
};

export default ConfigService;
