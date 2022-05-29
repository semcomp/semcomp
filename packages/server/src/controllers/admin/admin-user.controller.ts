import AdminLog from "../../models/admin-log";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import adminUserService from "../../services/admin-user.service";
import HttpError from "../../lib/http-error";

class AdminUserController {
  public async list(req, res, next) {
    try {
      const adminUsers = await adminUserService.find();

      return res.status(200).json({
        adminUsers,
      });
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const foundUser = (await adminUserService.find({ email: req.body.email }))[0];
      if (foundUser) {
        throw new HttpError(401, []);
      }

      const createdUser = await adminUserService.create(req.body);

      await (new AdminLog({
        user: req.adminUser,
        type: "update",
        collectionName: "admin-user",
        objectAfter: JSON.stringify(createdUser),
      })).save();

      return res.status(200).send(createdUser);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async update(req, res, next) {
    try {
      const { id } = req.params;

      const adminUser = await adminUserService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          adminUser[key] = req.body[key];
        }
      }

      const updatedAdminUser = await adminUserService.update(adminUser);

      await (new AdminLog({
        user: req.adminUser,
        type: "update",
        collectionName: "admin-user",
        objectAfter: JSON.stringify(updatedAdminUser),
      })).save();

      return res.status(200).send(updatedAdminUser);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const adminUserFound = await adminUserService.findById(id);
      if (!adminUserFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      await adminUserService.delete(adminUserFound);

      await (new AdminLog({
        user: req.adminUser,
        type: "delete",
        collectionName: "admin-user",
        objectBefore: JSON.stringify(adminUserFound),
      })).save();

      return res.status(200).send(adminUserFound);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new AdminUserController();
