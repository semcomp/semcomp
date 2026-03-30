import AdminLog from "../../models/admin-log";

import { handleError } from "../../lib/handle-error";
import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import treasureHuntImage from "../../services/treasure-hunt-image.service";
import { PaginationRequest } from "../../lib/pagination";

const RESOURCE = 'treasure-hunt-image';

class GameQuestionController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const entities = await treasureHuntImage.find({ pagination });

      return res.status(200).json(entities);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async getOne(req, res, next) {
    try {
      const { id } = req.params;

      const entity = await treasureHuntImage.findById(id);

      return res.status(200).json(entity);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async generateQRCodes(req, res, next) {
    try {
      const { id } = req.params;

      treasureHuntImage.generateQrCodes(id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async create(req, res, next) {
    try {
      const createdEntity = await treasureHuntImage.create(req.body);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "create",
        collectionName: RESOURCE,
        objectAfter: JSON.stringify(createdEntity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(createdEntity);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async updateById(req, res, next) {
    try {
      const { id } = req.params;

      const entity = await treasureHuntImage.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          entity[key] = req.body[key];
        }
      }

      const updatedEntity = await treasureHuntImage.update(entity);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: RESOURCE,
        objectAfter: JSON.stringify(updatedEntity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(updatedEntity);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const entity = await treasureHuntImage.findById(id);
      if (!entity) {
        throw new HttpError(404, []);
      }

      await treasureHuntImage.delete(entity);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "delete",
        collectionName: RESOURCE,
        objectBefore: JSON.stringify(entity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(entity);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new GameQuestionController();
