const createError = require("http-errors");

const AdminLog = require("../models/admin-log");
const RiddlethonGroupModel = require("../models/riddlethon-group");

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

    await AdminLog({
      user: req.adminUser,
      type: "create",
      collectionName: "riddlethon-group",
      objectAfter: JSON.stringify(newRiddlethonGroup),
    }).save();

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

    await AdminLog({
      user: req.adminUser,
      type: "update",
      collectionName: "riddlethon-group",
      objectBefore: JSON.stringify(groupFound),
      objectAfter: JSON.stringify(updatedRiddlethonGroup),
    }).save();

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

    await AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "riddlethon-group",
      objectBefore: JSON.stringify(groupDeleted),
    }).save();

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

module.exports = riddlethonGroupService;
