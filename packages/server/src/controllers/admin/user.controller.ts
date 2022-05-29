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

class UserController {
  public async list(req, res) {
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

  public async listForEnterprise(req, res) {
    const usersFound = await userService.find({ permission: true });

    return res.status(200).json(usersFound);
  };

  public async get(req, res) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      return res.status(200).json(userFound);
    } catch (e) {
      if (e.statusCode) {
        return res.status(e.statusCode).json(e);
      }
      return res.status(500).json(e);
    }
  };

  public async getAttendance(req, res) {
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
    } catch (e) {
      if (e.statusCode) {
        return res.status(e.statusCode).json(e);
      }
      return res.status(500).json(e);
    }
  };

  public async addUserAchievement(req, res) {
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
    } catch (e) {
      if (e.statusCode) {
        return res.status(e.statusCode).json(e);
      }
      return res.status(500).json(e);
    }
  };

  public async update(req, res) {
    try {
      const { id } = req.params;

      const user = await userService.findById(id);

      for (const key of Object.keys(req.body)) {
        if (req.body[key] !== undefined) {
          user[key] = req.body[key];
        }
      }

      const updatedUser = await userService.update(user);

      await (new AdminLog({
        user: req.adminUser,
        type: "update",
        collectionName: "user",
        objectAfter: JSON.stringify(updatedUser),
      })).save();

      return res.status(200).send(updatedUser);
    } catch (e) {
      if (e.statusCode) {
        return res.status(e.statusCode).json(e);
      }
      return res.status(500).json(e);
    }
  };

  public async deleteById(req, res) {
    try {
      const { id } = req.params;

      const userFound = await userService.findById(id);
      if (!userFound) {
        throw new HttpError(404, ["Usuário não encontrado."]);
      }

      await userService.delete(userFound);

      await (new AdminLog({
        user: req.adminUser,
        type: "delete",
        collectionName: "user",
        objectBefore: JSON.stringify(userFound),
      })).save();

      return res.status(200).send(userFound);
    } catch (e) {
      if (e.statusCode) {
        return res.status(e.statusCode).json(e);
      }
      return res.status(500).json(e);
    }
  };
}

export default new UserController();
