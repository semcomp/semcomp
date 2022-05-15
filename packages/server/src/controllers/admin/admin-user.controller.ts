import createError from "http-errors";

import AdminUserModel from "../../models/admin-user";
import AdminLog from "../../models/admin-log";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";

export const list = async (req, res, next) => {
  try {
    const adminUsers = await AdminUserModel.find({}, "-password");

    return res.status(200).json({
      adminUsers,
    });
  } catch (error) {
    console.log(error);

    if (!(error instanceof createError.HttpError)) {
      error = new createError.InternalServerError("Erro no servidor.");
    }

    return next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    handleValidationResult(req);

    const { email, password, adminRole } = req.body;

    const foundUser = await AdminUserModel.findOne({ email });
    if (foundUser) {
      throw new createError.Unauthorized();
    }

    const createdUser = new AdminUserModel({
      email,
      password,
      adminRole,
    });
    await createdUser.save();

    await (new AdminLog({
      user: req.adminUser,
      type: "create",
      collectionName: "admin-user",
      objectAfter: JSON.stringify(createdUser),
    })).save();

    return res.status(200).json(createdUser);
  } catch (error) {
    console.log(error);

    if (!(error instanceof createError.HttpError)) {
      error = new createError.InternalServerError("Erro no servidor.");
    }

    return next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const { id } = req.params;

    // self-invoking anonymous function. Returns the object it receives as argument
    const filteredBody = (({ email, password, adminRole }) => ({
      email,
      password,
      adminRole,
    }))(req.body);

    const newInfo = Object.keys(filteredBody).reduce((acc, key) => {
      const obj = acc;
      if (filteredBody[key] !== undefined) {
        obj[key] = filteredBody[key];
      }
      return obj;
    }, {});

    const updatedAdminUser = await AdminUserModel.findByIdAndUpdate(id, {
      $set: newInfo,
    });

    await (new AdminLog({
      user: req.adminUser,
      type: "update",
      collectionName: "admin-user",
      objectAfter: JSON.stringify(updatedAdminUser),
    })).save();

    return res.status(200).send(updatedAdminUser);
  } catch (error) {
    console.log(error);

    if (!(error instanceof createError.HttpError)) {
      error = new createError.InternalServerError("Erro no servidor.");
    }

    return next(error);
  }
};

export const deleteById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const adminUserFound = await AdminUserModel.findById(id);
    if (!adminUserFound) {
      throw new createError.NotFound();
    }

    await AdminUserModel.findByIdAndDelete(id);

    await (new AdminLog({
      user: req.adminUser,
      type: "delete",
      collectionName: "admin-user",
      objectBefore: JSON.stringify(adminUserFound),
    })).save();

    return res.status(200).send(adminUserFound);
  } catch (error) {
    console.log(error);

    if (!(error instanceof createError.HttpError)) {
      error = new createError.InternalServerError("Erro no servidor.");
    }

    return next(error);
  }
};
