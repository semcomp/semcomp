import createError from "http-errors";
import { ObjectId } from "mongodb";

import AdminUserModel from "../models/admin-user";

const adminUserService = {
  get: async () => {
    const adminUsers = await AdminUserModel.find();

    return adminUsers;
  },
  getOne: async (id) => {
    const adminUser = await AdminUserModel.findById(id);

    if (!adminUser) {
      throw new createError.NotFound(
        `Não foi encontrado administrador com o id ${id}`
      );
    }

    return adminUser;
  },
  create: async (nusp, name, course, userTelegram, permission) => {
    const newAdminUser = new AdminUserModel() as any;

    newAdminUser._id = new ObjectId();
    newAdminUser.nusp = nusp;
    newAdminUser.name = name;
    newAdminUser.course = course;
    newAdminUser.userTelegram = userTelegram;
    newAdminUser.permission = permission;

    await newAdminUser.save();

    return newAdminUser;
  },
  update: async (id, nusp, name, course, userTelegram, permission) => {
    const updatedAdminUser = await AdminUserModel.findByIdAndUpdate(
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

    return updatedAdminUser;
  },
  delete: async (id) => {
    const deletedAdminUser = await AdminUserModel.findByIdAndDelete(id);

    return deletedAdminUser;
  },
};

export default adminUserService;
