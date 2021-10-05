const userService = require("../services/user.service");

const { formatUser } = require("../lib/format-user");
const { handleValidationResult } = require("../lib/handle-validation-result");
const { handleError } = require("../lib/handle-error");

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

module.exports = userController;
