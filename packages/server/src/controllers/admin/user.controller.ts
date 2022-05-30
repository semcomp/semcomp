import AdminLog from "../../models/admin-log";

import HttpError from "../../lib/http-error";
import eventService from "../../services/event.service";
import attendanceService from "../../services/attendance.service";
import userService from "../../services/user.service";
import houseService from "../../services/house.service";
import User from "../../models/user";
import houseMemberService from "../../services/house-member.service";
import achievementService from "../../services/achievement.service";
import AchievementTypes from "../../lib/constants/achievement-types-enum";
import userAchievementService from "../../services/user-achievement.service";
import UserAchievement from "../../models/user-achievement";
import { handleError } from "../../lib/handle-error";
import adminLogService from "../../services/admin-log.service";

class UserController {
  public async list(req, res, next) {
    const usersFound = await userService.find();
    const housesFound = await houseService.find();
    const houseMembersFound = await houseMemberService.find();

    const users: (User & {
      house: {
        name: string,
      },
    })[] = [];
    for (const user of usersFound) {
      let userHouse = "Não possui";
      const userHouseMember = houseMembersFound.find((houseMember) => {
        return houseMember.userId === user.id;
      });

      userHouse = housesFound.find((house) => {
        return house.id === userHouseMember.houseId;
      }).name;

      users.push({
        ...user,
        house: {
          name: userHouse,
        },
      });
    }

    return res.status(200).json({
      users,
    });
  };

  public async listForEnterprise(req, res, next) {
    const usersFound = await userService.find({ permission: true });

    return res.status(200).json(usersFound);
  };

  public async get(req, res, next) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      return res.status(200).json(userFound);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async getAttendance(req, res, next) {
    try {
      const userId = req.params.id;

      const user = await userService.findById(userId);
      if (!user) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      const attendedEvents = await attendanceService.find(
        {
          userId,
        }
      );

      const totalNumEvents = await eventService.count();
      let attendancePercent = 100 * (attendedEvents.length / totalNumEvents);
      attendancePercent = Math.round(attendancePercent * 100) / 100; // truncate to precision 2

      return res.status(200).json({ attendancePercent, attendedEvents, user });
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async addUserAchievement(req, res, next) {
    try {
      const { userId, achievementId } = req.params;

      const user = await userService.findById(userId);
      if (!user) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }
      const achievement = (await achievementService.find({
        id: achievementId,
        type: AchievementTypes.INDIVIDUAL,
      }))[0];
      if (!achievement) {
        throw new HttpError(404, ["Conquista não encontrado."]);
      }

      let userAchievement: UserAchievement = (await userAchievementService.find({
        userId: user.id,
        achievementId: achievement.id,
      }))[0];
      if (userAchievement) {
        throw new HttpError(400, ["Conquista já completa."]);
      }

      userAchievement = {
        userId: user.id,
        achievementId: achievement.id,
      };
      await userAchievementService.create(userAchievement);

      return res.status(200).send(user);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async update(req, res, next) {
    try {
      const { id } = req.params;

      const user = await userService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          user[key] = req.body[key];
        }
      }

      const updatedUser = await userService.update(user);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "update",
        collectionName: "user",
        objectAfter: JSON.stringify(updatedUser),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(updatedUser);
    } catch (error) {
      return handleError(error, next);
    }
  };

  public async deleteById(req, res, next) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      await userService.delete(userFound);

      const adminLog: AdminLog = {
        adminId: req.adminUser.id,
        type: "delete",
        collectionName: "user",
        objectBefore: JSON.stringify(userFound),
      };
      await adminLogService.create(adminLog);

      return res.status(200).send(userFound);
    } catch (error) {
      return handleError(error, next);
    }
  };
}

export default new UserController();
