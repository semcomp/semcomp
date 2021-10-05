const HardToClickGroupModel = require("../../models/hard-to-click-group");
const AdminLog = require("../../models/admin-log");

const { HttpError } = require("../../lib/http-error");

module.exports.list = async (req, res) => {
  const groupsFound = await HardToClickGroupModel.find().populate("members");

  return res.status(200).json(groupsFound);
};

module.exports.get = async (req, res) => {
  try {
    const { id } = req.params;

    const groupFound = await HardToClickGroupModel.findById(id).populate(
      "members"
    );
    if (!groupFound) {
      throw new HttpError(404);
    }

    return res.status(200).json(groupFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const groupFound = await HardToClickGroupModel.findById(id);
    if (!groupFound) {
      throw new HttpError(404);
    }
    if (
      groupFound.members.length > 0 ||
      groupFound.completedQuestionsIndexes.length > 0
    ) {
      throw new HttpError(400);
    }

    await HardToClickGroupModel.findByIdAndDelete(id);

    await AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "hard-to-click-group",
      objectBefore: JSON.stringify(groupFound),
    }).save();

    return res.status(200).send(groupFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
