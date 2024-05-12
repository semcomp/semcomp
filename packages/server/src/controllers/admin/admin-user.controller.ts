import AdminLog from "../../models/admin-log";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import adminUserService from "../../services/admin-user.service";
import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import { PaginationRequest } from "../../lib/pagination";

class AdminUserController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const adminUsers = await adminUserService.find({pagination});
      return res.status(200).json(adminUsers);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const foundUser = await adminUserService.findOne({ email: req.body.email });
      if (foundUser) {
        throw new HttpError(409, ['Email já cadastrado.']);
      }

      const createdUser = await adminUserService.create(req.body);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "create",
        collectionName: "admin-user",
        objectAfter: JSON.stringify(createdUser),
      };
      await adminLogService.create(adminLog);

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

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "admin-user",
        objectAfter: JSON.stringify(updatedAdminUser),
      };
      await adminLogService.create(adminLog);

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

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "delete",
        collectionName: "admin-user",
        objectBefore: JSON.stringify(adminUserFound),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(adminUserFound);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async findRoleById(req, res, next) {
    try {
      const { id } = req.params;

      const adminUserFound = await adminUserService.findById(id);
      if (!adminUserFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }
      
      return res.status(200).send((adminUserFound.adminRole));
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new AdminUserController();
