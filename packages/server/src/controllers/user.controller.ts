import userService from "../services/user.service";

import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";
import User from "../models/user";
import House from "../models/house";

class UserController {
  public async update(req, res, next) {
    try {
      handleValidationResult(req);

      const { course } = req.user;
      const { name, email, telegram, permission, wantNameTag } = req.body;

      if (name) {
        req.user.name = name;
      }
      if (course) {
        req.user.course = course;
      }
      if (telegram) {
        req.user.telegram = telegram;
      }
      if (permission) {
        req.user.permission = permission;
      }
      if (email) {
        req.user.email = email;
      }
      if(wantNameTag != null){
        req.user.wantNameTag = wantNameTag;
      }

      const editedUser = await userService.update(req.user);
      const userHouse = await userService.getUserHouse(req.user.id);

      return res.status(200).json(UserController.mapUserResponse(editedUser, userHouse));
    } catch (error) {
      return handleError(error, next);
    }
  }

  public static mapUserResponse(user: User, house?: House) {
    return {
      email: user.email,
      name: user.name,
      id: user.id,
      course: user.course,
      permission: user.permission,
      discord: user.discord,
      telegram: user.telegram,
      house: house ? {
        name: house.name,
        description: house.description,
        telegramLink: house.telegramLink,
      } : null,
      wantNameTag: user.wantNameTag,
    };
  }
}

export default new UserController();
