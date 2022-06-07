import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import riddlethonGroupService from "../../services/riddlethon-group.service";

class RiddlethonGroupController {
  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const { name } = req.body;
      const { user } = req;

      const createdGroup = await riddlethonGroupService.create({
        name,
      });
      await riddlethonGroupService.join(
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

      const joinedGroup = await riddlethonGroupService.join(user.id, id);

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async leave(req, res, next) {
    try {
      const { user } = req;

      await riddlethonGroupService.leave(user.id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new RiddlethonGroupController();
