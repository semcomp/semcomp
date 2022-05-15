import userService from "../services/user.service";

import { formatUser } from "../lib/format-user";
import { handleValidationResult } from "../lib/handle-validation-result";
import { handleError } from "../lib/handle-error";

/**
 * formatUserResponse
 *
 * @param {object} user
 *
 * @return {object}
 */
function formatUserResponse(user) {
  return formatUser(user, [
    "email",
    "name",
    "course",
    "userTelegram",
    "permission",
  ]);
}

const userController = {
  update: async (req, res, next) => {
    try {
      handleValidationResult(req);

      const { _id, nusp, name, course } = req.user;
      const { userTelegram, permission } = req.body;

      const editedUser = await userService.update(
        _id,
        nusp,
        name,
        course,
        userTelegram,
        permission
      );

      return res.status(200).json(formatUserResponse(editedUser));
    } catch (error) {
      return handleError(error, next);
    }
  },
};

export default userController;
