import AdminLog from "../../models/admin-log";

import { handleError } from "../../lib/handle-error";
import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import gameGroupService from "../../services/game-group.service";
import gameGroupCompletedQuestionService from "../../services/game-group-completed-question.service";
import { PaginationRequest } from "../../lib/pagination";

const RESOURCE = 'game-group';

class GameGroupController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const entities = await gameGroupService.findWithInfo({ pagination });

      return res.status(200).json(entities);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async listWinner(req, res, next) {
    try {
      const winner = await gameGroupCompletedQuestionService.getWinnersByGame();
      
      return res.status(200).json(winner);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const entity = await gameGroupService.findById(id);
      if (!entity) {
        throw new HttpError(404, []);
      }

      await gameGroupService.delete(entity);

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

  public async getLastQuestionByGroup(req, res, next) {
    const pagination = new PaginationRequest(
      +req.query.page,
      +req.query.items,
    );

    try {
      const lastIndex = await gameGroupCompletedQuestionService.getLastQuestionByGroup({ pagination });
      return res.status(200).json(lastIndex);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new GameGroupController();
