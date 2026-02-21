import { handleError } from "../../lib/handle-error";
import adminLogService from "../../services/admin-log.service";

class LogController {
  public async list(req, res, next) {
    try {
      const adminLogs = await adminLogService.find();

      return res.status(200).json(adminLogs);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new LogController();
