import userService from "../services/user.service";

import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";
import User from "../models/user";
import House from "../models/house";

class UserController {
  public async update(req, res, next) {
    try {
      handleValidationResult(req);

      const { name, course } = req.user;
      const { telegram, permission } = req.body;

      req.user.name = name;
      req.user.course = course;
      req.user.telegram = telegram;
      req.user.permission = permission;

      const editedUser = await userService.update(req.user);
      const userHouse = await userService.getUserHouse(req.user.id);

      return res.status(200).json(UserController.mapUserResponse(editedUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public static mapUserResponse(user: User, house: House) {
    return {
      email: user.email,
      name: user.name,
      id: user.id,
      course: user.course,
      permission: user.permission,
      discord: user.discord,
      telegram: user.telegram,
      house: {
        name: house.name,
        description: house.description,
        telegramLink: house.telegramLink,
      },
    };
  }
}

export default new UserController();
