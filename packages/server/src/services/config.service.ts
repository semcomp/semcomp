import createError from "http-errors";
import { ObjectId } from "mongodb";

import ConfigModel, { Config } from "../models/config";
import { set } from "mongoose";

const ConfigService = {
  get: async () => {
    const config = await ConfigModel.find();

    return config;
  },
  getOne: async (id) => {
    const config = await ConfigModel.findById(id);

    if (!config) {
      throw new createError.NotFound(
        `Não foi encontrada configuração com o id ${id}`
      );
    }

    return config;
  },
  update: async (event: Config) => {
    event.updatedAt = Date.now();
    const entity = await ConfigModel.findOneAndUpdate({ id: event.id }, event);

    return ConfigService.getOne(entity.id);
  },
  create: async (event: Config) => {
    const newConfig = new ConfigModel() as any;

    newConfig._id = new ObjectId();
    newConfig.coffeeQuantity = event.coffeeQuantity;
    newConfig.switchBeta = event.switchBeta;
    newConfig.showLogin = event.showLogin;

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
  setOpenSingup: async (setOpenSingup) => {
    const config = await ConfigModel.findOne();
    config.setOpenSingup = setOpenSingup;
    await config.save();

    return config;
  },
  setShowLogin: async (showLogin) => {
    const config = await ConfigModel.findOne();
    config.showLogin = showLogin;
    await config.save();

    return config;
  },
  setCoffeeQuantity: async (coffeeQuantity) => {
    const config = await ConfigModel.findOne();
    config.coffeeQuantity = coffeeQuantity;
    await config.save();

    return config;
  }
};

export default ConfigService;
