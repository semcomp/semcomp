import AdminLog from "../../models/admin-log";
import { handleError } from "../../lib/handle-error";
import { PaginationRequest } from "../../lib/pagination";
import { handleValidationResult } from "../../lib/handle-validation-result";
import adminLogService from "../../services/admin-log.service";
import gameConfigService from "../../services/game-config.service";

class GameConfigController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const foundEntities = await gameConfigService.find({ pagination });

      return res.status(200).json(foundEntities);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const createdEntity = await gameConfigService.create(req.body);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "create",
        collectionName: "game-config",
        objectAfter: JSON.stringify(createdEntity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(createdEntity);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async update(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const entity = await gameConfigService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          entity[key] = req.body[key];
        }
      }

      const updatedEntity = await gameConfigService.update(entity);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "game-config",
        objectBefore: JSON.stringify(entity),
        objectAfter: JSON.stringify(updatedEntity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(updatedEntity);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async delete(req, res, next) {
    try {
      const { id } = req.params;
      const entity = await gameConfigService.delete(id);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "delete",
        collectionName: "game-config",
        objectBefore: JSON.stringify(entity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(entity);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new GameConfigController();
