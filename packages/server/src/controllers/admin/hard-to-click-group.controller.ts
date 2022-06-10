import AdminLog from "../../models/admin-log";

import { handleError } from "../../lib/handle-error";
import HttpError from "../../lib/http-error";
import adminLogService from "../../services/admin-log.service";
import hardToClickGroupService from "../../services/hard-to-click-group.service";

const RESOURCE = 'hardToClick-group';

class HardToClickGroupController {
  public async list(req, res, next) {
    try {
      const entities = await hardToClickGroupService.findWithInfo();

      return res.status(200).json(entities);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const entity = await hardToClickGroupService.findById(id);
      if (!entity) {
        throw new HttpError(404, []);
      }

      await hardToClickGroupService.delete(entity);

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

export default new HardToClickGroupController();
