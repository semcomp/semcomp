import { validationResult } from "express-validator";
import webpush from "web-push";

import DeviceModel from "../../models/device";

import { decrypt } from "../../lib/crypto";

const vapidKeys = {
  publicKey:
    "BNSy8UPqaKQyzXS5hHlaEFVg_Kt_qgae2JevYo2-uuQsJ8nglDvo2a0UumaPvrmNIvMVmYPY-kHR3hPG_FU8CsI",
  privateKey: "jO19SKv8MlbgJjp0e5pkTdyVnjhc_F-RP3_Bv6RBdB0",
};

webpush.setVapidDetails(
  "mailto:noreply.semcomp@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const sendPushNotification = async (req, res) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    return res.status(400).json({ errors: validationErrors.array() });
  }

  try {
    const { title, text, image, tag, url } = req.body;

    const payload = JSON.stringify({
      title,
      text,
      image,
      tag,
      url,
    });

    const devices = await DeviceModel.find();

    const promises = [];
    for (let i = 0; i < devices.length; i += 1) {
      webpush.sendNotification(JSON.parse(decrypt(devices[i].token)), payload);
    }

    await Promise.all(promises);

    return res.status(200).json();
  } catch (e) {
    if (e.statusCode) {
      return res.status(e.statusCode).json(e);
    }
    return res.status(500).json(e);
  }
};
