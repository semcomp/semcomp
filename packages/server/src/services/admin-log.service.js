const createError = require("http-errors");
const ObjectId = require("mongodb").ObjectID;

const AdminLogModel = require("../models/admin-log");

const adminLogService = {
  get: async () => {
    const adminLogs = await AdminLogModel.find();

    return adminLogs;
  },
  getOne: async (id) => {
    const adminLog = await AdminLogModel.findById(id);

    if (!adminLog) {
      throw new createError.NotFound(`Não foi encontrado log com o id ${id}`);
    }

    return adminLog;
  },
  create: async (user, type, collectionName, objectBefore, objectAfter) => {
    const newAdminLog = new AdminLogModel();

    newAdminLog._id = new ObjectId();
    newAdminLog.user = user;
    newAdminLog.type = type;
    newAdminLog.collectionName = collectionName;
    newAdminLog.objectBefore = objectBefore;
    newAdminLog.objectAfter = objectAfter;

    await newAdminLog.save();

    return newAdminLog;
  },
  update: async (id, user, type, collectionName, objectBefore, objectAfter) => {
    const updatedAdminLog = await AdminLogModel.findByIdAndUpdate(
      id,
      {
        user,
        type,
        collectionName,
        objectBefore,
        objectAfter,
      },
      { new: true }
    );

    return updatedAdminLog;
  },
  delete: async (id) => {
    const deletedAdminLog = await AdminLogModel.findByIdAndDelete(id);

    return deletedAdminLog;
  },
};

module.exports = adminLogService;
