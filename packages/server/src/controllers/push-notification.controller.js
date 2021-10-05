const deviceService = require("../services/device.service");

const { encrypt } = require("../lib/crypto");
const { handleError } = require("../lib/handle-error");

const pushNotificationController = {
  subscribe: async (req, res, next) => {
    try {
      const { token } = req.body;

      const createdDevice = await deviceService.create(
        encrypt(token),
        req.user
      );

      return res.status(200).json(createdDevice);
    } catch (error) {
      return handleError(error, next);
    }
  },
};

module.exports = pushNotificationController;
