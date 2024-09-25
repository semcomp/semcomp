import AdminLog from "../../models/admin-log";
import { handleValidationResult } from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import saleService from "../../services/sale.service";
import adminLogService from "../../services/admin-log.service";
import { PaginationRequest } from "../../lib/pagination";

class SaleController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const foundEntities = await saleService.findWithUsedQuantity({
        pagination,
      });

      return res.status(200).json(foundEntities);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const createdEntity = await saleService.create(req.body);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "create",
        collectionName: "sales",
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

      const entity = await saleService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          entity[key] = req.body[key];
        }
      }

      const updatedEntity = await saleService.update(entity);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "sales",
        objectBefore: JSON.stringify(entity),
        objectAfter: JSON.stringify(updatedEntity),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(updatedEntity);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new SaleController();
