import AdminLog from "../../models/admin-log";
import donationService from "../../services/donation.service";
import houseService from "../../services/house.service";
import adminLogService from "../../services/admin-log.service";
import { handleValidationResult } from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import { PaginationRequest } from "../../lib/pagination";
import CalculatorService from "../../lib/calculate-multiplier";
import itemService from "../../services/item.service";

class DonationController {
    public async list(req, res, next) {
        try {
            const pagination = new PaginationRequest(+req.query.page,+req.query.items);

            const foundEntities = await donationService.find({ pagination });

            return res.status(200).json(foundEntities);
        } catch (error) {
            return handleError(error, next);
        }
    }

    public async create(req, res, next) {
        try {
            handleValidationResult(req);

            const donationData = req.body;

            const item = donationData.item;

            const multiplier = CalculatorService.calculateMultiplier(item, item.tier);
            const points = multiplier * item.value * donationData.quantity;

            donationData.points = points;

            const house = await houseService.findById(donationData.houseId);

            const updatedHouse = await houseService.addHousePoints(house, points);

            const houseAdminLog: AdminLog = {
              adminId: req.adminUser.id,
              type: "add-points",
              collectionName: "house",
              objectBefore: JSON.stringify(house),
              objectAfter: JSON.stringify(updatedHouse),
            };
            await adminLogService.create(houseAdminLog);

            const createdEntity = await donationService.create(req.body);

            item.tierQuantity += donationData.quantity;
            item.totalQuantity += donationData.quantity;

            if (CalculatorService.verifyDemote(item)) {
                const nextTier = CalculatorService.findNextTier(item.tier);
                if (nextTier != null) {
                    item.tier = nextTier;
                    item.tierQuantity = 0;
                }
            }

            itemService.update(item.id, item);

            const adminLog: AdminLog = {
                adminId: req.adminUser.id,
                type: "create",
                collectionName: "donation",
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
            handleValidationResult(req);

            const { id } = req.params;

            const donationData = await donationService.findById(id);

            const house = await houseService.findById(donationData.houseId);

            const updatedHouse = houseService.subtractHousePoints(house, donationData.points);

            const houseAdminLog: AdminLog = {
              adminId: req.adminUser.id,
              type: "subtract-points",
              collectionName: "house",
              objectBefore: JSON.stringify(house),
              objectAfter: JSON.stringify(updatedHouse),
            };
            await adminLogService.create(houseAdminLog);

            const entity = await donationService.delete(donationData.id);

            const adminLog: AdminLog = {
              adminId: req.adminUser.id,
              type: "delete",
              collectionName: "donation",
              objectBefore: JSON.stringify(entity),
            };
            await adminLogService.create(adminLog);

            return res.status(200).json(entity);
        } catch (error) {
            return handleError(error, next);
        }
    }
}

export default new DonationController();
