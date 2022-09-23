import createError from "http-errors";

import AdminLog from "../../models/admin-log";

import {
  handleValidationResult,
} from "../../lib/handle-validation-result";
import { handleError } from "../../lib/handle-error";
import houseService from "../../services/house.service";
import userService from "../../services/user.service";
import houseMemberService from "../../services/house-member.service";
import achievementService from "../../services/achievement.service";
import AchievementTypes from "../../lib/constants/achievement-types-enum";
import houseAchievementService from "../../services/house-achievement.service";
import HouseAchievement from "../../models/house-achievement";
import adminLogService from "../../services/admin-log.service";
import { PaginationRequest } from "../../lib/pagination";

class HouseController {
  public async list(req, res, next) {
    try {
      const pagination = new PaginationRequest(
        +req.query.page,
        +req.query.items,
      );

      const foundHouses = await houseService.find({ pagination });

      return res.status(200).json(foundHouses);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async create(req, res, next) {
    try {
      handleValidationResult(req);

      const createdHouse = await houseService.create(req.body);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "create",
        collectionName: "house",
        objectAfter: JSON.stringify(createdHouse),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(createdHouse);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async update(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;

      const house = await houseService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          house[key] = req.body[key];
        }
      }

      const updatedHouse = await houseService.update(house);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "house",
        objectBefore: JSON.stringify(house),
        objectAfter: JSON.stringify(updatedHouse),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json(updatedHouse);
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async assignHouses(req, res, next) {
    try {
      const users = await userService.find({ pagination: new PaginationRequest(1, 9999) });
      const houseMembers = await houseMemberService.find();

      for (const user of users.getEntities()) {
        if (houseMembers.find((member) => {
          return member.userId === user.id;
        })) {
          await houseMemberService.assignUserHouse(user.id);
        }
      }

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async addPoints(req, res, next) {
    try {
      handleValidationResult(req);

      const { id } = req.params;
      const { points } = req.body;

      const house = await houseService.findById(id);

      const updatedHouse = await houseService.addHousePoints(house, points);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "add-points",
        collectionName: "house",
        objectBefore: JSON.stringify(house),
        objectAfter: JSON.stringify(updatedHouse),
      };
      await adminLogService.create(adminLog);

      return res.status(200).json();
    } catch (error) {
      return handleError(error, next);
    }
  }

  public async addHouseAchievement(req, res, next) {
    try {
      handleValidationResult(req);

      const { houseId, achievementId } = req.params;

      const house = await houseService.findById(houseId);
      if (!house) {
        throw new createError.NotFound("Casa não encontrada.");
      }
      const achievement = await achievementService.find({
        id: achievementId,
        type: AchievementTypes.CASA,
      });
      if (!achievement) {
        throw new createError.NotFound("Conquista não encontrada.");
      }

      if (await houseAchievementService.findOne({ houseId, achievementId })) {
        throw new createError.BadRequest("A casa já possui essa conquista.");
      }

      const houseAchievement: HouseAchievement = {
        houseId,
        achievementId,
      }
      await houseAchievementService.create(houseAchievement);

      return res.status(200).json(house);
    } catch (error) {
      return handleError(error, next);
    }
  }
}

export default new HouseController();
