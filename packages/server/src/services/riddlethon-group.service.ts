import createError from "http-errors";

import AdminLog from "../models/admin-log";
import RiddlethonGroupModel from "../models/riddlethon-group";
import adminLogService from "./admin-log.service";

const MAX_MEMBERS_IN_GROUP = 3;

const riddlethonGroupService = {
  get: async () => {
    const riddlethonGroups = await RiddlethonGroupModel.find().populate(
      "members"
    );

    return riddlethonGroups;
  },
  getOne: async (id) => {
    const riddlethonGroup = await RiddlethonGroupModel.findById(id);

    if (!riddlethonGroup) {
      throw new createError.NotFound(`Não foi encontrado grupo com o id ${id}`);
    }

    return riddlethonGroup;
  },
  adminCreate: async ({ name }, adminUser) => {
    const newRiddlethonGroup = new RiddlethonGroupModel({
      name,
    });
    await newRiddlethonGroup.save();

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "create",
      collectionName: "riddlethon-group",
      objectAfter: JSON.stringify(newRiddlethonGroup),
    };
    await adminLogService.create(adminLog);

    return newRiddlethonGroup;
  },
  adminUpdate: async (id, { name }, adminUser) => {
    const groupFound = await riddlethonGroupService.getOne(id);

    const updatedRiddlethonGroup = await RiddlethonGroupModel.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "update",
      collectionName: "riddlethon-group",
      objectBefore: JSON.stringify(groupFound),
      objectAfter: JSON.stringify(updatedRiddlethonGroup),
    };
    await adminLogService.create(adminLog);

    return updatedRiddlethonGroup;
  },
  adminDelete: async (id, adminUser) => {
    const groupFound = await riddlethonGroupService.getOne(id);
    if (
      groupFound.members.length > 0 ||
      groupFound.completedQuestionsIndexes.length > 0
    ) {
      throw new createError.BadRequest();
    }

    const deletedRiddlethonGroup = await RiddlethonGroupModel.findByIdAndDelete(
      id
    );

    const adminLog: AdminLog = {
      adminId: adminUser.id,
      type: "delete",
      collectionName: "riddlethon-group",
      objectBefore: JSON.stringify(deletedRiddlethonGroup),
    };
    await adminLogService.create(adminLog);

    return deletedRiddlethonGroup;
  },
  create: async ({ name, userId }) => {
    const groupFound = await RiddlethonGroupModel.findOne({ name });
    if (groupFound) {
      throw new createError.BadRequest();
    }

    const createdGroup = new RiddlethonGroupModel({
      name,
      members: [userId],
      completedQuestionsIndexes: [],
    });
    await createdGroup.save();

    return createdGroup;
  },
  join: async (id, { userId }) => {
    const groupFound = await RiddlethonGroupModel.findById(id);
    if (
      !groupFound ||
      !groupFound.members ||
      groupFound.members.includes(userId) ||
      groupFound.members.length >= MAX_MEMBERS_IN_GROUP
    ) {
      throw new createError.BadRequest();
    }

    const joinedGroup = await RiddlethonGroupModel.findByIdAndUpdate(id, {
      $push: { members: userId },
    });

    return joinedGroup;
  },
  leave: async ({ userId }) => {
    const groupFound = await RiddlethonGroupModel.updateOne(
      { members: userId },
      {
        $pullAll: { members: [userId] },
      }
    );
    if (!groupFound) {
      throw new createError.BadRequest();
    }

    return groupFound;
  },
};

export default riddlethonGroupService;
