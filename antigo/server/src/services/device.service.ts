import createError from "http-errors";
import { ObjectId } from "mongodb";

import DeviceModel from "../models/device";

const deviceService = {
  get: async () => {
    const devices = await DeviceModel.find();

    return devices;
  },
  getOne: async (id) => {
    const device = await DeviceModel.findById(id);

    if (!device) {
      throw new createError.NotFound(
        `Não foi encontrada dispositivo com o id ${id}`
      );
    }

    return device;
  },
  create: async (token, user) => {
    const newDevice = new DeviceModel() as any;

    newDevice._id = new ObjectId();
    newDevice.token = token;
    newDevice.user = user;

    await newDevice.save();

    return newDevice;
  },
  update: async (id, token, user) => {
    const updatedDevice = await DeviceModel.findByIdAndUpdate(
      id,
      {
        token,
        user,
      },
      { new: true }
    );

    return updatedDevice;
  },
  delete: async (id) => {
    const deletedDevice = await DeviceModel.findByIdAndDelete(id);

    return deletedDevice;
  },
};

export default deviceService;
