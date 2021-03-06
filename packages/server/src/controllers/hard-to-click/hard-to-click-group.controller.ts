import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import hardToClickGroupService from "../../services/hard-to-click-group.service";

class HardToClickGroupController {
  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const { name } = req.body;
      const { user } = req;

      const createdGroup = await hardToClickGroupService.create({
        name,
      });
      await hardToClickGroupService.join(
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

      const joinedGroup = await hardToClickGroupService.join(user.id, id);

      return res.status(200).json(joinedGroup);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async leave(req, res, next) {
    try {
      const { user } = req;

      await hardToClickGroupService.leave(user.id);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new HardToClickGroupController();
