import HardToClickGroupModel from "../../models/hard-to-click-group";
import AdminLog from "../../models/admin-log";

import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";

export const list = async (req, res) => {
  const groupsFound = await HardToClickGroupModel.find().populate("members");

  return res.status(200).json(groupsFound);
};

export const get = async (req, res) => {
  try {
    const { id } = req.params;

    const groupFound = await HardToClickGroupModel.findById(id).populate(
      "members"
    );
    if (!groupFound) {
      throw new HttpError(404, ["Grupo não encontrado."]);
    }

    return res.status(200).json(groupFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};

export const deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    const groupFound = await HardToClickGroupModel.findById(id);
    if (!groupFound) {
      throw new HttpError(404, ["Grupo não encontrado."]);
    }
    if (
      groupFound.members.length > 0 ||
      groupFound.completedQuestionsIndexes.length > 0
    ) {
      throw new HttpError(400, ["Grupo com progresso."]);
    }

    await HardToClickGroupModel.findByIdAndDelete(id);

    const adminLog: AdminLog = {
      adminId: req.adminUser.id,
      type: "delete",
      collectionName: "hard-to-click-group",
      objectBefore: JSON.stringify(groupFound),
    };
    await adminLogService.create(adminLog);

    return res.status(200).send(groupFound);
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
