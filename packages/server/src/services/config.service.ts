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
    console.log('GETONE; ', config);
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

  delete: async (id) => {
    const deletedConfig = await ConfigModel.findByIdAndDelete(id);

    return deletedConfig;
  },
  setSwitchBeta: async (switchBeta) => {
    const config = await ConfigModel.findOne();
    config.switchBeta = switchBeta;
    await config.save();

    return config;
  },
  setOpenSignup: async (setOpenSignup) => {
    const config = await ConfigModel.findOne();
    config.openSignup = setOpenSignup;
    await config.save();

    return config;
  },
  setShowLogin: async (showLogin) => {
    const config = await ConfigModel.findOne();
    config.showLogin = showLogin;
    await config.save();

    return config;
  },
  setCoffeeTotal: async (coffeeTotal) => {
    const config = await ConfigModel.findOne();
    config.coffeeTotal = coffeeTotal;
    await config.save();

    return config;
  }
};

export default ConfigService;
