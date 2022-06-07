import AdminLog from "../../models/admin-log";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import riddlethonQuestionService from "../../services/riddlethon-question.service";

const RESOURCE = 'riddlethon-question';

class RiddlethonQuestionController {
  public async list(req, res, next) {
    try {
      const entities = await riddlethonQuestionService.find();

      return res.status(200).json(entities);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const entity = await riddlethonQuestionService.findOne({ index: req.body.index });
      if (entity) {
        throw new HttpError(401, []);
      }

      const createdEntity = await riddlethonQuestionService.create(req.body);

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

      const entity = await riddlethonQuestionService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          entity[key] = req.body[key];
        }
      }

      const updatedEntity = await riddlethonQuestionService.update(entity);

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

      const entity = await riddlethonQuestionService.findById(id);
      if (!entity) {
        throw new HttpError(404, []);
      }

      await riddlethonQuestionService.delete(entity);

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

export default new RiddlethonQuestionController();
