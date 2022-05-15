import riddleGroupService from "../../services/riddle-group.service";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";

export default {
  list: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const groupsFound = await riddleGroupService.get();

      return res.status(200).json(groupsFound);
    } catch (error) {
      return handleError(error, next);
    }
  },
  delete: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const groupDeleted = await riddleGroupService.adminDelete(
        id,
        req.adminUser
      );

      return res.status(200).send(groupDeleted);
    } catch (error) {
      return handleError(error, next);
    }
  },
};
