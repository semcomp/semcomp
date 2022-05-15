import deviceService from "../services/device.service";

import { encrypt } from "../lib/crypto";
import { handleError } from "../lib/handle-error";

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

export default pushNotificationController;
