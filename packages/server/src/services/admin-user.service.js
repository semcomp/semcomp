const createError = require("http-errors");
const ObjectId = require("mongodb").ObjectID;

const AdminUserModel = require("../models/admin-user");

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
    const newAdminUser = new AdminUserModel();

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

module.exports = adminUserService;
