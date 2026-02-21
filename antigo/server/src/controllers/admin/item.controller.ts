import AdminLog from "../../models/admin-log";
import adminLogService from "../../services/admin-log.service";
import { handleValidationResult } from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import { PaginationRequest } from "../../lib/pagination";
import itemService from "../../services/item.service";

class ItemController {
    public async list(req, res, next) {
        try {
            const pagination = new PaginationRequest(+req.query.page,+req.query.items);

            const foundEntities = await itemService.find({ pagination });

            return res.status(200).json(foundEntities);
        } catch (error) {
            return handleError(error, next);
        }
    }

    public async create(req, res, next) {
        try {
            handleValidationResult(req);

            const createdEntity = await itemService.create(req.body);

            const adminLog: AdminLog = {
                adminId: req.adminUser.id,
                type: "create",
                collectionName: "item",
                objectAfter: JSON.stringify(createdEntity),
            };
            await adminLogService.create(adminLog);

            return res.status(200).json(createdEntity); // Devia ser 201
        } catch (error) {
            return handleError(error, next);
        }
    }

    public async delete(req, res, next) {
        try {
            const { id } = req.params;
            const entity = await itemService.delete(id);


            const adminLog: AdminLog = {
              adminId: req.adminUser.id,
              type: "delete",
              collectionName: "item",
              objectBefore: JSON.stringify(entity),
            };
            await adminLogService.create(adminLog);

            return res.status(200).json(entity);
        } catch (error) {
            return handleError(error, next);
        }
    }
}

export default new ItemController();
