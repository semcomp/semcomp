import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import gameGroupService from "../../services/game-group.service";

class GameGroupController {
  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const { game } = req.params;
      const { name } = req.body;
      const { user } = req;

      const createdGroup = await gameGroupService.create({
        game, name
      });
      await gameGroupService.join(
        user.id,
        createdGroup.id,
      );

      return res.status(200).json(createdGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async join(req, res, next) {
    try {
      const { id } = req.query;
      const { user } = req;

      const joinedGroup = await gameGroupService.join(user.id, id);

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async leave(req, res, next) {
    try {
      const { user } = req;

      await gameGroupService.leave(user.id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new GameGroupController();
