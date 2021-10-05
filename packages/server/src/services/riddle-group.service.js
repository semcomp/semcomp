const createError = require("http-errors");

const AdminLog = require("../models/admin-log");
const RiddleGroupModel = require("../models/riddle-group");

const MAX_MEMBERS_IN_GROUP = 1;

const riddleGroupService = {
  get: async () => {
    const riddleGroups = await RiddleGroupModel.find().populate("members");

    return riddleGroups;
  },
  getOne: async (id) => {
    const riddleGroup = await RiddleGroupModel.findById(id);

    if (!riddleGroup) {
      throw new createError.NotFound(`Não foi encontrado grupo com o id ${id}`);
    }

    return riddleGroup;
  },
  adminCreate: async ({ name }, adminUser) => {
    const newRiddleGroup = new RiddleGroupModel({
      name,
    });
    await newRiddleGroup.save();

    await AdminLog({
      user: adminUser,
      type: "create",
      collectionName: "riddle-group",
      objectAfter: JSON.stringify(newRiddleGroup),
    }).save();

    return newRiddleGroup;
  },
  adminUpdate: async (id, { name }, adminUser) => {
    const groupFound = await riddleGroupService.getOne(id);

    const updatedRiddleGroup = await RiddleGroupModel.findByIdAndUpdate(
      id,
      {
        name,
      },
      { new: true }
    );

    await AdminLog({
      user: adminUser,
      type: "update",
      collectionName: "riddle-group",
      objectBefore: JSON.stringify(groupFound),
      objectAfter: JSON.stringify(updatedRiddleGroup),
    }).save();

    return updatedRiddleGroup;
  },
  adminDelete: async (id, adminUser) => {
    const groupFound = await riddleGroupService.getOne(id);

    const deletedRiddleGroup = await RiddleGroupModel.findByIdAndDelete(id);

    await AdminLog({
      user: adminUser,
      type: "delete",
      collectionName: "riddle-group",
      objectBefore: JSON.stringify(groupFound),
      objectAfter: JSON.stringify(deletedRiddleGroup),
    }).save();

    return deletedRiddleGroup;
  },
  create: async ({ name, userId }) => {
    const groupFound = await RiddleGroupModel.findOne({ name: userId });
    if (groupFound) {
      throw new createError.BadRequest();
    }

    const createdGroup = new RiddleGroupModel({
      name: userId,
      members: [userId],
      completedQuestionsIndexes: [],
    });
    await createdGroup.save();

    return createdGroup;
  },
  join: async (id, { userId }) => {
    const groupFound = await RiddleGroupModel.findById(id);
    if (
      !groupFound ||
      !groupFound.members ||
      groupFound.members.includes(userId) ||
      groupFound.members.length >= MAX_MEMBERS_IN_GROUP
    ) {
      throw new createError.BadRequest();
    }

    const joinedGroup = await RiddleGroupModel.findByIdAndUpdate(id, {
      $push: { members: userId },
    });

    return joinedGroup;
  },
  leave: async ({ userId }) => {
    const groupFound = await RiddleGroupModel.findOneAndUpdate(
      { members: userId },
      {
        $pullAll: { members: [userId] },
      },
      { new: true }
    );
    if (!groupFound) {
      throw new createError.BadRequest();
    }
    if (groupFound.members.length === 0) {
      await RiddleGroupModel.findByIdAndDelete(groupFound._id);
    }

    return groupFound;
  },
};

module.exports = riddleGroupService;
